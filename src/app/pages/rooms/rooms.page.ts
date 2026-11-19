import type { OnDestroy, OnInit } from '@angular/core';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  IonAvatar,
  IonBadge,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { addIcons } from 'ionicons';
import {
  addOutline,
  chatbubblesOutline,
  copyOutline,
  globeOutline,
  keyOutline,
  lockClosedOutline,
  moonOutline,
  peopleOutline,
  personCircleOutline,
  sunnyOutline,
} from 'ionicons/icons';

import type { Room } from '../../models/chat.models';
import { FirebaseService } from '../../services/firebase.service';
import { HapticsService } from '../../services/haptics.service';
import { SupabaseService } from '../../services/supabase.service';
import { ThemeService } from '../../services/theme.service';
import { traducirError } from '../../utils/error-es';

@Component({
  selector: 'app-rooms',
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonSearchbar,
    IonChip,
    IonLabel,
    IonBadge,
    IonAvatar,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
  ],
  templateUrl: './rooms.page.html',
  styleUrls: ['./rooms.page.scss'],
})
export class RoomsPage implements OnInit, OnDestroy {
  readonly supabase = inject(SupabaseService);
  readonly firebase = inject(FirebaseService);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);
  private readonly haptics = inject(HapticsService);

  rooms = signal<Room[]>([]);
  loading = signal<boolean>(true);
  searchQuery = signal<string>('');
  private roomsChannel: RealtimeChannel | null = null;

  readonly onlineCount = computed(() => {
    const map = this.firebase.onlineUsers();
    return Object.values(map).filter((u) => u.online).length;
  });

  readonly filteredRooms = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.rooms();
    if (!q) return list;
    return list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.topic.toLowerCase().includes(q) ||
        r.invite_code.toLowerCase().includes(q),
    );
  });

  constructor() {
    addIcons({
      addOutline,
      keyOutline,
      lockClosedOutline,
      globeOutline,
      peopleOutline,
      copyOutline,
      personCircleOutline,
      moonOutline,
      sunnyOutline,
      chatbubblesOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadRooms();

    if (this.supabase.isConfigured()) {
      this.roomsChannel = this.supabase.subscribeToRoomsList(() => {
        void this.loadRooms(false);
      });
    }
  }

  ngOnDestroy(): void {
    this.supabase.removeChannel(this.roomsChannel);
  }

  async loadRooms(showLoader = true): Promise<void> {
    if (showLoader) this.loading.set(true);
    try {
      const list = await this.supabase.getRooms();
      this.rooms.set(list);
    } catch (err) {
      await this.showToast(traducirError(err, 'No se pudieron cargar las salas'), 'danger');
    } finally {
      this.loading.set(false);
    }
  }

  async handleRefresh(event: CustomEvent): Promise<void> {
    await this.loadRooms(false);
    (event.target as HTMLIonRefresherElement).complete();
  }

  async openCreateRoom(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Nueva sala de chat',
      subHeader: 'Se generará un código NOVA-XXXX automático',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Nombre de la sala (ej. Proyecto Móviles)' },
        { name: 'topic', type: 'text', placeholder: 'Tema (ej. EPN, Estudio, Campo)' },
        { name: 'description', type: 'textarea', placeholder: 'Descripción breve...' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sala Pública',
          handler: (data) => void this.createRoom(data, false),
        },
        {
          text: 'Sala Privada 🔒',
          handler: (data) => void this.createRoom(data, true),
        },
      ],
    });
    await alert.present();
  }

  private async createRoom(
    data: { name?: string; topic?: string; description?: string },
    isPrivate: boolean,
  ): Promise<void> {
    if (!data.name?.trim()) {
      await this.showToast('El nombre de la sala es obligatorio.', 'warning');
      return;
    }
    try {
      const room = await this.supabase.createRoom({
        name: data.name,
        topic: data.topic ?? 'General',
        description: data.description ?? '',
        isPrivate,
      });
      await this.haptics.notify();
      await this.loadRooms(false);
      await this.showToast(`Sala creada · Código ${room.invite_code}`, 'success');
      await this.router.navigate(['/chat', room.id]);
    } catch (err) {
      await this.showToast(traducirError(err, 'Error al crear la sala'), 'danger');
    }
  }

  async openJoinByCode(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Unirse con código',
      subHeader: 'Ingresa el código de invitación de una sala privada o pública',
      inputs: [
        {
          name: 'code',
          type: 'text',
          placeholder: 'Ej. NOVA-7X2A',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Unirse',
          handler: async (data: { code?: string }) => {
            if (!data.code?.trim()) return;
            try {
              const room = await this.supabase.joinRoomByCode(data.code);
              await this.haptics.notify();
              await this.loadRooms(false);
              await this.router.navigate(['/chat', room.id]);
            } catch (err) {
              await this.showToast(traducirError(err, 'Código inválido'), 'danger');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async enterRoom(room: Room): Promise<void> {
    try {
      if (!room.is_private) {
        await this.supabase.joinPublicRoom(room.id);
      }
      await this.haptics.impact();
      await this.router.navigate(['/chat', room.id]);
    } catch (err) {
      await this.showToast(traducirError(err, 'No se pudo abrir la sala'), 'danger');
    }
  }

  async copyCode(event: Event, code: string): Promise<void> {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      await this.haptics.impact();
      await this.showToast(`Código ${code} copiado al portapapeles`, 'success');
    } catch {
      await this.showToast(`Código: ${code}`, 'success');
    }
  }

  goProfile(): void {
    void this.router.navigateByUrl('/profile');
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2600,
      color,
      position: 'top',
    });
    await toast.present();
  }
}
