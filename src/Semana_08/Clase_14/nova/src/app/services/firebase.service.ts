import type { OnDestroy } from '@angular/core';
import { Injectable, signal } from '@angular/core';
import type { FirebaseApp } from 'firebase/app';
import { getApps, initializeApp } from 'firebase/app';
import type { Database, Unsubscribe } from 'firebase/database';
import { getDatabase, onDisconnect, onValue, ref, remove, set } from 'firebase/database';

import { environment } from '../../environments/environment';
import type { AvailabilityStatus, LiveBeacon, PresenceState, TypingState } from '../models/chat.models';

const TYPING_TTL_MS = 3500;
const TYPING_WRITE_INTERVAL_MS = 1500;

@Injectable({
  providedIn: 'root',
})
export class FirebaseService implements OnDestroy {
  readonly isConfigured = signal<boolean>(
    !environment.firebase.apiKey.includes('YOUR_FIREBASE_API_KEY') &&
      !environment.firebase.databaseURL.includes('YOUR_PROJECT_ID'),
  );

  readonly isConnected = signal<boolean>(false);
  readonly onlineUsers = signal<Record<string, PresenceState>>({});

  private app: FirebaseApp | null = null;
  private db: Database | null = null;
  private presenceUnsub: Unsubscribe | null = null;
  private typingTimeout: ReturnType<typeof setTimeout> | null = null;
  private lastTypingWrite = 0;

  constructor() {
    if (this.isConfigured()) {
      this.app = getApps().length ? getApps()[0] : initializeApp(environment.firebase);
      this.db = getDatabase(this.app);
      this.listenConnectionState();
      this.listenGlobalPresence();
    }
  }

  private listenConnectionState(): void {
    if (!this.db) return;
    const connectedRef = ref(this.db, '.info/connected');
    onValue(connectedRef, (snap) => {
      this.isConnected.set(Boolean(snap.val()));
    });
  }

  private listenGlobalPresence(): void {
    if (!this.db) return;
    const presenceRoot = ref(this.db, 'presence');
    this.presenceUnsub = onValue(presenceRoot, (snap) => {
      const val = (snap.val() as Record<string, PresenceState> | null) ?? {};
      this.onlineUsers.set(val);
    });
  }

  async setUserPresence(uid: string, displayName: string, availability: AvailabilityStatus): Promise<void> {
    if (!this.db) return;
    const userRef = ref(this.db, `presence/${uid}`);
    await onDisconnect(userRef).set({
      uid,
      displayName,
      availability: 'away',
      online: false,
      lastSeen: Date.now(),
    });
    await set(userRef, {
      uid,
      displayName,
      availability,
      online: true,
      lastSeen: Date.now(),
    });
  }

  async setUserOffline(uid: string, displayName: string): Promise<void> {
    if (!this.db) return;
    const userRef = ref(this.db, `presence/${uid}`);
    await set(userRef, {
      uid,
      displayName,
      availability: 'away',
      online: false,
      lastSeen: Date.now(),
    });
  }

  async setTyping(roomId: string, uid: string, displayName: string): Promise<void> {
    if (!this.db) return;

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    this.typingTimeout = setTimeout(() => {
      void this.clearTyping(roomId, uid);
    }, TYPING_TTL_MS);

    // Evita escribir en Firebase en cada pulsación de tecla.
    const now = Date.now();
    if (now - this.lastTypingWrite < TYPING_WRITE_INTERVAL_MS) return;
    this.lastTypingWrite = now;

    const typingRef = ref(this.db, `typing/${roomId}/${uid}`);
    await onDisconnect(typingRef).remove();
    await set(typingRef, { uid, displayName, timestamp: now } satisfies TypingState);
  }

  async clearTyping(roomId: string, uid: string): Promise<void> {
    if (!this.db) return;
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }
    this.lastTypingWrite = 0;
    await remove(ref(this.db, `typing/${roomId}/${uid}`));
  }

  subscribeToTyping(roomId: string, currentUid: string, onChange: (typingUsers: TypingState[]) => void): Unsubscribe {
    if (!this.db) return () => undefined;
    const roomTypingRef = ref(this.db, `typing/${roomId}`);
    return onValue(roomTypingRef, (snap) => {
      const raw = (snap.val() as Record<string, TypingState> | null) ?? {};
      const now = Date.now();
      const active = Object.values(raw).filter((t) => t.uid !== currentUid && now - t.timestamp < 5000);
      onChange(active);
    });
  }

  async publishBeacon(roomId: string, beacon: LiveBeacon): Promise<void> {
    if (!this.db) return;
    const beaconRef = ref(this.db, `beacons/${roomId}/${beacon.uid}`);
    await onDisconnect(beaconRef).remove();
    await set(beaconRef, beacon);
  }

  async stopBeacon(roomId: string, uid: string): Promise<void> {
    if (!this.db) return;
    const beaconRef = ref(this.db, `beacons/${roomId}/${uid}`);
    await remove(beaconRef);
  }

  subscribeToBeacons(roomId: string, onChange: (beacons: LiveBeacon[]) => void): Unsubscribe {
    if (!this.db) return () => undefined;
    const beaconsRef = ref(this.db, `beacons/${roomId}`);
    return onValue(beaconsRef, (snap) => {
      const raw = (snap.val() as Record<string, LiveBeacon> | null) ?? {};
      const now = Date.now();
      const active = Object.values(raw).filter((b) => b.expiresAt > now);
      onChange(active);
    });
  }

  ngOnDestroy(): void {
    this.presenceUnsub?.();
  }
}
