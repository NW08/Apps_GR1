import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  const session = await supabase.ensureSessionLoaded();
  if (session) {
    return true;
  }

  return router.createUrlTree(['/auth']);
};
