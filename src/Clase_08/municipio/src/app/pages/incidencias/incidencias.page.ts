import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonList, IonItem, IonLabel,
  IonThumbnail, IonBadge, IonSpinner, IonButton, IonIcon, IonInfiniteScroll,
  IonInfiniteScrollContent, InfiniteScrollCustomEvent,
} from '@ionic/angular';
import { IncidenciasService } from '../../core/services/incidencias.service';
import { Incidencia, Estado } from '../../core/models/incidencia.model';
import { PAGE_SIZE } from '../../core/config';
import { addIcons } from 'ionicons';
import { star, starOutline } from 'ionicons/icons';
import { SeguimientoService } from '../../core/services/seguimiento.service';

@Component({
  selector: 'app-incidencias',
  templateUrl: './incidencias.page.html',
  styleUrls: ['./incidencias.page.scss'],
  standalone: true,
  imports: [
    RouterLink, DatePipe, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonList, IonItem, IonLabel, IonThumbnail, IonBadge, IonSpinner, IonButton,
    IonIcon, IonInfiniteScroll, IonInfiniteScrollContent,
  ],
})
export class IncidenciasPage implements OnInit {
  private svc = inject(IncidenciasService);
  private cdr = inject(ChangeDetectorRef);
  seg = inject(SeguimientoService);

  constructor() {
    addIcons({ star, starOutline });
  }

  items: Incidencia[] = [];
  page = 1;
  cargando = false;
  fin = false;
  error = false;

  etiquetaEstado: Record<Estado, string> = {
    pendiente: 'Pendiente',
    en_proceso: 'En proceso',
    resuelta: 'Resuelta',
  };

  ngOnInit() {
    this.cargar();
  }

  colorEstado(e: Estado): string {
    return e === 'pendiente' ? 'warning' : e === 'en_proceso' ? 'primary' : 'success';
  }

  cargar(ev?: InfiniteScrollCustomEvent) {
    if (this.cargando || this.fin || this.error) {
      ev?.target.complete();
      return;
    }
    this.cargando = true;
    this.cdr.markForCheck();

    this.svc.getPagina(this.page, PAGE_SIZE).subscribe({
      next: (datos) => {
        this.items = [...this.items, ...datos];
        this.page++;
        if (datos.length < PAGE_SIZE) {
          this.fin = true;
        }
        this.cargando = false;
        this.cdr.markForCheck();
        ev?.target.complete();
      },
      error: () => {
        this.error = true;
        this.cargando = false;
        this.cdr.markForCheck();
        ev?.target.complete();
      },
    });
  }

  reintentar() {
    this.error = false;
    this.cargar();
  }
}
