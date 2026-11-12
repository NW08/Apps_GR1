import { NgClass } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, computed, inject, signal } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  briefcaseOutline,
  calendarOutline,
  callOutline,
  cashOutline,
  closeOutline,
  documentTextOutline,
  eyeOutline,
  laptopOutline,
  mailOutline,
  peopleOutline,
  personOutline,
  refreshOutline,
  schoolOutline,
  searchOutline,
  sparklesOutline,
  timeOutline,
} from 'ionicons/icons';

import type { Candidato } from '../../models/candidato.model';
import { CandidatosService } from '../../services/candidatos.service';

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
    IonCard,
    IonButton,
    IonIcon,
    IonSpinner,
    IonSearchbar,
    IonRefresher,
    IonRefresherContent,
    IonModal,
    IonButtons,
  ],
})
export class CandidatosPage implements OnInit {
  private readonly candidatosService = inject(CandidatosService);

  // La app es zoneless: el estado que cambia tras un await debe ser un signal para refrescar la vista.
  readonly candidatos = signal<Candidato[]>([]);
  readonly cargando = signal(true);
  readonly filtroTexto = signal('');

  readonly modalDetalleAbierto = signal(false);
  readonly candidatoSeleccionado = signal<Candidato | null>(null);

  readonly candidatosFiltrados = computed(() => {
    const texto = this.filtroTexto().trim().toLowerCase();
    const todos = this.candidatos();
    if (!texto) return todos;

    return todos.filter(
      (c) =>
        c.nombres.toLowerCase().includes(texto) ||
        c.cargo.toLowerCase().includes(texto) ||
        c.modalidad.toLowerCase().includes(texto) ||
        c.habilidades.some((h) => h.toLowerCase().includes(texto)),
    );
  });

  constructor() {
    addIcons({
      briefcaseOutline,
      personOutline,
      mailOutline,
      callOutline,
      calendarOutline,
      schoolOutline,
      timeOutline,
      laptopOutline,
      cashOutline,
      documentTextOutline,
      searchOutline,
      closeOutline,
      eyeOutline,
      refreshOutline,
      peopleOutline,
      sparklesOutline,
    });
  }

  ngOnInit(): void {
    void this.cargarCandidatos();
  }

  /** Consulta la colección; si viene del ion-refresher no muestra el spinner de pantalla completa. */
  async cargarCandidatos(event?: Event): Promise<void> {
    this.cargando.set(!event);
    try {
      this.candidatos.set(await this.candidatosService.obtenerCandidatos());
    } catch (error) {
      console.error('Error al obtener candidatos de Firestore:', error);
    } finally {
      this.cargando.set(false);
      await (event?.target as HTMLIonRefresherElement | undefined)?.complete();
    }
  }

  buscar(valor: string | null | undefined): void {
    this.filtroTexto.set(valor ?? '');
  }

  abrirDetalle(candidato: Candidato): void {
    this.candidatoSeleccionado.set(candidato);
    this.modalDetalleAbierto.set(true);
  }

  cerrarDetalle(): void {
    this.modalDetalleAbierto.set(false);
    this.candidatoSeleccionado.set(null);
  }

  getIniciales(nombres: string): string {
    if (!nombres) return 'TF';
    const partes = nombres.trim().split(' ');
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
}
