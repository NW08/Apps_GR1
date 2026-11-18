import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

@Injectable({
  providedIn: 'root',
})
export class HapticsService {
  async impact(style: ImpactStyle = ImpactStyle.Light): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await Haptics.impact({ style });
    } catch {
      // Ignore on unsupported devices
    }
  }

  async notify(type: NotificationType = NotificationType.Success): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await Haptics.notification({ type });
    } catch {
      // Ignore on unsupported devices
    }
  }
}
