import { computed, inject, signal, Component } from '@angular/core';
import type { OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  downloadOutline,
  locateOutline,
  locationOutline,
  navigateOutline,
  openOutline,
} from 'ionicons/icons';

import { LocationService } from '../services/location';

interface RutaPreset {
  nombre: string;
  destino: string;
  waypoints: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  private loc = inject(LocationService);

  // 1. Estado de Posición GPS
  latitude = signal<number | null>(null);
  longitude = signal<number | null>(null);
  isLoadingGps = signal<boolean>(false);
  gpsMensaje = signal<string>('');

  // 2. Estado de Ruta
  origen = signal<string>('-0.180653,-78.467838');
  destino = signal<string>('-0.229415,-78.524581');
  waypoints = signal<string>('-0.201452,-78.498124|-0.220164,-78.512328');

  // Sitios de interés para ruta rápida
  presetsRuta: RutaPreset[] = [
    {
      nombre: 'A Casa',
      destino: '-0.229415,-78.524581',
      waypoints: '-0.201452,-78.498124|-0.220164,-78.512328',
    },
    {
      nombre: 'Al Parque La Carolina',
      destino: '-0.182500,-78.484500',
      waypoints: '-0.195000,-78.490000',
    },
    {
      nombre: 'A El Panecillo',
      destino: '-0.229415,-78.524581',
      waypoints: '-0.205000,-78.498000',
    },
  ];

  // 1.- Hipervínculo a la posición GPS actual
  ubicacionGpsUrl = computed<string>(() => {
    const lat = this.latitude() ?? -0.2025464;
    const lng = this.longitude() ?? -78.4941719;
    return `https://www.google.com/maps/@${lat},${lng}`;
  });

  // 2.- Hipervínculo que muestra la ruta con origin, destination y waypoints
  rutaGpsUrl = computed<string>(() => {
    const origin = encodeURIComponent(this.origen().trim());
    const destination = encodeURIComponent(this.destino().trim());
    const wp = this.waypoints().trim().replace(/\|/g, '%7C');

    if (wp) {
      return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${wp}`;
    }
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  });

  constructor() {
    addIcons({
      downloadOutline,
      locateOutline,
      locationOutline,
      navigateOutline,
      openOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    await this.obtenerUbicacionActual();
  }

  // Obtiene coordenadas GPS
  async obtenerUbicacionActual(): Promise<void> {
    this.isLoadingGps.set(true);
    this.gpsMensaje.set('Obteniendo ubicación...');
    try {
      const pos = await this.loc.getCurrentPosition();
      this.latitude.set(pos.latitude);
      this.longitude.set(pos.longitude);
      this.gpsMensaje.set('Ubicación GPS obtenida con éxito.');
    } catch {
      this.gpsMensaje.set('Ubicación referencial (GPS no disponible o denegado).');
    } finally {
      this.isLoadingGps.set(false);
    }
  }

  // Establece las coordenadas GPS actuales como origen de la ruta
  usarGpsComoOrigen(): void {
    if (this.latitude() !== null && this.longitude() !== null) {
      this.origen.set(`${this.latitude()},${this.longitude()}`);
    } else {
      this.origen.set('-0.2025464,-78.4941719');
    }
  }

  // Aplica un destino predefinido (casa, parque, etc.)
  seleccionarPreset(preset: RutaPreset): void {
    this.destino.set(preset.destino);
    this.waypoints.set(preset.waypoints);
  }

  // 3.- Botón que guarda su ubicación en un archivo txt
  guardarUbicacionTxt(): void {
    const url = this.ubicacionGpsUrl();
    const contenido = `Hipervínculo Google Maps (Ubicación GPS):
${url}

Coordenadas:
Latitud: ${this.latitude() ?? -0.2025464}
Longitud: ${this.longitude() ?? -78.4941719}
Fecha: ${new Date().toLocaleString()}
`;
    this.descargarArchivo('ubicacion_gps.txt', contenido);
  }

  // 4.- Botón que guarda su ruta en un archivo txt
  guardarRutaTxt(): void {
    const url = this.rutaGpsUrl();
    const contenido = `Hipervínculo Google Maps (Ruta):
${url}

Detalles de la ruta:
Origen: ${this.origen()}
Destino: ${this.destino()}
Puntos de paso (Waypoints): ${this.waypoints() || 'Ninguno'}
Fecha: ${new Date().toLocaleString()}
`;
    this.descargarArchivo('ruta_gps.txt', contenido);
  }

  // Utilidad simple para descargar archivo .txt en el navegador/dispositivo
  private descargarArchivo(nombreArchivo: string, contenido: string): void {
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
