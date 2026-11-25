import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastCtrl = inject(ToastController);

  async exito(mensaje: string): Promise<void> {
    await this.mostrar(mensaje, 'success');
  }

  async error(mensaje: string): Promise<void> {
    await this.mostrar(mensaje, 'danger');
  }

  private async mostrar(message: string, color: 'success' | 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({ message, color, duration: 3000, position: 'bottom' });
    await toast.present();
  }
}
