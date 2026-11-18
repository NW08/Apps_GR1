import { firebaseConfig, supabaseConfig } from './env.config';

// Los valores reales viven en .env (no versionado) y se copian a env.config.ts con `npm run env`.
export const environment = {
  production: true,
  supabase: supabaseConfig,
  firebase: firebaseConfig,
};
