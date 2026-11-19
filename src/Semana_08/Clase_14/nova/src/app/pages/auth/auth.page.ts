import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  NavController,
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
  imports: [
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
  private readonly navCtrl = inject(NavController);
  private readonly toastCtrl = inject(ToastController);
  private readonly haptics = inject(HapticsService);

  mode = signal<'login' | 'register' | 'reset' | 'update'>('login');
  loading = signal<boolean>(false);

  readonly submitLabel = computed(() => {
    const labels = {
      login: 'Iniciar sesión',
      register: 'Crear cuenta',
      reset: 'Enviar enlace',
      update: 'Guardar nueva contraseña',
    };
    return labels[this.mode()];
  });

  email = '';
  password = '';
  displayName = '';
  username = '';
  confirmPassword = '';

  constructor() {
    effect(() => {
      if (this.supabase.passwordRecovery()) this.mode.set('update');
    });

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
      await this.showToast('Configura tus credenciales de Supabase en el archivo .env primero.', 'warning');
      return;
    }

    if (this.mode() === 'update') {
      await this.updatePassword();
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
        await this.navCtrl.navigateRoot('/rooms');
      } else if (currentMode === 'register') {
        if (!this.displayName.trim() || this.password.length < 6) {
          await this.showToast('Completa tu nombre y una contraseña de al menos 6 caracteres.', 'warning');
          return;
        }
        const uname = this.username.trim() || this.displayName.trim().toLowerCase().replace(/\s+/g, '_');
        await this.supabase.signUp(this.email.trim(), this.password, this.displayName.trim(), uname);
        await this.haptics.notify();
        if (this.supabase.session()) {
          await this.navCtrl.navigateRoot('/rooms');
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

  private async updatePassword(): Promise<void> {
    if (this.password.length < 6) {
      await this.showToast('La contraseña debe tener al menos 6 caracteres.', 'warning');
      return;
    }
    if (this.password !== this.confirmPassword) {
      await this.showToast('Las contraseñas no coinciden.', 'warning');
      return;
    }

    this.loading.set(true);
    try {
      await this.supabase.updatePassword(this.password);
      this.password = '';
      this.confirmPassword = '';
      await this.haptics.notify();
      await this.showToast('Contraseña actualizada.', 'success');
      await this.navCtrl.navigateRoot('/rooms');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo actualizar la contraseña';
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
