import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/angular';
import { FotoComponent } from '../../core/foto/foto.component';
import { UbicacionComponent } from '../../core/ubicacion/ubicacion.component';
import { ClimaComponent } from '../../core/clima/clima.component';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    FotoComponent,
    UbicacionComponent,
    ClimaComponent,
  ],
})
export class RegistroPage {
  foto = signal<string | null>(null);
  latitud = signal<number | null>(null);
  longitud = signal<number | null>(null);
}
