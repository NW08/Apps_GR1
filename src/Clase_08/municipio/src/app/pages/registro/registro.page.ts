import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButton,
  IonNote,
  IonSpinner,
  ToastController,
  AlertController,
} from '@ionic/angular';
import { IncidenciasService } from '../../core/services/incidencias.service';
import { ImagenService } from '../../core/services/imagen.service';
import { BorradorService, Borrador } from '../../core/services/borrador.service';
import { coordenadasValidas } from '../../core/utils/coordenadas';
import { FotoComponent } from '../../core/foto/foto.component';
import { UbicacionComponent } from '../../core/ubicacion/ubicacion.component';
import { ClimaComponent } from '../../core/clima/clima.component';

type Tipo = 'luminaria' | 'bache' | 'senalizacion' | 'alcantarilla' | 'parque';
type Prioridad = 'baja' | 'media' | 'alta';

const TIPOS: { valor: Tipo; texto: string }[] = [
  { valor: 'luminaria', texto: 'Luminaria dañada' },
  { valor: 'bache', texto: 'Bache' },
  { valor: 'senalizacion', texto: 'Señalización deteriorada' },
  { valor: 'alcantarilla', texto: 'Alcantarilla obstruida' },
  { valor: 'parque', texto: 'Daño en parque' },
];

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  standalone: true,
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonButton,
    IonNote,
    IonSpinner,
    FotoComponent,
    UbicacionComponent,
    ClimaComponent,
  ],
  styles: [
    `
      .seccion {
        font-size: 1.05rem;
        font-weight: 600;
        margin: 20px 0 8px;
      }
      .errores {
        margin: 16px 0;
      }
      .errores ion-note {
        display: block;
        margin: 4px 0;
      }
      ion-segment {
        margin-bottom: 8px;
      }
    `,
  ],
})
export class RegistroPage {
  private incidencias = inject(IncidenciasService);
  private imagenes = inject(ImagenService);
  private toast = inject(ToastController);
  private router = inject(Router);

  readonly tipos = TIPOS;

  tipo = signal<Tipo | ''>('');
  descripcion = signal('');
  direccion = signal('');
  sector = signal('');
  prioridad = signal<Prioridad | ''>('');
  foto = signal<string | null>(null);
  latitud = signal<number | null>(null);
  longitud = signal<number | null>(null);

  climaRevisado = signal(false);
  intentado = signal(false);
  guardando = signal(false);
  paso = signal('');

  fotoObligatoria = computed(() => this.prioridad() === 'alta');
  ubicacionObligatoria = computed(() => this.tipo() === 'bache');
  tieneCoordenadas = computed(() => {
    const lat = this.latitud();
    const lon = this.longitud();
    return lat !== null && lon !== null && coordenadasValidas(lat, lon);
  });

  errores = computed(() => {
    const e: string[] = [];
    if (!this.tipo()) e.push('Selecciona el tipo de incidencia.');
    if ((this.descripcion() ?? '').trim().length < 10) e.push('La descripción debe tener al menos 10 caracteres.');
    if (!(this.direccion() ?? '').trim()) e.push('Ingresa la dirección.');
    if (!(this.sector() ?? '').trim()) e.push('Ingresa el sector.');
    if (!this.prioridad()) e.push('Selecciona la prioridad.');
    if (this.fotoObligatoria() && !this.foto()) e.push('La prioridad alta exige una fotografía.');
    if (this.ubicacionObligatoria() && !this.tieneCoordenadas())
      e.push('Para un bache la ubicación es obligatoria (GPS o coordenadas manuales).');
    if (this.tieneCoordenadas() && !this.climaRevisado()) e.push('Consulta el clima antes de guardar.');
    return e;
  });

  onClima(c: unknown) {
    this.climaRevisado.set(c !== null);
  }

  onClimaFallo() {
    this.climaRevisado.set(true);
  }

  async guardar() {
    this.intentado.set(true);
    if (this.errores().length) {
      await this.aviso('Revisa los campos marcados antes de guardar.', 'warning');
      return;
    }

    this.guardando.set(true);
    try {
      let fotoUrl: string | null = null;
      const foto = this.foto();
      if (foto) {
        this.paso.set('Subiendo fotografía…');
        try {
          fotoUrl = await this.imagenes.subir(foto);
        } catch {
          await this.aviso('No se pudo subir la fotografía. Revisa la conexión e inténtalo de nuevo.', 'danger');
          return;
        }
      }

      this.paso.set('Guardando incidencia…');
      const creada = await firstValueFrom(
        this.incidencias.crear({
          codigo: `INC-${Date.now().toString(36).toUpperCase()}`,
          tipo: this.tipo() as Tipo,
          descripcion: this.descripcion().trim(),
          direccion: this.direccion().trim(),
          sector: this.sector().trim(),
          prioridad: this.prioridad() as Prioridad,
          estado: 'pendiente',
          fecha: new Date().toISOString(),
          fotoUrl,
          latitud: (this.tieneCoordenadas() ? this.latitud() : null) as any,
          longitud: (this.tieneCoordenadas() ? this.longitud() : null) as any,
          observacion: '',
        }),
      );

      await this.aviso(`Incidencia ${creada.codigo} registrada.`, 'success');
      await this.borrador.descartar();
      this.limpiar();
      this.router.navigate(['/incidencias'], { replaceUrl: true });
    } catch {
      await this.aviso(
        'No se pudo guardar en el servicio de oficina. Tus datos siguen en el formulario; inténtalo de nuevo.',
        'danger',
      );
    } finally {
      this.guardando.set(false);
      this.paso.set('');
    }
  }

  limpiar() {
    this.tipo.set('');
    this.descripcion.set('');
    this.direccion.set('');
    this.sector.set('');
    this.prioridad.set('');
    this.foto.set(null);
    this.latitud.set(null);
    this.longitud.set(null);
    this.climaRevisado.set(false);
    this.intentado.set(false);
  }

  private async aviso(message: string, color: string) {
    const t = await this.toast.create({ message, color, duration: 3000, position: 'bottom' });
    await t.present();
  }

  private borrador = inject(BorradorService);
  private alert = inject(AlertController);

  private autoguardado = signal(false);

  constructor() {
    // Autoguardado de campos y coordenadas
    effect(() => {
      const datos = {
        tipo: this.tipo() ?? '',
        descripcion: this.descripcion() ?? '',
        direccion: this.direccion() ?? '',
        sector: this.sector() ?? '',
        prioridad: this.prioridad() ?? '',
        latitud: this.latitud(),
        longitud: this.longitud(),
      };
      if (!this.autoguardado()) return;

      const vacio =
        !datos.tipo &&
        !datos.descripcion.trim() &&
        !datos.direccion.trim() &&
        !datos.sector.trim() &&
        !datos.prioridad &&
        datos.latitud === null;

      void this.borrador.guardarDatos(vacio ? null : { ...datos, guardadoEn: new Date().toISOString() });
    });

    // Autoguardado de la foto (clave separada)
    effect(() => {
      const foto = this.foto();
      if (!this.autoguardado()) return;
      void this.borrador.guardarFoto(foto);
    });
  }

  async ionViewWillEnter() {
    if (this.autoguardado()) return; // esta instancia ya decidió sobre el borrador

    const b = await this.borrador.obtener();
    if (!b) {
      this.autoguardado.set(true);
      return;
    }

    const cuando = b.datos.guardadoEn ? ` (guardado el ${new Date(b.datos.guardadoEn).toLocaleString('es-EC')})` : '';

    const a = await this.alert.create({
      header: 'Registro sin terminar',
      message: `Hay un registro incompleto${cuando}. ¿Deseas continuarlo o descartarlo?`,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Descartar',
          role: 'destructive',
          handler: () => {
            void this.descartarBorrador();
          },
        },
        {
          text: 'Continuar',
          handler: () => {
            void this.restaurar(b.datos, b.foto);
          },
        },
      ],
    });
    await a.present();
  }

  private async restaurar(d: Borrador, foto: string | null) {
    this.tipo.set(d.tipo as any);
    this.descripcion.set(d.descripcion);
    this.direccion.set(d.direccion);
    this.sector.set(d.sector);
    this.prioridad.set(d.prioridad as any);
    this.latitud.set(d.latitud);
    this.longitud.set(d.longitud);
    this.foto.set(foto);
    this.climaRevisado.set(false); // el clima no se recupera: se vuelve a consultar
    this.autoguardado.set(true);

    if (d.latitud !== null) {
      await this.aviso('Registro recuperado. Vuelve a consultar el clima antes de guardar.', 'primary');
    } else {
      await this.aviso('Registro recuperado.', 'primary');
    }
  }

  private async descartarBorrador() {
    await this.borrador.descartar();
    this.limpiar();
    this.autoguardado.set(true);
  }
}
