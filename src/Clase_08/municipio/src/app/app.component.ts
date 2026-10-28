import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { BorradorService } from './core/services/borrador.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private router = inject(Router);
  private borrador = inject(BorradorService);

  constructor() {
    void this.revisarBorrador();
  }

  private async revisarBorrador() {
    if (await this.borrador.obtener()) {
      this.router.navigate(['/registro']);
    }
  }
}
