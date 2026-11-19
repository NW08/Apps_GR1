import { Injectable, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import type { RealtimeChannel, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

import { environment } from '../../environments/environment';
import type {
  AvailabilityStatus,
  ChatMessage,
  MessageReaction,
  MessageType,
  Profile,
  Room,
  RoomMember,
} from '../models/chat.models';

export const isExpired = (m: Pick<ChatMessage, 'expires_at'>, now = Date.now()): boolean =>
  !!m.expires_at && new Date(m.expires_at).getTime() <= now;

export interface SendMessagePayload {
  roomId: string;
  type: MessageType;
  content?: string;
  mediaUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationLabel?: string | null;
  replyToId?: string | null;
  expiresInSeconds?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  readonly isConfigured = signal<boolean>(
    !environment.supabase.url.includes('YOUR_PROJECT_ID') &&
      !environment.supabase.anonKey.includes('YOUR_SUPABASE_ANON_KEY'),
  );

  readonly session = signal<Session | null>(null);
  readonly currentUser = signal<User | null>(null);
  readonly currentProfile = signal<Profile | null>(null);
  readonly passwordRecovery = signal<boolean>(false);

  private client: SupabaseClient | null = null;
  private sessionInitPromise: Promise<Session | null> | null = null;

  constructor() {
    if (this.isConfigured()) {
      this.client = createClient(environment.supabase.url, environment.supabase.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      this.initAuthListener();
    }
  }

  private getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Supabase no está configurado. Completa SUPABASE_URL y SUPABASE_ANON_KEY en el archivo .env.');
    }
    return this.client;
  }

  private initAuthListener(): void {
    const client = this.getClient();
    client.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') this.passwordRecovery.set(true);
      this.session.set(session);
      this.currentUser.set(session?.user ?? null);
      if (session?.user) {
        // Supabase recomienda no llamar al cliente dentro de este callback (puede bloquearse).
        const userId = session.user.id;
        setTimeout(() => this.loadCurrentProfile(userId).catch(() => undefined));
      } else {
        this.currentProfile.set(null);
      }
    });
  }

  async ensureSessionLoaded(): Promise<Session | null> {
    if (!this.isConfigured()) {
      return null;
    }
    if (!this.sessionInitPromise) {
      this.sessionInitPromise = this.getClient()
        .auth.getSession()
        .then(async ({ data }) => {
          this.session.set(data.session);
          this.currentUser.set(data.session?.user ?? null);
          if (data.session?.user) {
            await this.loadCurrentProfile(data.session.user.id);
          }
          return data.session;
        });
    }
    return this.sessionInitPromise;
  }

  async signUp(email: string, password: string, displayName: string, username: string): Promise<void> {
    const client = this.getClient();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          username,
        },
      },
    });
    if (error) throw error;
    if (data.session?.user) {
      this.session.set(data.session);
      this.currentUser.set(data.session.user);
      await this.loadCurrentProfile(data.session.user.id);
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    const client = this.getClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.session.set(data.session);
    this.currentUser.set(data.user);
    if (data.user) {
      await this.loadCurrentProfile(data.user.id);
    }
  }

  async resetPassword(email: string): Promise<void> {
    const client = this.getClient();
    // En el APK el origen es http://localhost, así que el enlace del correo debe abrir la app web.
    const baseUrl = environment.appUrl || (Capacitor.isNativePlatform() ? '' : window.location.origin);
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: baseUrl ? `${baseUrl}/auth` : undefined,
    });
    if (error) throw error;
  }

  async updatePassword(password: string): Promise<void> {
    const { error } = await this.getClient().auth.updateUser({ password });
    if (error) throw error;
    this.passwordRecovery.set(false);
  }

  async signOut(): Promise<void> {
    if (!this.client) return;
    await this.client.auth.signOut();
    this.session.set(null);
    this.currentUser.set(null);
    this.currentProfile.set(null);
    this.sessionInitPromise = null;
  }

  async loadCurrentProfile(userId: string): Promise<Profile | null> {
    const client = this.getClient();
    const { data, error } = await client.from('profiles').select('*').eq('id', userId).maybeSingle();

    if (error) throw error;
    this.currentProfile.set(data as Profile | null);
    return data as Profile | null;
  }

  async updateProfile(updates: {
    display_name?: string;
    username?: string;
    bio?: string;
    status_text?: string;
    availability?: AvailabilityStatus;
    avatar_url?: string | null;
  }): Promise<Profile> {
    const client = this.getClient();
    const user = this.currentUser();
    if (!user) throw new Error('Sesión no iniciada');

    const { data, error } = await client
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('*')
      .single();

    if (error) throw error;
    const profile = data as Profile;
    this.currentProfile.set(profile);
    return profile;
  }

  async uploadAvatar(file: Blob, extension: string): Promise<string> {
    const client = this.getClient();
    const user = this.currentUser();
    if (!user) throw new Error('Sesión no iniciada');

    const path = `${user.id}/avatar-${Date.now()}.${extension}`;
    const { error } = await client.storage.from('avatars').upload(path, file, {
      contentType: file.type || `image/${extension}`,
    });
    if (error) throw error;

    const { data } = client.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  }

  async uploadChatMedia(file: Blob, fileName: string, folder: 'images' | 'files'): Promise<string> {
    const client = this.getClient();
    const user = this.currentUser();
    if (!user) throw new Error('Sesión no iniciada');

    const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${folder}/${user.id}/${Date.now()}-${cleanName}`;
    const { error } = await client.storage.from('chat-media').upload(path, file, {
      contentType: file.type || 'application/octet-stream',
    });
    if (error) throw error;

    const { data } = client.storage.from('chat-media').getPublicUrl(path);
    return data.publicUrl;
  }

  private generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let suffix = '';
    for (let i = 0; i < 4; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `NOVA-${suffix}`;
  }

  async getRooms(): Promise<Room[]> {
    const client = this.getClient();
    const { data, error } = await client
      .from('rooms')
      .select('*, room_members(count)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((row) => {
      const typed = row as Room & { room_members?: { count: number }[] };
      return {
        ...typed,
        member_count: typed.room_members?.[0]?.count ?? 0,
      };
    });
  }

  async getRoomById(roomId: string): Promise<Room | null> {
    const client = this.getClient();
    const { data, error } = await client.from('rooms').select('*').eq('id', roomId).maybeSingle();
    if (error) throw error;
    return data as Room | null;
  }

  async createRoom(input: { name: string; description: string; topic: string; isPrivate: boolean }): Promise<Room> {
    const client = this.getClient();
    const user = this.currentUser();
    if (!user) throw new Error('Sesión no iniciada');

    const inviteCode = this.generateInviteCode();
    const { data, error } = await client
      .from('rooms')
      .insert({
        name: input.name.trim(),
        description: input.description.trim(),
        topic: input.topic.trim() || 'General',
        is_private: input.isPrivate,
        invite_code: inviteCode,
        created_by: user.id,
      })
      .select('*')
      .single();

    if (error) throw error;
    const room = data as Room;

    const { error: memberError } = await client.from('room_members').insert({
      room_id: room.id,
      user_id: user.id,
      role: 'owner',
    });
    if (memberError) throw memberError;

    return room;
  }

  async joinPublicRoom(roomId: string): Promise<void> {
    const client = this.getClient();
    const user = this.currentUser();
    if (!user) throw new Error('Sesión no iniciada');

    // ignoreDuplicates evita sobrescribir el rol (owner) y no requiere política UPDATE.
    const { error } = await client
      .from('room_members')
      .upsert(
        { room_id: roomId, user_id: user.id, role: 'member' },
        { onConflict: 'room_id,user_id', ignoreDuplicates: true },
      );
    if (error) throw error;
  }

  async joinRoomByCode(code: string): Promise<Room> {
    const client = this.getClient();
    const { data, error } = await client.rpc('join_room_by_code', {
      p_code: code.trim().toUpperCase(),
    });
    if (error) throw error;
    return data as Room;
  }

  async leaveRoom(roomId: string): Promise<void> {
    const client = this.getClient();
    const user = this.currentUser();
    if (!user) return;
    const { error } = await client.from('room_members').delete().eq('room_id', roomId).eq('user_id', user.id);
    if (error) throw error;
  }

  async getRoomMembers(roomId: string): Promise<RoomMember[]> {
    const client = this.getClient();
    const { data, error } = await client.from('room_members').select('*, profile:profiles(*)').eq('room_id', roomId);

    if (error) throw error;
    return (data ?? []) as RoomMember[];
  }

  async getMessages(roomId: string, limit = 80): Promise<ChatMessage[]> {
    const client = this.getClient();
    const { data, error } = await client
      .from('messages')
      .select('*, sender:profiles(*), reactions:message_reactions(*)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const now = Date.now();
    const messages = ((data ?? []) as ChatMessage[]).filter((m) => !isExpired(m, now)).reverse();

    const byId = new Map(messages.map((m) => [m.id, m]));
    return messages.map((m) => ({
      ...m,
      reply_to: m.reply_to_id ? (byId.get(m.reply_to_id) ?? null) : null,
    }));
  }

  async sendMessage(payload: SendMessagePayload): Promise<ChatMessage> {
    const client = this.getClient();
    const user = this.currentUser();
    if (!user) throw new Error('Sesión no iniciada');

    const expiresAt = payload.expiresInSeconds
      ? new Date(Date.now() + payload.expiresInSeconds * 1000).toISOString()
      : null;

    const { data, error } = await client
      .from('messages')
      .insert({
        room_id: payload.roomId,
        sender_id: user.id,
        type: payload.type,
        content: payload.content ?? '',
        media_url: payload.mediaUrl ?? null,
        file_name: payload.fileName ?? null,
        file_size: payload.fileSize ?? null,
        mime_type: payload.mimeType ?? null,
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
        location_label: payload.locationLabel ?? null,
        reply_to_id: payload.replyToId ?? null,
        expires_at: expiresAt,
      })
      .select('*, sender:profiles(*), reactions:message_reactions(*)')
      .single();

    if (error) throw error;
    return data as ChatMessage;
  }

  async togglePinMessage(messageId: string, isPinned: boolean): Promise<void> {
    const client = this.getClient();
    const { error } = await client.from('messages').update({ is_pinned: !isPinned }).eq('id', messageId);
    if (error) throw error;
  }

  async deleteMessage(messageId: string): Promise<void> {
    const client = this.getClient();
    const { error } = await client.from('messages').delete().eq('id', messageId);
    if (error) throw error;
  }

  async toggleReaction(messageId: string, emoji: string, alreadyReacted: boolean): Promise<void> {
    const client = this.getClient();
    const user = this.currentUser();
    if (!user) throw new Error('Sesión no iniciada');

    if (alreadyReacted) {
      const { error } = await client
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji);
      if (error) throw error;
    } else {
      const { error } = await client.from('message_reactions').insert({
        message_id: messageId,
        user_id: user.id,
        emoji,
      });
      if (error) throw error;
    }
  }

  // Realtime no aplica filtros a los DELETE y, con RLS, solo envía la clave primaria;
  // por eso los borrados se escuchan sin filtro y se comparan por id en el cliente.
  subscribeToRoom(
    roomId: string,
    callbacks: {
      onMessageChange: () => void;
      onMessageDeleted: (messageId: string) => void;
      onReactionInserted: (messageId: string) => void;
      onReactionDeleted: (reactionId: string) => void;
    },
  ): RealtimeChannel {
    const client = this.getClient();
    const filter = `room_id=eq.${roomId}`;
    return client
      .channel(`room-sync-${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter }, () =>
        callbacks.onMessageChange(),
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter }, () =>
        callbacks.onMessageChange(),
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) =>
        callbacks.onMessageDeleted((payload.old as { id: string }).id),
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'message_reactions' }, (payload) =>
        callbacks.onReactionInserted((payload.new as MessageReaction).message_id),
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'message_reactions' }, (payload) =>
        callbacks.onReactionDeleted((payload.old as { id: string }).id),
      )
      .subscribe();
  }

  subscribeToRoomsList(onChange: () => void): RealtimeChannel {
    const client = this.getClient();
    return client
      .channel('rooms-list-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => onChange())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_members' }, () => onChange())
      .subscribe();
  }

  removeChannel(channel: RealtimeChannel | null): void {
    if (channel && this.client) {
      void this.client.removeChannel(channel);
    }
  }
}
