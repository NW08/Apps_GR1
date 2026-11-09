import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

import type {
  AuthorResponse,
  Book,
  BookDetail,
  BookPage,
  BookSort,
  SearchDoc,
  SearchResponse,
  WorkResponse,
} from '../models/book';

const API = 'https://openlibrary.org';
const COVERS = 'https://covers.openlibrary.org/b/id';
const FIELDS = 'key,title,author_name,first_publish_year,cover_i,edition_count';

@Injectable({ providedIn: 'root' })
export class BooksService {
  private readonly http = inject(HttpClient);
  readonly pageSize = 20;

  /** GET /search.json?q=&page=&limit= — paginación por número de página. */
  search(query: string, page: number, sort: BookSort): Observable<BookPage> {
    let params = new HttpParams()
      .set('q', query)
      .set('page', page)
      .set('limit', this.pageSize)
      .set('fields', FIELDS);
    if (sort !== 'relevance') params = params.set('sort', sort);

    return this.http.get<SearchResponse>(`${API}/search.json`, { params }).pipe(
      map((res) => ({ total: res.numFound, books: res.docs.map(toBook) })),
    );
  }

  /** GET /works/{id}.json + nombres de hasta 3 autores. */
  detail(id: string): Observable<BookDetail> {
    return this.http.get<WorkResponse>(`${API}/works/${encodeURIComponent(id)}.json`).pipe(
      switchMap((work) => {
        const keys = (work.authors ?? [])
          .map((a) => a.author?.key)
          .filter((key): key is string => !!key)
          .slice(0, 3);
        const authors$ = keys.length
          ? forkJoin(
              keys.map((key) =>
                this.http.get<AuthorResponse>(`${API}${key}.json`).pipe(
                  map((a) => a.name),
                  catchError(() => of('')),
                ),
              ),
            )
          : of<string[]>([]);
        return authors$.pipe(map((names) => toDetail(id, work, names.filter(Boolean))));
      }),
    );
  }

  coverUrl(coverId: number, size: 'M' | 'L' = 'M'): string {
    return `${COVERS}/${coverId}-${size}.jpg`;
  }
}

function toBook(doc: SearchDoc): Book {
  return {
    id: doc.key.replace('/works/', ''),
    title: doc.title,
    authors: doc.author_name ?? [],
    year: doc.first_publish_year,
    coverId: doc.cover_i,
    editions: doc.edition_count,
  };
}

function toDetail(id: string, work: WorkResponse, authors: string[]): BookDetail {
  const description = typeof work.description === 'string' ? work.description : (work.description?.value ?? '');
  const year = work.first_publish_date?.match(/\d{4}/)?.[0];
  return {
    id,
    title: work.title,
    authors,
    year: year ? Number(year) : undefined,
    coverId: work.covers?.find((c) => c > 0),
    description,
    subjects: (work.subjects ?? []).slice(0, 12),
  };
}
