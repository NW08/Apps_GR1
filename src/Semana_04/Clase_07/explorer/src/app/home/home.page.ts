import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type {
  InfiniteScrollCustomEvent,
  RefresherCustomEvent,
  SearchbarInputEventDetail,
  SegmentChangeEventDetail,
} from '@ionic/angular';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cloudOfflineOutline, heart, refreshOutline, searchOutline } from 'ionicons/icons';
import type { Subscription } from 'rxjs';
import { finalize } from 'rxjs';

import { BookCardComponent } from '../components/book-card/book-card.component';
import type { Book, BookSort } from '../models/book';
import { BooksService } from '../services/books.service';

const DEFAULT_QUERY = 'fantasy';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    RouterLink,
    BookCardComponent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
  ],
})
export class HomePage {
  private readonly api = inject(BooksService);

  // Estado del listado
  readonly books = signal<Book[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly error = signal(false);
  readonly hasMore = signal(true);

  // Parámetros de consulta
  readonly query = signal(DEFAULT_QUERY);
  readonly sort = signal<BookSort>('relevance');
  private page = 1;
  private request?: Subscription;

  constructor() {
    addIcons({ heart, cloudOfflineOutline, refreshOutline, searchOutline });
    inject(DestroyRef).onDestroy(() => this.request?.unsubscribe());
    this.reset();
  }

  onSearch(event: CustomEvent<SearchbarInputEventDetail>): void {
    this.query.set(event.detail.value?.trim() || DEFAULT_QUERY);
    this.reset();
  }

  onSort(event: CustomEvent<SegmentChangeEventDetail>): void {
    this.sort.set(event.detail.value as BookSort);
    this.reset();
  }

  loadMore(event: InfiniteScrollCustomEvent): void {
    this.fetch(() => event.target.complete());
  }

  refresh(event: RefresherCustomEvent): void {
    this.reset(() => event.target.complete());
  }

  retry(): void {
    this.fetch();
  }

  /** Nueva consulta: cancela la petición anterior y reinicia la paginación. */
  private reset(done?: () => void): void {
    this.request?.unsubscribe();
    this.books.set([]);
    this.total.set(0);
    this.page = 1;
    this.hasMore.set(true);
    this.error.set(false);
    this.fetch(done);
  }

  /** Pide la página actual y la anexa sin duplicados. */
  private fetch(done?: () => void): void {
    if (this.loading() || !this.hasMore()) {
      done?.();
      return;
    }
    this.loading.set(true);
    this.error.set(false);

    this.request = this.api
      .search(this.query(), this.page, this.sort())
      .pipe(
        finalize(() => {
          this.loading.set(false);
          done?.(); // complete() siempre, incluso ante error o cancelación
        }),
      )
      .subscribe({
        next: ({ books, total }) => {
          const seen = new Set(this.books().map((b) => b.id));
          this.books.update((list) => [...list, ...books.filter((b) => !seen.has(b.id))]);
          this.total.set(total);
          this.hasMore.set(books.length > 0 && this.page * this.api.pageSize < total);
          this.page++;
        },
        error: () => this.error.set(true),
      });
  }
}
