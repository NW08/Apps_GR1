import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl
} from '@angular/forms';
import {
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
  IonDatetimeButton,
  IonModal,
  IonBadge
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  personOutline,
  mailOutline,
  callOutline,
  calendarOutline,
  briefcaseOutline,
  schoolOutline,
  timeOutline,
  laptopOutline,
  cashOutline,
  documentTextOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  refreshOutline,
  sendOutline
} from 'ionicons/icons';
import { CandidatosService } from '../../services/candidatos.service';
import { Candidato } from '../../models/candidato.model';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    IonDatetimeButton,
    IonModal,
    IonBadge
  ]
})
export class RegistroPage implements OnInit {
  form!: FormGroup;
  guardando = false;
  toastAbierto = false;
  toastMensaje = '';
  toastColor: 'success' | 'danger' = 'success';

 
  cargos = [
    'Desarrollador móvil',
    'Analista de datos',
    'Diseñador UX/UI',
    'Soporte TI',
    'Desarrollador Fullstack'
  ];

  nivelesAcademicos = [
    'Bachillerato',
    'Tecnología',
    'Tercer nivel',
    'Posgrado'
  ];

  habilidadesDisponibles = [
    'Angular',
    'Ionic',
    'JavaScript',
    'Python',
    'SQL',
    'Git',
    'Firebase'
  ];


  fechaMaxNacimiento: string = '';
  fechaMinDisponibilidad: string = '';

  constructor(
    private fb: FormBuilder,
    private candidatosService: CandidatosService
  ) {
    addIcons({
      personOutline,
      mailOutline,
      callOutline,
      calendarOutline,
      briefcaseOutline,
      schoolOutline,
      timeOutline,
      laptopOutline,
      cashOutline,
      documentTextOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      refreshOutline,
      sendOutline
    });
  }

  ngOnInit() {
    const hoy = new Date();
    this.fechaMaxNacimiento = hoy.toISOString().split('T')[0];
    this.fechaMinDisponibilidad = hoy.toISOString().split('T')[0];

    this.initForm();
  }

  private initForm() {
    this.form = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9+ ]{7,15}$/)]],
      fechaNacimiento: ['', [Validators.required]],
      cargo: ['', [Validators.required]],
      nivelAcademico: ['', [Validators.required]],
      experienciaAnios: [0, [Validators.required, Validators.min(0), Validators.max(50)]],
      modalidad: ['Híbrida', [Validators.required]],
      habilidades: this.fb.array([], [Validators.required]),
      fechaDisponibilidad: ['', [Validators.required]],
      aspiracionSalarial: [null, [Validators.required, Validators.min(1)]],
      resumen: ['', [Validators.required, Validators.minLength(30)]],
      consentimiento: [false, [Validators.requiredTrue]]
    });
  }

  get habilidadesArray(): FormArray {
    return this.form.get('habilidades') as FormArray;
  }

  onHabilidadChange(event: any, habilidad: string) {
    const isChecked = event.detail.checked;
    if (isChecked) {
      this.habilidadesArray.push(new FormControl(habilidad));
    } else {
      const index = this.habilidadesArray.controls.findIndex(c => c.value === habilidad);
      if (index >= 0) {
        this.habilidadesArray.removeAt(index);
      }
    }
    this.habilidadesArray.markAsTouched();
  }

  isHabilidadSelected(habilidad: string): boolean {
    return this.habilidadesArray.controls.some(c => c.value === habilidad);
  }

  async guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mostrarToast('Por favor completa todos los campos requeridos correctamente.', 'danger');
      return;
    }

    if (this.habilidadesArray.length === 0) {
      this.mostrarToast('Selecciona al menos una habilidad técnica.', 'danger');
      return;
    }

    this.guardando = true;

    try {
      const formValue = this.form.value;
      const candidatoData: Omit<Candidato, 'id' | 'creadoEn'> = {
        nombres: formValue.nombres.trim(),
        correo: formValue.correo.trim().toLowerCase(),
        telefono: formValue.telefono.trim(),
        fechaNacimiento: formValue.fechaNacimiento.split('T')[0],
        cargo: formValue.cargo,
        nivelAcademico: formValue.nivelAcademico,
        experienciaAnios: Number(formValue.experienciaAnios),
        modalidad: formValue.modalidad,
        habilidades: formValue.habilidades,
        fechaDisponibilidad: formValue.fechaDisponibilidad.split('T')[0],
        aspiracionSalarial: Number(formValue.aspiracionSalarial),
        resumen: formValue.resumen.trim(),
        consentimiento: Boolean(formValue.consentimiento)
      };

      await this.candidatosService.guardarCandidato(candidatoData);

      this.mostrarToast('¡Postulación guardada exitosamente en Firestore!', 'success');
      this.limpiar();
    } catch (error) {
      console.error('Error al guardar en Firestore:', error);
      this.mostrarToast('Ocurrió un error al guardar en la nube. Intenta nuevamente.', 'danger');
    } finally {
      this.guardando = false;
    }
  }

  limpiar() {
    this.habilidadesArray.clear();
    this.form.reset({
      modalidad: 'Híbrida',
      experienciaAnios: 0,
      consentimiento: false
    });
  }

  mostrarToast(mensaje: string, color: 'success' | 'danger') {
    this.toastMensaje = mensaje;
    this.toastColor = color;
    this.toastAbierto = true;
  }
}
