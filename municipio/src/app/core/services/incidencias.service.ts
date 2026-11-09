import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of, throwError, map, tap } from 'rxjs';
import { API_URL } from '../config';
import { Incidencia } from '../models/incidencia.model';

@Injectable({ providedIn: 'root' })
export class IncidenciasService {
  private http = inject(HttpClient);
  private url = `${API_URL}/incidencias`;

  /** Aumenta con cada alta o cambio de estado: las páginas saben cuándo sus datos quedaron obsoletos. */
  private _version = signal(0);
  readonly version = this._version.asReadonly();

  getPagina(page: number, limit: number): Observable<Incidencia[]> {
    return this.http
      .get<Incidencia[]>(this.url, {
        params: { page, limit, sortBy: 'fecha', order: 'desc' },
      })
      .pipe(
        catchError((err: HttpErrorResponse) =>
          err.status === 404 ? of([]) : throwError(() => err)
        )
      );
  }

  getPorCodigo(codigo: string): Observable<Incidencia | null> {
    return this.http.get<Incidencia[]>(this.url, { params: { codigo } }).pipe(
      map((lista) => lista.find((i) => i.codigo === codigo) ?? null),
      catchError((err: HttpErrorResponse) =>
        err.status === 404 ? of(null) : throwError(() => err)
      )
    );
  }

  getPorId(id: string): Observable<Incidencia> {
    return this.http.get<Incidencia>(`${this.url}/${encodeURIComponent(id)}`);
  }

  crear(data: Omit<Incidencia, 'id'>): Observable<Incidencia> {
    return this.http.post<Incidencia>(this.url, data).pipe(tap(() => this.marcarCambio()));
  }

  actualizar(data: Incidencia): Observable<Incidencia> {
    return this.http
      .put<Incidencia>(`${this.url}/${data.id}`, data)
      .pipe(tap(() => this.marcarCambio()));
  }

  resumen(): Observable<Incidencia[]> {
    return this.http.get<Incidencia[]>(this.url).pipe(
      catchError((err: HttpErrorResponse) =>
        err.status === 404 ? of([]) : throwError(() => err)
      )
    );
  }

  private marcarCambio() {
    this._version.update((v) => v + 1);
  }
}

export { IncidenciasService as IncidenciaService };
