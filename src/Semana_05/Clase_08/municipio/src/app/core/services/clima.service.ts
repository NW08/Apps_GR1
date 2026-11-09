import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, timeout } from 'rxjs';
import { CLIMA_URL, CLIMA_TIMEOUT_MS } from '../config';

export interface Clima {
  temperatura: number;   // °C
  precipitacion: number; // mm en la última hora
  descripcion: string;
}

interface OpenMeteoResp {
  current?: {
    temperature_2m?: number | null;
    precipitation?: number | null;
    weather_code?: number | null;
  };
}

const WMO: Record<number, string> = {
  0: 'Despejado', 1: 'Mayormente despejado', 2: 'Parcialmente nublado', 3: 'Nublado',
  45: 'Niebla', 48: 'Niebla con escarcha',
  51: 'Llovizna ligera', 53: 'Llovizna moderada', 55: 'Llovizna intensa',
  56: 'Llovizna helada', 57: 'Llovizna helada intensa',
  61: 'Lluvia ligera', 63: 'Lluvia moderada', 65: 'Lluvia fuerte',
  66: 'Lluvia helada', 67: 'Lluvia helada fuerte',
  71: 'Nevada ligera', 73: 'Nevada moderada', 75: 'Nevada fuerte', 77: 'Granos de nieve',
  80: 'Chubascos ligeros', 81: 'Chubascos moderados', 82: 'Chubascos violentos',
  85: 'Chubascos de nieve', 86: 'Chubascos de nieve fuertes',
  95: 'Tormenta eléctrica', 96: 'Tormenta con granizo', 99: 'Tormenta con granizo fuerte',
};

@Injectable({ providedIn: 'root' })
export class ClimaService {
  private http = inject(HttpClient);

  getClima(lat: number, lon: number): Observable<Clima> {
    return this.http
      .get<OpenMeteoResp>(CLIMA_URL, {
        params: {
          latitude: lat,
          longitude: lon,
          current: 'temperature_2m,precipitation,weather_code',
          timezone: 'auto',
        },
      })
      .pipe(
        timeout(CLIMA_TIMEOUT_MS),
        map((r) => {
          const c = r?.current;
          // Si falta cualquier dato, se descarta todo: nunca se muestra información a medias
          if (
            !c ||
            typeof c.temperature_2m !== 'number' ||
            typeof c.precipitation !== 'number' ||
            typeof c.weather_code !== 'number'
          ) {
            throw new Error('Respuesta meteorológica incompleta');
          }
          return {
            temperatura: c.temperature_2m,
            precipitacion: c.precipitation,
            descripcion: WMO[c.weather_code] ?? 'Condición no disponible',
          };
        })
      );
  }
}