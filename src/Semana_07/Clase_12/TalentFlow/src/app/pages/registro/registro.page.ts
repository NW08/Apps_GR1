import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonAccordion,
  IonAccordionGroup,
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCheckbox,
  IonContent,
  IonDatetime,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonRadio,
  IonRadioGroup,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  briefcaseOutline,
  calendarOutline,
  cashOutline,
  closeOutline,
  documentTextOutline,
  personOutline,
  refreshOutline,
  saveOutline,
  sendOutline,
} from 'ionicons/icons';

import type { CandidatoForm } from '../../models/candidato.model';
import { CandidatosService } from '../../services/candidatos.service';
import {
  entero,
  fechaDesdeHoy,
  fechaNoFutura,
  hoyISO,
  mayorQueCero,
  normalizarTelefono,
  soloFecha,
  telefonoValido,
  textoMinimo,
} from '../../validators/candidato.validators';

type ToastColor = 'success' | 'danger';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  imports: [
    ReactiveFormsModule,
    IonAccordion,
    IonAccordionGroup,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonRadioGroup,
    IonRadio,
    IonCheckbox,
    IonButton,
    IonIcon,
    IonSpinner,
    IonSegment,
    IonSegmentButton,
    IonDatetime,
    IonBadge,
  ],
})
export class RegistroPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly candidatosService = inject(CandidatosService);
  private readonly toastCtrl = inject(ToastController);
  private readonly router = inject(Router);

  readonly cargos = [
    'Desarrollador móvil',
    'Analista de datos',
    'Diseñador UX/UI',
    'Soporte TI',
    'Desarrollador Fullstack',
  ];
  readonly nivelesAcademicos = ['Bachillerato', 'Tecnología', 'Tercer nivel', 'Posgrado'];
  readonly modalidades = ['Presencial', 'Híbrida', 'Remota'];
  readonly habilidadesDisponibles = ['Angular', 'Ionic', 'JavaScript', 'Python', 'SQL', 'Git', 'Firebase'];

  readonly hoy = hoyISO();

  readonly form = this.fb.group({
    nombres: ['', [Validators.required, textoMinimo(3)]],
    correo: ['', [Validators.required, Validators.email, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)]],
    telefono: ['', [Validators.required, telefonoValido]],
    // null y no '': ion-datetime no interpreta una cadena vacía.
    fechaNacimiento: this.fb.control<string | null>(null, [Validators.required, fechaNoFutura]),
    cargo: ['', Validators.required],
    nivelAcademico: ['', Validators.required],
    experienciaAnios: [0, [Validators.required, Validators.min(0), Validators.max(50), entero]],
    modalidad: ['Híbrida', Validators.required],
    habilidades: this.fb.control<string[]>([], Validators.required),
    fechaDisponibilidad: this.fb.control<string | null>(null, [Validators.required, fechaDesdeHoy]),
    aspiracionSalarial: this.fb.control<number | null>(null, [Validators.required, mayorQueCero]),
    resumen: ['', [Validators.required, textoMinimo(30)]],
    consentimiento: [false, Validators.requiredTrue],
  });

  // La app es zoneless: el estado que cambia tras un await debe ser un signal para refrescar la vista.
  readonly guardando = signal(false);
  readonly editandoId = signal<string | null>(null);
  readonly cargandoPerfil = signal(false);

  constructor() {
    addIcons({
      alertCircleOutline,
      briefcaseOutline,
      calendarOutline,
      cashOutline,
      closeOutline,
      documentTextOutline,
      personOutline,
      refreshOutline,
      saveOutline,
      sendOutline,
    });

    inject(ActivatedRoute)
      .queryParamMap.pipe(takeUntilDestroyed())
      .subscribe((params) => void this.prepararFormulario(params.get('editar')));
  }

  formatearFecha(valor: string | null): string {
    return valor ? soloFecha(valor) : 'Toca para seleccionar fecha';
  }

  invalido(campo: keyof RegistroPage['form']['controls']): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }

  habilidadSeleccionada(habilidad: string): boolean {
    return this.form.controls.habilidades.value.includes(habilidad);
  }

  toggleHabilidad(habilidad: string, marcada: boolean): void {
    const control = this.form.controls.habilidades;
    const actuales = control.value.filter((h) => h !== habilidad);
    control.setValue(marcada ? [...actuales, habilidad] : actuales);
    control.markAsTouched();
  }

  async guardar(): Promise<void> {
    if (this.guardando() || this.cargandoPerfil()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      await this.mostrarToast('Por favor completa todos los campos requeridos correctamente.', 'danger');
      return;
    }

    const id = this.editandoId();
    this.guardando.set(true);
    try {
      const candidato = this.datosFormulario();
      if (id) {
        await this.candidatosService.actualizarCandidato(id, candidato);
        await this.mostrarToast('¡Perfil actualizado correctamente en Firestore!', 'success');
        await this.salirDeEdicion();
      } else {
        await this.candidatosService.guardarCandidato(candidato);
        await this.mostrarToast('¡Postulación guardada exitosamente en Firestore!', 'success');
        this.limpiar();
      }
    } catch (error) {
      console.error('Error al guardar en Firestore:', error);
      await this.mostrarToast('Ocurrió un error al guardar en la nube. Intenta nuevamente.', 'danger');
    } finally {
      this.guardando.set(false);
    }
  }

  limpiar(): void {
    // Con NonNullableFormBuilder, reset() vuelve a los valores iniciales y no a null.
    this.form.reset();
  }

  async cancelarEdicion(): Promise<void> {
    await this.salirDeEdicion();
  }

  private async prepararFormulario(id: string | null): Promise<void> {
    if (!id) {
      if (this.editandoId()) {
        this.editandoId.set(null);
        this.limpiar();
      }
      return;
    }
    if (id === this.editandoId()) return;

    this.cargandoPerfil.set(true);
    try {
      const candidato = await this.candidatosService.obtenerCandidatoPorId(id);
      if (!candidato) {
        await this.mostrarToast('El candidato que intentas editar ya no existe.', 'danger');
        await this.router.navigate(['/tabs/candidatos'], { replaceUrl: true });
        return;
      }
      this.limpiar();
      this.form.patchValue({
        nombres: candidato.nombres,
        correo: candidato.correo,
        telefono: candidato.telefono,
        fechaNacimiento: candidato.fechaNacimiento,
        cargo: candidato.cargo,
        nivelAcademico: candidato.nivelAcademico,
        experienciaAnios: candidato.experienciaAnios,
        modalidad: candidato.modalidad,
        habilidades: candidato.habilidades ?? [],
        fechaDisponibilidad: candidato.fechaDisponibilidad,
        aspiracionSalarial: candidato.aspiracionSalarial,
        resumen: candidato.resumen,
        consentimiento: candidato.consentimiento,
      });
      // Señala de inmediato los datos guardados que ya no son válidos (p. ej. una disponibilidad pasada).
      this.form.markAllAsTouched();
      this.editandoId.set(id);
    } catch (error) {
      console.error('Error al cargar el candidato:', error);
      await this.mostrarToast('No se pudo cargar el perfil para editar.', 'danger');
    } finally {
      this.cargandoPerfil.set(false);
    }
  }

  private async salirDeEdicion(): Promise<void> {
    this.editandoId.set(null);
    this.limpiar();
    await this.router.navigate(['/tabs/candidatos'], { replaceUrl: true });
  }

  private datosFormulario(): CandidatoForm {
    const v = this.form.getRawValue();
    return {
      nombres: v.nombres.trim(),
      correo: v.correo.trim().toLowerCase(),
      telefono: normalizarTelefono(v.telefono),
      fechaNacimiento: soloFecha(v.fechaNacimiento),
      cargo: v.cargo,
      nivelAcademico: v.nivelAcademico,
      experienciaAnios: Number(v.experienciaAnios),
      modalidad: v.modalidad,
      habilidades: v.habilidades,
      fechaDisponibilidad: soloFecha(v.fechaDisponibilidad),
      aspiracionSalarial: Number(v.aspiracionSalarial),
      resumen: v.resumen.trim(),
      consentimiento: v.consentimiento,
    };
  }

  private async mostrarToast(mensaje: string, color: ToastColor): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      color,
      duration: 3500,
      position: 'bottom',
      positionAnchor: 'tf-tab-bar',
    });
    await toast.present();
  }
}
