// Copiar como environment.ts (desarrollo) y environment.prod.ts (production: true).
// La anon key es pública por diseño y está protegida por RLS (ADR-002).
// NUNCA colocar aquí la service_role key: solo existe como secreto de las Edge Functions.
export const environment = {
  production: false,
  supabaseUrl: 'https://TU-PROYECTO.supabase.co',
  supabaseAnonKey: 'TU-ANON-KEY',
};
