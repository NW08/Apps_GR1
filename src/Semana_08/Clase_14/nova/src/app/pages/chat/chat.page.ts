import { DatePipe } from '@angular/common';
import type { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import {
  ActionSheetController,
  IonAvatar,
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonLabel,
  IonModal,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Unsubscribe } from 'firebase/database';
import { addIcons } from 'ionicons';
import {
  attachOutline,
  bookmarkOutline,
  cameraOutline,
  closeOutline,
  copyOutline,
  documentOutline,
  downloadOutline,
  ellipsisVertical,
  happyOutline,
  imageOutline,
  locationOutline,
  navigateOutline,
  peopleOutline,
  pinOutline,
  radioOutline,
  returnUpBackOutline,
  searchOutline,
  send,
  timerOutline,
  trashOutline,
} from 'ionicons/icons';

import { LocationMapComponent } from '../../components/location-map/location-map.component';
import type { ChatMessage, LiveBeacon, Room, RoomMember, TypingState } from '../../models/chat.models';
import { FirebaseService } from '../../services/firebase.service';
import { HapticsService } from '../../services/haptics.service';
import { isExpired, SupabaseService } from '../../services/supabase.service';

interface ReactionGroup {
  emoji: string;
  count: number;
  reactedByMe: boolean;
}

const BEACON_DURATION_MS = 15 * 60 * 1000;
const EXPIRY_CHECK_MS = 10_000;

@Component({
  selector: 'app-chat',
  imports: [
    DatePipe,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonContent,
    IonFooter,
    IonInput,
    IonSearchbar,
    IonChip,
    IonLabel,
    IonBadge,
    IonAvatar,
    IonSpinner,
    IonModal,
    LocationMapComponent,
  ],
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content?: IonContent;
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  readonly supabase = inject(SupabaseService);
  readonly firebase = inject(FirebaseService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly actionSheetCtrl = inject(ActionSheetController);
  private readonly toastCtrl = inject(ToastController);
  private readonly haptics = inject(HapticsService);

  roomId = '';
  room = signal<Room | null>(null);
  members = signal<RoomMember[]>([]);
  messages = signal<ChatMessage[]>([]);
  typingUsers = signal<TypingState[]>([]);
  beacons = signal<LiveBeacon[]>([]);

  loading = signal<boolean>(true);
  sending = signal<boolean>(false);
  showSearch = signal<boolean>(false);
  showBeacons = signal<boolean>(false);
  searchQuery = signal<string>('');
  replyingTo = signal<ChatMessage | null>(null);
  ephemeralSeconds = signal<number | null>(null);
  previewImageUrl = signal<string | null>(null);
  beaconWatchId = signal<string | number | null>(null);

  draftText = '';

  private roomChannel: RealtimeChannel | null = null;
  private typingUnsub: Unsubscribe | null = null;
  private beaconsUnsub: Unsubscribe | null = null;
  private beaconTimer: ReturnType<typeof setTimeout> | null = null;
  private expiryInterval: ReturnType<typeof setInterval> | null = null;

  readonly quickEmojis = ['👍', '🔥', '❤️', '😂', '🚀'];

  readonly pinnedMessages = computed(() => this.messages().filter((m) => m.is_pinned));

  readonly visibleMessages = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.messages();
    if (!q) return list;
    return list.filter(
      (m) =>
        m.content.toLowerCase().includes(q) ||
        (m.file_name ?? '').toLowerCase().includes(q) ||
        (m.sender?.display_name ?? '').toLowerCase().includes(q),
    );
  });

  readonly reactionGroups = computed(() => {
    const uid = this.supabase.currentUser()?.id;
    const byMessage = new Map<string, ReactionGroup[]>();
    for (const msg of this.messages()) {
      const groups = new Map<string, ReactionGroup>();
      for (const r of msg.reactions ?? []) {
        const group = groups.get(r.emoji) ?? { emoji: r.emoji, count: 0, reactedByMe: false };
        group.count += 1;
        if (r.user_id === uid) group.reactedByMe = true;
        groups.set(r.emoji, group);
      }
      if (groups.size) byMessage.set(msg.id, [...groups.values()]);
    }
    return byMessage;
  });

  readonly typingLabel = computed(() => {
    const list = this.typingUsers();
    if (list.length === 0) return '';
    if (list.length === 1) return `${list[0].displayName} está escribiendo...`;
    return `${list.length} personas están escribiendo...`;
  });

  constructor() {
    addIcons({
      searchOutline,
      radioOutline,
      copyOutline,
      pinOutline,
      closeOutline,
      attachOutline,
      send,
      timerOutline,
      returnUpBackOutline,
      happyOutline,
      documentOutline,
      downloadOutline,
      locationOutline,
      navigateOutline,
      cameraOutline,
      imageOutline,
      trashOutline,
      ellipsisVertical,
      bookmarkOutline,
      peopleOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    this.roomId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.roomId) {
      await this.router.navigateByUrl('/rooms');
      return;
    }

    await this.loadRoomData();
    if (!this.room()) return;
    this.setupRealtimeSubscriptions();
    this.expiryInterval = setInterval(() => this.pruneExpiredMessages(), EXPIRY_CHECK_MS);
  }

  ngOnDestroy(): void {
    if (this.expiryInterval) clearInterval(this.expiryInterval);
    this.supabase.removeChannel(this.roomChannel);
    this.typingUnsub?.();
    this.beaconsUnsub?.();
    void this.stopLiveBeacon();

    const uid = this.supabase.currentUser()?.id;
    if (uid && this.roomId) {
      void this.firebase.clearTyping(this.roomId, uid);
    }
  }

  private async loadRoomData(): Promise<void> {
    this.loading.set(true);
    try {
      const [room, members, messages] = await Promise.all([
        this.supabase.getRoomById(this.roomId),
        this.supabase.getRoomMembers(this.roomId),
        this.supabase.getMessages(this.roomId),
      ]);
      if (!room) {
        await this.showToast('La sala no existe o no tienes acceso.', 'warning');
        await this.router.navigateByUrl('/rooms');
        return;
      }
      this.room.set(room);
      this.members.set(members);
      this.messages.set(messages);
      this.scrollToBottom();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar el chat';
      await this.showToast(msg, 'danger');
    } finally {
      this.loading.set(false);
    }
  }

  private setupRealtimeSubscriptions(): void {
    const uid = this.supabase.currentUser()?.id ?? '';
    if (this.supabase.isConfigured()) {
      this.roomChannel = this.supabase.subscribeToRoom(this.roomId, {
        onMessageChange: () => void this.refreshMessages(),
        onMessageDeleted: (id) => this.messages.update((list) => list.filter((m) => m.id !== id)),
        onReactionInserted: (messageId) => {
          if (this.messages().some((m) => m.id === messageId)) void this.refreshMessages();
        },
        onReactionDeleted: (reactionId) => {
          if (this.messages().some((m) => m.reactions?.some((r) => r.id === reactionId))) {
            void this.refreshMessages();
          }
        },
      });
    }

    if (this.firebase.isConfigured()) {
      this.typingUnsub = this.firebase.subscribeToTyping(this.roomId, uid, (users) => {
        this.typingUsers.set(users);
      });
      this.beaconsUnsub = this.firebase.subscribeToBeacons(this.roomId, (list) => {
        this.beacons.set(list);
      });
    }
  }

  private async refreshMessages(): Promise<void> {
    try {
      const list = await this.supabase.getMessages(this.roomId);
      const previousCount = this.messages().length;
      this.messages.set(list);
      if (list.length > previousCount) {
        this.scrollToBottom();
      }
    } catch {
      // Ignore transient refresh failures
    }
  }

  private pruneExpiredMessages(): void {
    const now = Date.now();
    const list = this.messages();
    if (list.some((m) => isExpired(m, now))) {
      this.messages.set(list.filter((m) => !isExpired(m, now)));
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      void this.content?.scrollToBottom(250);
    }, 80);
  }

  onTyping(): void {
    const user = this.supabase.currentUser();
    const profile = this.supabase.currentProfile();
    if (!user || !this.draftText.trim()) return;
    void this.firebase.setTyping(this.roomId, user.id, profile?.display_name ?? user.email ?? 'Usuario');
  }

  async sendText(): Promise<void> {
    const text = this.draftText.trim();
    if (!text || this.sending()) return;

    this.sending.set(true);
    try {
      await this.supabase.sendMessage({
        roomId: this.roomId,
        type: 'text',
        content: text,
        replyToId: this.replyingTo()?.id ?? null,
        expiresInSeconds: this.ephemeralSeconds(),
      });
      this.draftText = '';
      this.replyingTo.set(null);
      await this.haptics.impact();

      const uid = this.supabase.currentUser()?.id;
      if (uid) void this.firebase.clearTyping(this.roomId, uid);
      await this.refreshMessages();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo enviar el mensaje';
      await this.showToast(msg, 'danger');
    } finally {
      this.sending.set(false);
    }
  }

  cycleEphemeral(): void {
    const current = this.ephemeralSeconds();
    if (current === null) this.ephemeralSeconds.set(60);
    else if (current === 60) this.ephemeralSeconds.set(300);
    else this.ephemeralSeconds.set(null);
    void this.haptics.impact();
  }

  async openAttachMenu(): Promise<void> {
    const sheet = await this.actionSheetCtrl.create({
      header: 'Compartir en la sala',
      buttons: [
        {
          text: 'Cámara / Foto',
          icon: 'camera-outline',
          handler: () => void this.pickCameraPhoto(),
        },
        {
          text: 'Imagen o archivo del dispositivo',
          icon: 'document-outline',
          handler: () => this.fileInput?.nativeElement.click(),
        },
        {
          text: 'Ubicación actual (Mapa)',
          icon: 'location-outline',
          handler: () => void this.shareCurrentLocation(),
        },
        {
          text:
            this.beaconWatchId() !== null ? 'Detener ubicación GPS en vivo' : 'Compartir ubicación GPS en vivo (15m)',
          icon: 'radio-outline',
          handler: () => {
            if (this.beaconWatchId() !== null) {
              void this.stopLiveBeacon();
            } else {
              void this.startLiveBeacon();
            }
          },
        },
        { text: 'Cancelar', role: 'cancel' },
      ],
    });
    await sheet.present();
  }

  private async pickCameraPhoto(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      this.fileInput?.nativeElement.click();
      return;
    }
    try {
      const photo = await Camera.getPhoto({
        quality: 75,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
      });
      if (!photo.webPath) return;
      const response = await fetch(photo.webPath);
      const blob = await response.blob();
      const fileName = `photo-${Date.now()}.${photo.format || 'jpg'}`;
      await this.uploadAndSendFile(blob, fileName, blob.size, blob.type || 'image/jpeg', true);
    } catch {
      // User cancelled camera
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    await this.uploadAndSendFile(file, file.name, file.size, file.type, isImage);
    input.value = '';
  }

  private async uploadAndSendFile(
    blob: Blob,
    fileName: string,
    fileSize: number,
    mimeType: string,
    isImage: boolean,
  ): Promise<void> {
    this.sending.set(true);
    try {
      const url = await this.supabase.uploadChatMedia(blob, fileName, isImage ? 'images' : 'files');
      await this.supabase.sendMessage({
        roomId: this.roomId,
        type: isImage ? 'image' : 'file',
        content: isImage ? '' : fileName,
        mediaUrl: url,
        fileName,
        fileSize,
        mimeType,
        replyToId: this.replyingTo()?.id ?? null,
        expiresInSeconds: this.ephemeralSeconds(),
      });
      this.replyingTo.set(null);
      await this.haptics.notify();
      await this.refreshMessages();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error subiendo archivo';
      await this.showToast(msg, 'danger');
    } finally {
      this.sending.set(false);
    }
  }

  private async getCoordinates(): Promise<{ lat: number; lng: number }> {
    if (Capacitor.isNativePlatform()) {
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    }
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada en este navegador'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(new Error(err.message || 'Permiso de ubicación denegado')),
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
  }

  async shareCurrentLocation(): Promise<void> {
    this.sending.set(true);
    try {
      const { lat, lng } = await this.getCoordinates();
      await this.supabase.sendMessage({
        roomId: this.roomId,
        type: 'location',
        content: 'Ubicación compartida',
        latitude: lat,
        longitude: lng,
        locationLabel: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        replyToId: this.replyingTo()?.id ?? null,
      });
      this.replyingTo.set(null);
      await this.haptics.notify();
      await this.refreshMessages();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo obtener tu ubicación';
      await this.showToast(msg, 'danger');
    } finally {
      this.sending.set(false);
    }
  }

  async startLiveBeacon(): Promise<void> {
    const user = this.supabase.currentUser();
    const profile = this.supabase.currentProfile();
    if (!user || this.beaconWatchId() !== null) return;

    const expiresAt = Date.now() + BEACON_DURATION_MS;
    const publish = (latitude: number, longitude: number) =>
      this.firebase.publishBeacon(this.roomId, {
        uid: user.id,
        displayName: profile?.display_name ?? user.email ?? 'Usuario',
        avatarUrl: profile?.avatar_url ?? null,
        latitude,
        longitude,
        updatedAt: Date.now(),
        expiresAt,
      });

    try {
      const { lat, lng } = await this.getCoordinates();
      await publish(lat, lng);

      if (Capacitor.isNativePlatform()) {
        const id = await Geolocation.watchPosition({ enableHighAccuracy: true }, (pos) => {
          if (pos) void publish(pos.coords.latitude, pos.coords.longitude);
        });
        this.beaconWatchId.set(id);
      } else if (navigator.geolocation) {
        const id = navigator.geolocation.watchPosition((pos) => {
          void publish(pos.coords.latitude, pos.coords.longitude);
        });
        this.beaconWatchId.set(id);
      }

      this.beaconTimer = setTimeout(() => void this.stopLiveBeacon(), BEACON_DURATION_MS);
      this.showBeacons.set(true);
      await this.showToast('Ubicación GPS en vivo activada por 15 minutos', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo activar la ubicación GPS en vivo';
      await this.showToast(msg, 'danger');
    }
  }

  async stopLiveBeacon(): Promise<void> {
    if (this.beaconTimer) {
      clearTimeout(this.beaconTimer);
      this.beaconTimer = null;
    }
    const watchId = this.beaconWatchId();
    if (watchId !== null) {
      if (typeof watchId === 'string') {
        await Geolocation.clearWatch({ id: watchId });
      } else if (navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
      this.beaconWatchId.set(null);
    }
    const uid = this.supabase.currentUser()?.id;
    if (uid && this.roomId) {
      await this.firebase.stopBeacon(this.roomId, uid);
    }
  }

  // Ignora los eventos que vienen de elementos interactivos dentro de la burbuja (imagen, enlace, mapa, reacciones).
  onBubbleActivate(event: Event, msg: ChatMessage): void {
    const target = event.target as HTMLElement;
    if (target.closest('a, button, ion-button, img, .location-card')) return;
    void this.openMessageActions(msg);
  }

  async openMessageActions(msg: ChatMessage): Promise<void> {
    const isMine = msg.sender_id === this.supabase.currentUser()?.id;
    const buttons: {
      text: string;
      icon?: string;
      role?: string;
      handler?: () => void;
    }[] = [
      {
        text: 'Responder',
        icon: 'return-up-back-outline',
        handler: () => this.replyingTo.set(msg),
      },
      {
        text: msg.is_pinned ? 'Desfijar mensaje' : 'Fijar mensaje',
        icon: 'pin-outline',
        handler: () => void this.togglePin(msg),
      },
      ...this.quickEmojis.map((emoji) => ({
        text: `Reaccionar ${emoji}`,
        handler: () => void this.react(msg, emoji),
      })),
    ];

    if (isMine) {
      buttons.push({
        text: 'Eliminar mensaje',
        icon: 'trash-outline',
        role: 'destructive',
        handler: () => void this.deleteMsg(msg),
      });
    }

    buttons.push({ text: 'Cancelar', role: 'cancel' });

    const sheet = await this.actionSheetCtrl.create({
      header: 'Opciones del mensaje',
      buttons,
    });
    await sheet.present();
  }

  async react(msg: ChatMessage, emoji: string): Promise<void> {
    const uid = this.supabase.currentUser()?.id;
    if (!uid) return;
    const already = (msg.reactions ?? []).some((r) => r.user_id === uid && r.emoji === emoji);
    try {
      await this.supabase.toggleReaction(msg.id, emoji, already);
      await this.haptics.impact();
      await this.refreshMessages();
    } catch {
      // Ignore
    }
  }

  private async togglePin(msg: ChatMessage): Promise<void> {
    try {
      await this.supabase.togglePinMessage(msg.id, msg.is_pinned);
      await this.refreshMessages();
    } catch {
      await this.showToast('No se pudo actualizar el fijado', 'danger');
    }
  }

  private async deleteMsg(msg: ChatMessage): Promise<void> {
    try {
      await this.supabase.deleteMessage(msg.id);
      await this.refreshMessages();
    } catch {
      await this.showToast('No se pudo eliminar', 'danger');
    }
  }

  isMine(msg: ChatMessage): boolean {
    return msg.sender_id === this.supabase.currentUser()?.id;
  }

  openExternalMap(lat: number, lng: number): void {
    window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`, '_blank');
  }

  async copyInviteCode(): Promise<void> {
    const code = this.room()?.invite_code;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      await this.showToast(`Código ${code} copiado`, 'success');
    } catch {
      await this.showToast(`Código: ${code}`, 'success');
    }
  }

  formatBytes(bytes: number | null): string {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2400,
      color,
      position: 'top',
    });
    await toast.present();
  }
}
