import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonSpinner,
  IonBadge,
  IonText,
  IonIcon,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  rainyOutline,
  sunnyOutline,
  cloudyOutline,
  thunderstormOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { ClimaService, Clima } from '../services/clima.service';
import { coordenadasValidas } from '../utils/coordenadas';
import { UMBRAL_LLUVIA_MM } from '../config';

@Component({
  selector: 'app-clima',
  templateUrl: './clima.component.html',
  styleUrls: ['./clima.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonSpinner,
    IonBadge,
    IonText,
    IonIcon,
  ],
})
export class ClimaComponent implements OnInit, OnChanges {
  @Input() lat?: number | null;
  @Input() lon?: number | null;

  private climaService = inject(ClimaService);
  private cdr = inject(ChangeDetectorRef);

  clima: Clima | null = null;
  cargando = false;
  error = false;
  mensajeError = '';

  readonly umbralLluvia = UMBRAL_LLUVIA_MM;

  get esLluviaFuerte(): boolean {
    return (this.clima?.precipitacion ?? 0) >= this.umbralLluvia;
  }

  constructor() {
    addIcons({
      rainyOutline,
      sunnyOutline,
      cloudyOutline,
      thunderstormOutline,
      alertCircleOutline,
    });
  }

  ngOnInit() {
    this.cargar();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['lat'] || changes['lon']) {
      this.cargar();
    }
  }

  cargar() {
    if (!coordenadasValidas(this.lat, this.lon)) {
      this.clima = null;
      this.cargando = false;
      this.error = false;
      this.mensajeError = '';
      this.cdr.markForCheck();
      return;
    }

    this.cargando = true;
    this.error = false;
    this.mensajeError = '';
    this.cdr.markForCheck();

    this.climaService.getClima(this.lat as number, this.lon as number).subscribe({
      next: (data) => {
        this.clima = data;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.clima = null;
        this.cargando = false;
        this.error = true;
        this.mensajeError = 'No se pudo obtener el estado del clima.';
        this.cdr.markForCheck();
      },
    });
  }
}
