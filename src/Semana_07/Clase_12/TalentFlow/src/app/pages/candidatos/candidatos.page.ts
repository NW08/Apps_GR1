import { NgClass } from '@angular/common';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import type { ViewWillEnter } from '@ionic/angular';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonLabel,
  IonModal,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import type { Timestamp } from 'firebase/firestore';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  briefcaseOutline,
  calendarOutline,
  callOutline,
  cashOutline,
  closeOutline,
  createOutline,
  documentTextOutline,
  eyeOutline,
  laptopOutline,
  mailOutline,
  peopleOutline,
  personOutline,
  refreshOutline,
  schoolOutline,
  searchOutline,
  shieldCheckmarkOutline,
  sparklesOutline,
  timeOutline,
} from 'ionicons/icons';

import type { Candidato } from '../../models/candidato.model';
import { CandidatosService } from '../../services/candidatos.service';

type Orden = 'recientes' | 'antiguos';

@Component({
  selector: 'app-candidatos',
  templateUrl: './candidatos.page.html',
  styleUrls: ['./candidatos.page.scss'],
  imports: [
    NgClass,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonFooter,
    IonCard,
    IonButton,
    IonIcon,
    IonLabel,
    IonSpinner,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonRefresher,
    IonRefresherContent,
    IonModal,
    IonButtons,
  ],
})
export class CandidatosPage implements ViewWillEnter {
  private readonly candidatosService = inject(CandidatosService);
  private readonly toastCtrl = inject(ToastController);
  private readonly router = inject(Router);
  private readonly modalDetalle = viewChild(IonModal);

  // La app es zoneless: el estado que cambia tras un await debe ser un signal para refrescar la vista.
  /** Candidatos tal como llegan de Firestore (orden descendente por `creadoEn`). */
  readonly candidatos = signal<Candidato[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal(false);
  readonly filtroTexto = signal('');
  readonly orden = signal<Orden>('recientes');

  readonly modalDetalleAbierto = signal(false);
  readonly candidatoSeleccionado = signal<Candidato | null>(null);

  readonly candidatosFiltrados = computed(() => {
    const texto = this.filtroTexto().trim().toLowerCase();
    const filtrados = texto
      ? this.candidatos().filter(
          (c) =>
            c.nombres.toLowerCase().includes(texto) ||
            c.cargo.toLowerCase().includes(texto) ||
            c.modalidad.toLowerCase().includes(texto) ||
            c.habilidades.some((h) => h.toLowerCase().includes(texto)),
        )
      : this.candidatos();
    // Firestore ya entrega del más reciente al más antiguo; "antiguos" solo invierte ese orden.
    return this.orden() === 'antiguos' ? [...filtrados].reverse() : filtrados;
  });

  constructor() {
    addIcons({
      alertCircleOutline,
      briefcaseOutline,
      calendarOutline,
      callOutline,
      cashOutline,
      closeOutline,
      createOutline,
      documentTextOutline,
      eyeOutline,
      laptopOutline,
      mailOutline,
      peopleOutline,
      personOutline,
      refreshOutline,
      schoolOutline,
      searchOutline,
      shieldCheckmarkOutline,
      sparklesOutline,
      timeOutline,
    });
  }

  /** Ionic conserva la página en caché: se recarga cada vez que se entra para reflejar registros y ediciones. */
  ionViewWillEnter(): void {
    void this.cargarCandidatos();
  }

  /** Consulta la colección; el spinner de pantalla completa solo aparece si aún no hay datos. */
  async cargarCandidatos(event?: Event): Promise<void> {
    this.cargando.set(!event && this.candidatos().length === 0);
    try {
      this.candidatos.set(await this.candidatosService.obtenerCandidatos());
      this.errorCarga.set(false);
    } catch (error) {
      console.error('Error al obtener candidatos de Firestore:', error);
      this.errorCarga.set(true);
      await this.mostrarError('No se pudieron cargar los candidatos. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      this.cargando.set(false);
      await (event?.target as HTMLIonRefresherElement | undefined)?.complete();
    }
  }

  buscar(valor: string | null | undefined): void {
    this.filtroTexto.set(valor ?? '');
  }

  cambiarOrden(valor: unknown): void {
    this.orden.set(valor === 'antiguos' ? 'antiguos' : 'recientes');
  }

  abrirDetalle(candidato: Candidato): void {
    this.candidatoSeleccionado.set(candidato);
    this.modalDetalleAbierto.set(true);
  }

  cerrarDetalle(): void {
    this.modalDetalleAbierto.set(false);
    this.candidatoSeleccionado.set(null);
  }

  /** Abre el formulario de registro en modo edición para el candidato indicado. */
  async editar(candidato: Candidato): Promise<void> {
    // Cerrar el modal y esperar a que termine ANTES de navegar: al salir, Ionic deja de actualizar
    // esta página y el modal quedaría abierto encima del formulario.
    await this.modalDetalle()?.dismiss();
    this.cerrarDetalle();
    await this.router.navigate(['/tabs/registro'], { queryParams: { editar: candidato.id } });
  }

  formatearMarca(marca: Timestamp | null | undefined): string {
    return marca ? marca.toDate().toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' }) : 'Sin registro';
  }

  getIniciales(nombres: string): string {
    if (!nombres) return 'TF';
    const partes = nombres.trim().split(/\s+/);
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }

  getModalidadBadgeClass(modalidad: string): string {
    switch (modalidad?.toLowerCase()) {
      case 'remota':
        return 'badge-lime';
      case 'híbrida':
        return 'badge-yellow';
      default:
        return 'badge-blue';
    }
  }

  private async mostrarError(mensaje: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      color: 'danger',
      duration: 4000,
      position: 'bottom',
      positionAnchor: 'tf-tab-bar',
    });
    await toast.present();
  }
}
