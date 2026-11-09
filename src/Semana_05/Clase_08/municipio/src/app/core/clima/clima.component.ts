import {
  Component,
  OnInit,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
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
  IonButton,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  rainyOutline,
  sunnyOutline,
  cloudyOutline,
  thunderstormOutline,
  alertCircleOutline,
  warningOutline,
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
    IonButton,
  ],
})
export class ClimaComponent implements OnInit {
  latitud = input<number | null>(null);
  longitud = input<number | null>(null);

  consultado = output<Clima | null>();
  fallo = output<void>();

  private climaService = inject(ClimaService);
  private cdr = inject(ChangeDetectorRef);

  clima = signal<Clima | null>(null);
  cargando = signal(false);
  error = signal<string | null>(null);

  seq = 0;
  readonly umbralLluvia = UMBRAL_LLUVIA_MM;

  esLluviaFuerte = computed(() => (this.clima()?.precipitacion ?? 0) >= this.umbralLluvia);

  constructor() {
    addIcons({
      rainyOutline,
      sunnyOutline,
      cloudyOutline,
      thunderstormOutline,
      alertCircleOutline,
      warningOutline,
    });

    // Si cambian las coordenadas, el clima mostrado se reinicia y se re-consulta si son válidas
    effect(() => {
      const lat = this.latitud();
      const lon = this.longitud();
      untracked(() => {
        this.seq++;
        this.clima.set(null);
        this.error.set(null);
        this.cargando.set(false);
        this.consultado.emit(null);
        if (coordenadasValidas(lat, lon)) {
          this.cargar();
        }
      });
    });
  }

  ngOnInit() {
    if (coordenadasValidas(this.latitud(), this.longitud())) {
      this.cargar();
    }
  }

  cargar() {
    const lat = this.latitud();
    const lon = this.longitud();
    if (!coordenadasValidas(lat, lon)) {
      this.clima.set(null);
      this.cargando.set(false);
      this.error.set(null);
      this.cdr.markForCheck();
      return;
    }

    const currentSeq = ++this.seq;
    this.cargando.set(true);
    this.error.set(null);
    this.cdr.markForCheck();

    this.climaService.getClima(lat as number, lon as number).subscribe({
      next: (data) => {
        if (this.seq !== currentSeq) return;
        this.clima.set(data);
        this.cargando.set(false);
        this.consultado.emit(data);
        this.cdr.markForCheck();
      },
      error: () => {
        if (this.seq !== currentSeq) return;
        this.clima.set(null);
        this.cargando.set(false);
        this.error.set('No se pudo obtener el estado del clima.');
        this.consultado.emit(null);
        this.fallo.emit();
        this.cdr.markForCheck();
      },
    });
  }
}
