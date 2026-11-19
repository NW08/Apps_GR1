import { Injectable, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

const THEME_KEY = 'novasync_theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly isDark = signal<boolean>(true);

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark =
      saved !== null ? saved === 'dark' : (window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true);
    this.applyTheme(prefersDark);
  }

  toggleTheme(): void {
    this.applyTheme(!this.isDark());
  }

  applyTheme(dark: boolean): void {
    this.isDark.set(dark);
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    document.documentElement.classList.toggle('ion-palette-dark', dark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');

    if (Capacitor.isNativePlatform()) {
      void StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light });
      void StatusBar.setBackgroundColor({ color: dark ? '#0b1120' : '#f8fafc' });
    }
  }
}
