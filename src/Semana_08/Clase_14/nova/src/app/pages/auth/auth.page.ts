import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  cloudDoneOutline,
  flashOutline,
  keyOutline,
  lockClosedOutline,
  mailOutline,
  personOutline,
  planetOutline,
  warningOutline,
} from 'ionicons/icons';
import { FirebaseService } from '../../services/firebase.service';
import { HapticsService } from '../../services/haptics.service';
import { SupabaseService } from '../../services/supabase.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner,
  ],
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage {
  readonly supabase = inject(SupabaseService);
  readonly firebase = inject(FirebaseService);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly toastCtrl = inject(ToastController);
  private readonly haptics = inject(HapticsService);

  mode = signal<'login' | 'register' | 'reset'>('login');
  loading = signal<boolean>(false);

  email = '';
  password = '';
  displayName = '';
  username = '';

  constructor() {
    addIcons({
      planetOutline,
      mailOutline,
      lockClosedOutline,
      personOutline,
      keyOutline,
      flashOutline,
      cloudDoneOutline,
      warningOutline,
    });
  }

  onModeChange(value: string | number | undefined): void {
    if (value === 'login' || value === 'register' || value === 'reset') {
      this.mode.set(value);
    }
  }

  async submit(): Promise<void> {
    if (!this.supabase.isConfigured()) {
      await this.showToast(
        'Configura tus credenciales en src/environments/environment.ts primero.',
        'warning'
      );
      return;
    }

    if (!this.email.trim()) {
      await this.showToast('Ingresa tu correo electrónico.', 'warning');
      return;
    }

    this.loading.set(true);
    try {
      const currentMode = this.mode();
      if (currentMode === 'login') {
        await this.supabase.signIn(this.email.trim(), this.password);
        await this.haptics.notify();
        await this.router.navigateByUrl('/rooms', { replaceUrl: true });
      } else if (currentMode === 'register') {
        if (!this.displayName.trim() || this.password.length < 6) {
          await this.showToast('Completa tu nombre y una contraseña de al menos 6 caracteres.', 'warning');
          return;
        }
        const uname = this.username.trim() || this.displayName.trim().toLowerCase().replace(/\s+/g, '_');
        await this.supabase.signUp(this.email.trim(), this.password, this.displayName.trim(), uname);
        await this.haptics.notify();
        if (this.supabase.session()) {
          await this.router.navigateByUrl('/rooms', { replaceUrl: true });
        } else {
          await this.showToast('Cuenta creada. Revisa tu correo si requiere confirmación.', 'success');
          this.mode.set('login');
        }
      } else {
        await this.supabase.resetPassword(this.email.trim());
        await this.showToast('Enlace de recuperación enviado a tu correo.', 'success');
        this.mode.set('login');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error de autenticación';
      await this.showToast(message, 'danger');
    } finally {
      this.loading.set(false);
    }
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'top',
    });
    await toast.present();
  }
}
