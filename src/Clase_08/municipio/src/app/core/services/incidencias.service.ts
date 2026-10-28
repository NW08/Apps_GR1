import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
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
}