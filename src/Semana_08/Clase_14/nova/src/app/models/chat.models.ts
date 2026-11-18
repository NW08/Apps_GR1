export type AvailabilityStatus = 'online' | 'busy' | 'away' | 'dnd';

export type MessageType = 'text' | 'image' | 'file' | 'location' | 'system';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  status_text: string;
  availability: AvailabilityStatus;
  updated_at: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  topic: string;
  is_private: boolean;
  invite_code: string;
  created_by: string;
  created_at: string;
  member_count?: number;
}

export interface RoomMember {
  room_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  profile?: Profile;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  type: MessageType;
  content: string;
  media_url: string | null;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  latitude: number | null;
  longitude: number | null;
  location_label: string | null;
  reply_to_id: string | null;
  is_pinned: boolean;
  expires_at: string | null;
  created_at: string;
  sender?: Profile;
  reply_to?: ChatMessage | null;
  reactions?: MessageReaction[];
}

export interface PresenceState {
  uid: string;
  displayName: string;
  availability: AvailabilityStatus;
  online: boolean;
  lastSeen: number;
}

export interface TypingState {
  uid: string;
  displayName: string;
  timestamp: number;
}

export interface LiveBeacon {
  uid: string;
  displayName: string;
  avatarUrl: string | null;
  latitude: number;
  longitude: number;
  updatedAt: number;
  expiresAt: number;
}
