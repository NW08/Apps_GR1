import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
  IonToast,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  briefcaseOutline,
  calendarOutline,
  cashOutline,
  documentTextOutline,
  personOutline,
  refreshOutline,
  sendOutline,
} from 'ionicons/icons';

import type { Candidato } from '../../models/candidato.model';
import { CandidatosService } from '../../services/candidatos.service';
import {
  entero,
  fechaDesdeHoy,
  fechaNoFutura,
  hoyISO,
  mayorQueCero,
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
    IonToast,
    IonSegment,
    IonSegmentButton,
    IonDatetime,
    IonBadge,
  ],
})
export class RegistroPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly candidatosService = inject(CandidatosService);

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

  /** Límite de fechas para los ion-datetime (fecha local, no UTC). */
  readonly hoy = hoyISO();

  readonly form = this.fb.group({
    // Datos personales
    nombres: ['', [Validators.required, textoMinimo(3)]],
    correo: ['', [Validators.required, Validators.email, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)]],
    telefono: ['', [Validators.required, telefonoValido]],
    // null (no '') porque ion-datetime no puede interpretar una cadena vacía y ion-datetime-button no se renderiza
    fechaNacimiento: this.fb.control<string | null>(null, [Validators.required, fechaNoFutura]),
    // Perfil profesional
    cargo: ['', Validators.required],
    nivelAcademico: ['', Validators.required],
    experienciaAnios: [0, [Validators.required, Validators.min(0), Validators.max(50), entero]],
    modalidad: ['Híbrida', Validators.required],
    habilidades: this.fb.control<string[]>([], Validators.required),
    // Disponibilidad
    fechaDisponibilidad: this.fb.control<string | null>(null, [Validators.required, fechaDesdeHoy]),
    aspiracionSalarial: this.fb.control<number | null>(null, [Validators.required, mayorQueCero]),
    // Presentación y consentimiento
    resumen: ['', [Validators.required, textoMinimo(30)]],
    consentimiento: [false, Validators.requiredTrue],
  });

  // La app es zoneless: el estado que cambia tras un await debe ser un signal para refrescar la vista.
  readonly guardando = signal(false);
  readonly toastAbierto = signal(false);
  readonly toastMensaje = signal('');
  readonly toastColor = signal<ToastColor>('success');

  constructor() {
    addIcons({
      alertCircleOutline,
      briefcaseOutline,
      calendarOutline,
      cashOutline,
      documentTextOutline,
      personOutline,
      refreshOutline,
      sendOutline,
    });
  }

  formatearFecha(valor: string | null): string {
    if (!valor) return 'Toca para seleccionar fecha';
    return valor.split('T')[0];
  }

  /** Muestra el error de un campo solo después de que el usuario lo tocó o intentó guardar. */
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
    if (this.guardando()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mostrarToast('Por favor completa todos los campos requeridos correctamente.', 'danger');
      return;
    }

    this.guardando.set(true);
    try {
      const v = this.form.getRawValue();
      const candidato: Omit<Candidato, 'id' | 'creadoEn'> = {
        nombres: v.nombres.trim(),
        correo: v.correo.trim().toLowerCase(),
        telefono: v.telefono.trim(),
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

      await this.candidatosService.guardarCandidato(candidato);

      this.mostrarToast('¡Postulación guardada exitosamente en Firestore!', 'success');
      this.limpiar();
    } catch (error) {
      console.error('Error al guardar en Firestore:', error);
      this.mostrarToast('Ocurrió un error al guardar en la nube. Intenta nuevamente.', 'danger');
    } finally {
      this.guardando.set(false);
    }
  }

  limpiar(): void {
    // Con NonNullableFormBuilder, reset() vuelve a los valores iniciales definidos arriba.
    this.form.reset();
  }

  private mostrarToast(mensaje: string, color: ToastColor): void {
    this.toastMensaje.set(mensaje);
    this.toastColor.set(color);
    this.toastAbierto.set(true);
  }
}
