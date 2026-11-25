import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCheckbox,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSpinner,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
  NavController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cameraOutline, locateOutline, refreshOutline, saveOutline, warningOutline } from 'ionicons/icons';
import { mapearError } from '../../core/errors/supabase-error.mapper';
import { ToastService } from '../../core/ui/toast.service';
import { ActasRepository } from '../../data/repositories/actas.repository';
import { CatalogoRepository } from '../../data/repositories/catalogo.repository';
import { MesasRepository } from '../../data/repositories/mesas.repository';
import { FotosRepository } from '../../data/storage/fotos.repository';
import { CamaraService, type FotoCapturada } from '../../device/camara.service';
import { UbicacionService, type Ubicacion } from '../../device/ubicacion.service';
import type { Acta, Dignidad } from '../../domain/models/acta';
import type { Candidatura } from '../../domain/models/candidatura';
import type { Estado } from '../../domain/models/estado';
import type { Mesa } from '../../domain/models/mesa';
import { evaluarConsistencia, MIN_OBSERVACION, validarObservada } from '../../domain/rules/acta-consistency';
import { EstadoVistaComponent } from '../../shared/components/estado-vista.component';

type ActaForm = FormGroup<{
  votos: FormArray<FormControl<number>>;
  nulos: FormControl<number>;
  blancos: FormControl<number>;
  totalSufragantes: FormControl<number>;
  esInconsistente: FormControl<boolean>;
  observacion: FormControl<string>;
}>;

interface DatosPantalla {
  mesa: Mesa;
  candidaturas: Candidatura[];
  acta: Acta | null;
}

const enteroNoNegativo = [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)];

// Si no cuadra, solo es válida marcada como inconsistente con observación (el servidor repite la regla).
const consistenciaActa: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const v = (c as ActaForm).getRawValue();
  const r = evaluarConsistencia({ votos: v.votos, nulos: v.nulos, blancos: v.blancos, totalSufragantes: v.totalSufragantes });
  if (r.consistente) return null;
  return validarObservada(v.esInconsistente, v.observacion) ? null : { inconsistente: r.mensaje };
};

@Component({
  selector: 'app-acta-form',
  imports: [
    ReactiveFormsModule,
    EstadoVistaComponent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonNote,
    IonCheckbox,
    IonTextarea,
    IonButton,
    IonIcon,
    IonSpinner,
    IonText,
    IonChip,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/"></ion-back-button></ion-buttons>
        <ion-title>Acta {{ dignidad() === 'alcalde' ? 'Alcaldía' : 'Prefectura' }}{{ tituloMesa() }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <app-estado-vista [estado]="estado()">
        <form [formGroup]="form" (ngSubmit)="guardar()">
          @if (actaExistente(); as a) {
            <div class="ion-padding-horizontal ion-padding-top">
              <ion-chip [color]="a.estado === 'OBSERVADA' ? 'warning' : 'success'">
                {{ a.estado }} · versión {{ a.version }}
              </ion-chip>
              <ion-note>Está corrigiendo un acta ya registrada.</ion-note>
            </div>
          }

          <ion-list>
            <ion-item lines="none"><ion-label><h2>Votos por organización</h2></ion-label></ion-item>
            @for (c of candidaturas(); track c.id; let i = $index) {
              <ion-item>
                <ion-input
                  type="number"
                  inputmode="numeric"
                  min="0"
                  labelPlacement="stacked"
                  [label]="c.lista + ' · ' + c.organizacionNombre + ' (' + c.nombre + ')'"
                  [formControl]="form.controls.votos.at(i)"
                ></ion-input>
              </ion-item>
            }
            <ion-item>
              <ion-input type="number" inputmode="numeric" min="0" label="Votos nulos" labelPlacement="stacked" formControlName="nulos"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input type="number" inputmode="numeric" min="0" label="Votos blancos" labelPlacement="stacked" formControlName="blancos"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input
                type="number"
                inputmode="numeric"
                min="0"
                label="Total de sufragantes"
                labelPlacement="stacked"
                formControlName="totalSufragantes"
              ></ion-input>
            </ion-item>
          </ion-list>

          <div class="ion-padding-horizontal">
            <ion-text [color]="consistencia().consistente ? 'success' : 'danger'">
              <p>
                <strong>{{ consistencia().mensaje }}</strong> — suma {{ consistencia().total }} de {{ valores().totalSufragantes }}
                sufragantes.
              </p>
            </ion-text>
          </div>

          @if (!consistencia().consistente) {
            <ion-list>
              <ion-item>
                <ion-checkbox formControlName="esInconsistente" labelPlacement="end">El acta física presenta inconsistencia</ion-checkbox>
              </ion-item>
              @if (valores().esInconsistente) {
                <ion-item>
                  <ion-textarea
                    formControlName="observacion"
                    label="Observación (obligatoria)"
                    labelPlacement="stacked"
                    [autoGrow]="true"
                    [counter]="true"
                    maxlength="500"
                    placeholder="Describa la inconsistencia del acta física"
                  ></ion-textarea>
                </ion-item>
                @if (valores().observacion.trim().length < minObservacion && intentoGuardar()) {
                  <ion-text color="danger" class="ion-padding-horizontal"><small>Mínimo {{ minObservacion }} caracteres.</small></ion-text>
                }
              } @else if (intentoGuardar()) {
                <ion-text color="danger" class="ion-padding-horizontal">
                  <small>Corrija los totales o marque el acta como inconsistente con una observación.</small>
                </ion-text>
              }
            </ion-list>
          }

          <ion-card>
            <ion-card-header><ion-card-title>Fotografía del acta</ion-card-title></ion-card-header>
            <ion-card-content>
              @if (vistaPrevia(); as src) {
                <img [src]="src" alt="Foto del acta" class="foto" />
              }
              @if (foto(); as f) {
                @if (!f.nitidez.aceptada) {
                  <ion-text color="danger">
                    <p>
                      <ion-icon name="warning-outline"></ion-icon> {{ f.nitidez.motivo }} (nitidez {{ f.nitidez.varianza.toFixed(0) }},
                      brillo {{ f.nitidez.brilloMedio.toFixed(0) }}). Vuelva a tomarla con buena luz y sin mover el teléfono.
                    </p>
                  </ion-text>
                } @else {
                  <ion-text color="success"><p>Foto nítida (nitidez {{ f.nitidez.varianza.toFixed(0) }}).</p></ion-text>
                }
              }
              <ion-button expand="block" fill="outline" (click)="tomarFoto()" [disabled]="tomando()">
                @if (tomando()) {
                  <ion-spinner name="crescent"></ion-spinner>
                } @else {
                  <ion-icon slot="start" name="camera-outline"></ion-icon>
                  {{ foto() || actaExistente() ? 'Repetir foto' : 'Tomar foto' }}
                }
              </ion-button>

              @if (ubicacion(); as u) {
                <ion-text color="success">
                  <p><ion-icon name="locate-outline"></ion-icon> GPS: {{ u.lat.toFixed(5) }}, {{ u.lng.toFixed(5) }} (±{{ u.precisionM }} m)</p>
                </ion-text>
              } @else if (errorGps(); as eg) {
                <ion-text color="warning">
                  <p><ion-icon name="warning-outline"></ion-icon> {{ eg }}</p>
                  <p><strong>Ubicación no comprobable:</strong> el acta se guardará con esta etiqueta.</p>
                </ion-text>
                <ion-button size="small" fill="clear" (click)="tomarGps()" [disabled]="buscandoGps()">
                  <ion-icon slot="start" name="refresh-outline"></ion-icon> Reintentar GPS
                </ion-button>
              } @else if (buscandoGps()) {
                <p><ion-spinner name="dots"></ion-spinner> Obteniendo ubicación…</p>
              }
              @if (intentoGuardar() && !fotoLista()) {
                <ion-text color="danger"><small>Se requiere una foto nítida del acta.</small></ion-text>
              }
            </ion-card-content>
          </ion-card>

          <div class="ion-padding">
            <ion-button expand="block" type="submit" [disabled]="guardando()">
              @if (guardando()) {
                <ion-spinner name="crescent"></ion-spinner>
              } @else {
                <ion-icon slot="start" name="save-outline"></ion-icon> Guardar acta
              }
            </ion-button>
          </div>
        </form>
      </app-estado-vista>
    </ion-content>
  `,
  styles: `
    .foto {
      width: 100%;
      border-radius: 8px;
      margin-bottom: 8px;
    }
  `,
})
export class ActaFormPage {
  readonly jrvId = input.required<string>();
  readonly dignidad = input.required<Dignidad>();

  private readonly mesasRepo = inject(MesasRepository);
  private readonly catalogo = inject(CatalogoRepository);
  private readonly actasRepo = inject(ActasRepository);
  private readonly fotosRepo = inject(FotosRepository);
  private readonly camara = inject(CamaraService);
  private readonly gps = inject(UbicacionService);
  private readonly toast = inject(ToastService);
  private readonly nav = inject(NavController);

  protected readonly minObservacion = MIN_OBSERVACION;
  protected readonly estado = signal<Estado<DatosPantalla>>({ tipo: 'cargando' });
  protected readonly candidaturas = signal<Candidatura[]>([]);
  protected readonly actaExistente = signal<Acta | null>(null);
  protected readonly mesa = signal<Mesa | null>(null);
  protected readonly foto = signal<FotoCapturada | null>(null);
  protected readonly urlFotoExistente = signal<string | null>(null);
  protected readonly ubicacion = signal<Ubicacion | null>(null);
  protected readonly errorGps = signal<string | null>(null);
  protected readonly tomando = signal(false);
  protected readonly buscandoGps = signal(false);
  protected readonly guardando = signal(false);
  protected readonly intentoGuardar = signal(false);

  protected readonly form: ActaForm = new FormGroup(
    {
      votos: new FormArray<FormControl<number>>([]),
      nulos: new FormControl(0, { nonNullable: true, validators: enteroNoNegativo }),
      blancos: new FormControl(0, { nonNullable: true, validators: enteroNoNegativo }),
      totalSufragantes: new FormControl(0, { nonNullable: true, validators: enteroNoNegativo }),
      esInconsistente: new FormControl(false, { nonNullable: true }),
      observacion: new FormControl('', { nonNullable: true }),
    },
    { validators: consistenciaActa },
  );

  protected readonly valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() }) as () => ReturnType<
    ActaForm['getRawValue']
  >;

  protected readonly consistencia = computed(() => {
    const v = { ...this.form.getRawValue(), ...this.valores() };
    return evaluarConsistencia({
      votos: (v.votos ?? []).map(Number),
      nulos: Number(v.nulos),
      blancos: Number(v.blancos),
      totalSufragantes: Number(v.totalSufragantes),
    });
  });

  protected readonly tituloMesa = computed(() => (this.mesa() ? ` · JRV ${this.mesa()!.numero}` : ''));
  protected readonly vistaPrevia = computed(() => this.foto()?.dataUrl ?? this.urlFotoExistente());
  protected readonly fotoLista = computed(() => (this.foto() ? this.foto()!.nitidez.aceptada : !!this.actaExistente()?.fotoPath));

  constructor() {
    addIcons({ cameraOutline, locateOutline, refreshOutline, saveOutline, warningOutline });
    effect(() => {
      const jrvId = this.jrvId();
      const dignidad = this.dignidad();
      untracked(() => void this.cargar(jrvId, dignidad));
    });
  }

  private async cargar(jrvId: string, dignidad: Dignidad): Promise<void> {
    this.estado.set({ tipo: 'cargando' });
    try {
      const [mesa, candidaturas, acta] = await Promise.all([
        this.mesasRepo.obtener(jrvId),
        this.catalogo.candidaturas(dignidad),
        this.actasRepo.obtener(jrvId, dignidad),
      ]);
      if (!mesa) {
        // RLS no devuelve mesas ajenas (R8).
        this.estado.set({ tipo: 'error', error: { codigo: 'sin-permiso', mensaje: 'No tiene acceso a esta mesa.' } });
        return;
      }
      this.mesa.set(mesa);
      this.candidaturas.set(candidaturas);
      this.actaExistente.set(acta);
      this.prepararFormulario(candidaturas, acta);
      if (acta?.fotoPath) {
        this.fotosRepo.urlFirmada(acta.fotoPath).then(
          (u) => this.urlFotoExistente.set(u),
          () => this.urlFotoExistente.set(null),
        );
      }
      this.estado.set({ tipo: 'exito', datos: { mesa, candidaturas, acta } });
    } catch (e) {
      this.estado.set({ tipo: 'error', error: mapearError(e), reintentar: () => this.cargar(jrvId, dignidad) });
    }
  }

  private prepararFormulario(candidaturas: Candidatura[], acta: Acta | null): void {
    const votos = this.form.controls.votos;
    votos.clear({ emitEvent: false });
    for (const c of candidaturas) {
      const previo = acta?.votos.find((v) => v.candidaturaId === c.id)?.votos ?? 0;
      votos.push(new FormControl(previo, { nonNullable: true, validators: enteroNoNegativo }), { emitEvent: false });
    }
    this.form.patchValue({
      nulos: acta?.nulos ?? 0,
      blancos: acta?.blancos ?? 0,
      totalSufragantes: acta?.totalSufragantes ?? 0,
      esInconsistente: acta?.estado === 'OBSERVADA',
      observacion: acta?.observacion ?? '',
    });
    if (acta && acta.lat !== null && acta.lng !== null) {
      this.ubicacion.set({
        lat: acta.lat,
        lng: acta.lng,
        precisionM: acta.precisionM ?? 0,
        capturadoEn: acta.capturadoEn ?? acta.actualizadoEn,
      });
    }
  }

  protected async tomarFoto(): Promise<void> {
    this.tomando.set(true);
    try {
      const f = await this.camara.tomarFoto();
      if (!f) return;
      this.foto.set(f);
      if (f.nitidez.aceptada) {
        await this.tomarGps();
      } else {
        await this.toast.error(`${f.nitidez.motivo}: repita la foto.`);
      }
    } catch (e) {
      await this.toast.error((e as Error)?.message ?? 'No se pudo tomar la foto.');
    } finally {
      this.tomando.set(false);
    }
  }

  protected async tomarGps(): Promise<void> {
    this.buscandoGps.set(true);
    this.errorGps.set(null);
    try {
      this.ubicacion.set(await this.gps.obtener());
    } catch (e) {
      this.ubicacion.set(null);
      this.errorGps.set((e as Error)?.message ?? 'No se pudo obtener la ubicación.');
    } finally {
      this.buscandoGps.set(false);
    }
  }

  protected async guardar(): Promise<void> {
    this.intentoGuardar.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.fotoLista()) {
      await this.toast.error(
        !this.fotoLista()
          ? 'Falta una foto nítida del acta.'
          : this.form.errors?.['inconsistente']
            ? `${this.form.errors['inconsistente']}: corrija los totales o márquela como observada.`
            : 'Revise los campos: solo números enteros mayores o iguales a 0.',
      );
      return;
    }
    const mesa = this.mesa()!;
    const existente = this.actaExistente();
    const v = this.form.getRawValue();
    const c = this.consistencia();
    this.guardando.set(true);
    try {
      let fotoPath = existente?.fotoPath ?? '';
      const nueva = this.foto();
      if (nueva) fotoPath = await this.fotosRepo.subir(mesa.recintoId, mesa.id, this.dignidad(), nueva.blob);

      // Sin foto nueva se conserva la ubicación anterior.
      const u = this.ubicacion();
      const ubicacionComprobable = nueva ? !!u : (existente?.ubicacionComprobable ?? !!u);

      await this.actasRepo.guardar({
        jrvId: mesa.id,
        dignidad: this.dignidad(),
        votos: this.candidaturas().map((cand, i) => ({ candidaturaId: cand.id, votos: Number(v.votos[i]) })),
        nulos: Number(v.nulos),
        blancos: Number(v.blancos),
        totalSufragantes: Number(v.totalSufragantes),
        fotoPath,
        lat: u?.lat ?? null,
        lng: u?.lng ?? null,
        precisionM: u?.precisionM ?? null,
        capturadoEn: u?.capturadoEn ?? null,
        ubicacionComprobable,
        esInconsistente: !c.consistente && v.esInconsistente,
        observacion: !c.consistente && v.esInconsistente ? v.observacion.trim() : null,
        versionBase: existente?.version ?? null,
      });
      await this.toast.exito(existente ? 'Acta corregida correctamente.' : 'Acta registrada correctamente.');
      this.nav.back();
    } catch (e) {
      await this.toast.error(mapearError(e).mensaje);
    } finally {
      this.guardando.set(false);
    }
  }
}
