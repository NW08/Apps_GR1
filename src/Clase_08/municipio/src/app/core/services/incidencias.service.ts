import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of, throwError, map } from 'rxjs';
import { API_URL } from '../config';
import { Incidencia } from '../models/incidencia.model';

@Injectable({ providedIn: 'root' })
export class IncidenciasService {
  private http = inject(HttpClient);
  private url = `${API_URL}/incidencias`;

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
    return this.http.get<Incidencia>(`${this.url}/${id}`);
  }

  crear(data: Omit<Incidencia, 'id'>): Observable<Incidencia> {
    return this.http.post<Incidencia>(this.url, data);
  }

  actualizar(data: Incidencia): Observable<Incidencia> {
    return this.http.put<Incidencia>(`${this.url}/${data.id}`, data);
  }

  resumen(): Observable<Incidencia[]> {
    return this.http.get<Incidencia[]>(this.url);
  }
}

export { IncidenciasService as IncidenciaService };