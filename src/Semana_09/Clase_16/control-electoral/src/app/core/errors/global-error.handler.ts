import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ToastService } from '../ui/toast.service';
import { mapearError } from './supabase-error.mapper';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly toast = inject(ToastService);

  handleError(error: unknown): void {
    console.error('[ControlElectoral] Error no controlado', error);
    void this.toast.error(mapearError(error).mensaje);
  }
}
