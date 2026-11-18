import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import {
  IonAvatar,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToggle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  cameraOutline,
  logOutOutline,
  moonOutline,
  saveOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { AvailabilityStatus } from '../../models/chat.models';
import { FirebaseService } from '../../services/firebase.service';
import { HapticsService } from '../../services/haptics.service';
import { SupabaseService } from '../../services/supabase.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonAvatar,
    IonButton,
    IonIcon,
    IonItem,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonLabel,
    IonSpinner,
  ],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  @ViewChild('avatarInput') avatarInput?: ElementRef<HTMLInputElement>;

  readonly supabase = inject(SupabaseService);
  readonly firebase = inject(FirebaseService);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly toastCtrl = inject(ToastController);
  private readonly haptics = inject(HapticsService);

  saving = signal<boolean>(false);

  displayName = '';
  username = '';
  bio = '';
  statusText = '';
  availability: AvailabilityStatus = 'online';
  avatarUrl: string | null = null;

  constructor() {
    addIcons({
      cameraOutline,
      saveOutline,
      logOutOutline,
      moonOutline,
      shieldCheckmarkOutline,
    });
  }

  ngOnInit(): void {
    const p = this.supabase.currentProfile();
    if (p) {
      this.displayName = p.display_name;
      this.username = p.username;
      this.bio = p.bio;
      this.statusText = p.status_text;
      this.availability = p.availability;
      this.avatarUrl = p.avatar_url;
    }
  }

  async changeAvatar(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      this.avatarInput?.nativeElement.click();
      return;
    }
    try {
      const photo = await Camera.getPhoto({
        quality: 75,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
      });
      if (!photo.webPath) return;
      const res = await fetch(photo.webPath);
      const blob = await res.blob();
      await this.uploadAvatarBlob(blob, photo.format || 'jpg');
    } catch {
      // Cancelled
    }
  }

  async onAvatarFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop() || 'png';
    await this.uploadAvatarBlob(file, ext);
    input.value = '';
  }

  private async uploadAvatarBlob(blob: Blob, ext: string): Promise<void> {
    this.saving.set(true);
    try {
      const url = await this.supabase.uploadAvatar(blob, ext);
      this.avatarUrl = url;
      await this.supabase.updateProfile({ avatar_url: url });
      await this.haptics.notify();
      await this.showToast('Avatar actualizado', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error subiendo avatar';
      await this.showToast(msg, 'danger');
    } finally {
      this.saving.set(false);
    }
  }

  async saveProfile(): Promise<void> {
    if (!this.displayName.trim() || !this.username.trim()) {
      await this.showToast('Nombre y usuario son obligatorios', 'warning');
      return;
    }

    this.saving.set(true);
    try {
      const updated = await this.supabase.updateProfile({
        display_name: this.displayName.trim(),
        username: this.username.trim().toLowerCase(),
        bio: this.bio.trim(),
        status_text: this.statusText.trim(),
        availability: this.availability,
      });
      await this.firebase.setUserPresence(
        updated.id,
        updated.display_name,
        updated.availability
      );
      await this.haptics.notify();
      await this.showToast('Perfil guardado y sincronizado', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo guardar el perfil';
      await this.showToast(msg, 'danger');
    } finally {
      this.saving.set(false);
    }
  }

  async logout(): Promise<void> {
    const user = this.supabase.currentUser();
    const profile = this.supabase.currentProfile();
    if (user) {
      await this.firebase.setUserOffline(user.id, profile?.display_name ?? user.email ?? 'Usuario');
    }
    await this.supabase.signOut();
    await this.router.navigateByUrl('/auth', { replaceUrl: true });
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
