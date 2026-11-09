/** Libro tal como lo usa la app (listado, tarjetas y favoritos). */
export interface Book {
  id: string;
  title: string;
  authors: string[];
  year?: number;
  coverId?: number;
  editions?: number;
}

/** Información ampliada para la vista de detalle. */
export interface BookDetail extends Book {
  description: string;
  subjects: string[];
}

/** Página de resultados normalizada que devuelve el servicio. */
export interface BookPage {
  books: Book[];
  total: number;
}

export type BookSort = 'relevance' | 'new' | 'old';

/* ---- Respuestas crudas de Open Library ---- */

export interface SearchResponse {
  numFound: number;
  start: number;
  docs: SearchDoc[];
}

export interface SearchDoc {
  key: string; // "/works/OL45804W"
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  edition_count?: number;
}

export interface WorkResponse {
  key: string;
  title: string;
  description?: string | { value: string };
  subjects?: string[];
  covers?: number[];
  first_publish_date?: string;
  authors?: { author?: { key: string } }[];
}

export interface AuthorResponse {
  name: string;
}
