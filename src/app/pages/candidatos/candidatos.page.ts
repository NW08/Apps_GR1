import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
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
  IonButtons
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
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
  sparklesOutline
} from 'ionicons/icons';
import { CandidatosService } from '../../services/candidatos.service';
import { Candidato } from '../../models/candidato.model';

@Component({
  selector: 'app-candidatos',
  templateUrl: './candidatos.page.html',
  styleUrls: ['./candidatos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    IonButtons
  ]
})
export class CandidatosPage implements OnInit {
  candidatos: Candidato[] = [];
  candidatosFiltrados: Candidato[] = [];
  cargando = true;
  filtroTexto = '';

  modalDetalleAbierto = false;
  candidatoSeleccionado: Candidato | null = null;

  constructor(private candidatosService: CandidatosService) {
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
      sparklesOutline
    });
  }

  ngOnInit() {
    this.cargarCandidatos();
  }

  async cargarCandidatos(event?: any) {
    this.cargando = !event;
    try {
      this.candidatos = await this.candidatosService.obtenerCandidatos();
      this.aplicarFiltro();
    } catch (error) {
      console.error('Error al obtener candidatos de Firestore:', error);
    } finally {
      this.cargando = false;
      if (event) {
        event.target.complete();
      }
    }
  }

  aplicarFiltro() {
    const texto = this.filtroTexto.trim().toLowerCase();
    if (!texto) {
      this.candidatosFiltrados = [...this.candidatos];
      return;
    }

    this.candidatosFiltrados = this.candidatos.filter(
      (c) =>
        c.nombres.toLowerCase().includes(texto) ||
        c.cargo.toLowerCase().includes(texto) ||
        c.modalidad.toLowerCase().includes(texto) ||
        c.habilidades.some((h) => h.toLowerCase().includes(texto))
    );
  }

  abrirDetalle(candidato: Candidato) {
    this.candidatoSeleccionado = candidato;
    this.modalDetalleAbierto = true;
  }

  cerrarDetalle() {
    this.modalDetalleAbierto = false;
    this.candidatoSeleccionado = null;
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
