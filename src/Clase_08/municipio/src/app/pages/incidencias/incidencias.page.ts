import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel,
  IonThumbnail, IonBadge, IonSpinner, IonButton, IonInfiniteScroll,
  IonInfiniteScrollContent, InfiniteScrollCustomEvent
} from '@ionic/angular';
import { IncidenciasService } from '../../core/services/incidencias.service';
import { Incidencia, Estado } from '../../core/models/incidencia.model';
import { PAGE_SIZE } from '../../core/config';

@Component({
  selector: 'app-incidencias',
  templateUrl: './incidencias.page.html',
  styleUrls: ['./incidencias.page.scss'],
  standalone: true,
  imports: [
    DatePipe, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
    IonLabel, IonThumbnail, IonBadge, IonSpinner, IonButton, IonInfiniteScroll,
    IonInfiniteScrollContent,
  ],
})
export class IncidenciasPage implements OnInit {
  private svc = inject(IncidenciasService);
  private cdr = inject(ChangeDetectorRef);

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
