import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonList, IonItem, IonLabel, IonThumbnail, IonBadge, IonSpinner, IonButton, IonIcon,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { star } from 'ionicons/icons';
import { IncidenciasService } from '../../core/services/incidencias.service';
import { SeguimientoService } from '../../core/services/seguimiento.service';
import { Incidencia, Estado } from '../../core/models/incidencia.model';

@Component({
  selector: 'app-seguimiento',
  templateUrl: './seguimiento.page.html',
  styleUrls: ['./seguimiento.page.scss'],
  standalone: true,
  imports: [
    DatePipe, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
    IonList, IonItem, IonLabel, IonThumbnail, IonBadge, IonSpinner, IonButton, IonIcon,
  ],
})
export class SeguimientoPage {
  private svc = inject(IncidenciasService);
  private seg = inject(SeguimientoService);
  private cdr = inject(ChangeDetectorRef);

  items: Incidencia[] = [];
  cargando = false;
  error = false;

  etiquetaEstado: Record<Estado, string> = {
    pendiente: 'Pendiente',
    en_proceso: 'En proceso',
    resuelta: 'Resuelta',
  };

  constructor() {
    addIcons({ star });
  }

  // Se ejecuta cada vez que se entra a la página
  async ionViewWillEnter() {
    await this.seg.listo;
    this.cargar();
  }

  colorEstado(e: Estado): string {
    return e === 'pendiente' ? 'warning' : e === 'en_proceso' ? 'primary' : 'success';
  }

  cargar() {
    const codigos = this.seg.codigos();
    this.error = false;
    if (codigos.length === 0) {
      this.items = [];
      this.cargando = false;
      this.cdr.markForCheck();
      return;
    }
    this.cargando = true;
    this.cdr.markForCheck();

    forkJoin(codigos.map((c) => this.svc.getPorCodigo(c))).subscribe({
      next: (res) => {
        this.items = res.filter((x): x is Incidencia => x !== null);
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = true;
        this.cargando = false;
        this.cdr.markForCheck();
      },
    });
  }

  async quitar(i: Incidencia) {
    await this.seg.alternar(i.codigo);
    this.items = this.items.filter((x) => x.codigo !== i.codigo);
    this.cdr.markForCheck();
  }
}
