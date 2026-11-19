import { Component, effect, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';

import { FirebaseService } from './services/firebase.service';
import { SupabaseService } from './services/supabase.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private readonly supabase = inject(SupabaseService);
  private readonly firebase = inject(FirebaseService);
  // Se inyecta para aplicar el tema guardado al arrancar.
  private readonly _theme = inject(ThemeService);

  constructor() {
    effect(() => {
      const user = this.supabase.currentUser();
      const profile = this.supabase.currentProfile();
      if (!user) return;
      void this.firebase.setUserPresence(
        user.id,
        profile?.display_name ?? user.email ?? 'Usuario',
        profile?.availability ?? 'online',
      );
    });
  }
}
