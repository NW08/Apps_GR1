import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-location-map',
  standalone: true,
  template: `<div #mapEl class="mini-map"></div>`,
  styles: [
    `
      .mini-map {
        width: 100%;
        height: 150px;
        border-radius: 10px;
        overflow: hidden;
        z-index: 1;
        background: #0f172a;
      }
    `,
  ],
})
export class LocationMapComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) latitude!: number;
  @Input({ required: true }) longitude!: number;
  @Input() label = 'Ubicación compartida';

  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef<HTMLDivElement>;
  private map: L.Map | null = null;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.map = L.map(this.mapEl.nativeElement, {
        center: [this.latitude, this.longitude],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(this.map);

      L.circleMarker([this.latitude, this.longitude], {
        radius: 8,
        fillColor: '#06b6d4',
        color: '#ffffff',
        weight: 2.5,
        opacity: 1,
        fillOpacity: 1,
      })
        .bindPopup(this.label)
        .addTo(this.map);
    }, 60);
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}
