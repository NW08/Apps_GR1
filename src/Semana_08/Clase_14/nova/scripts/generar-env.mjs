// Genera src/environments/env.config.ts desde .env. Las variables del sistema tienen prioridad (CI).
// Si falta una, se usa un valor de ejemplo que los servicios detectan como "no configurado".
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const archivoEnv = resolve(raiz, '.env');
const destino = resolve(raiz, 'src/environments/env.config.ts');

const GRUPOS = {
  supabaseConfig: {
    url: ['SUPABASE_URL', 'https://YOUR_PROJECT_ID.supabase.co'],
    anonKey: ['SUPABASE_ANON_KEY', 'YOUR_SUPABASE_ANON_KEY'],
  },
  firebaseConfig: {
    apiKey: ['FIREBASE_API_KEY', 'YOUR_FIREBASE_API_KEY'],
    authDomain: ['FIREBASE_AUTH_DOMAIN', 'YOUR_PROJECT_ID.firebaseapp.com'],
    databaseURL: ['FIREBASE_DATABASE_URL', 'https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com'],
    projectId: ['FIREBASE_PROJECT_ID', 'YOUR_PROJECT_ID'],
    storageBucket: ['FIREBASE_STORAGE_BUCKET', 'YOUR_PROJECT_ID.firebasestorage.app'],
    messagingSenderId: ['FIREBASE_MESSAGING_SENDER_ID', 'YOUR_SENDER_ID'],
    appId: ['FIREBASE_APP_ID', 'YOUR_APP_ID'],
  },
};

function leerEnv(ruta) {
  if (!existsSync(ruta)) return {};
  const valores = {};
  for (const linea of readFileSync(ruta, 'utf8').split(/\r?\n/)) {
    const limpia = linea.trim();
    if (!limpia || limpia.startsWith('#')) continue;
    const igual = limpia.indexOf('=');
    if (igual === -1) continue;
    const clave = limpia.slice(0, igual).trim();
    const valor = limpia
      .slice(igual + 1)
      .trim()
      .replace(/^(['"])(.*)\1$/, '$2');
    valores[clave] = valor;
  }
  return valores;
}

const escapar = (valor) => valor.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

const deArchivo = leerEnv(archivoEnv);
const faltantes = [];
let contenido = '// Archivo GENERADO por scripts/generar-env.mjs a partir de .env. No editar ni versionar.\n';

for (const [nombre, campos] of Object.entries(GRUPOS)) {
  const lineas = Object.entries(campos).map(([campo, [variable, ejemplo]]) => {
    const valor = process.env[variable] || deArchivo[variable] || '';
    if (!valor) faltantes.push(variable);
    return `  ${campo}: '${escapar(valor || ejemplo)}',`;
  });
  contenido += `\nexport const ${nombre} = {\n${lineas.join('\n')}\n};\n`;
}

writeFileSync(destino, contenido);

if (faltantes.length) {
  console.warn(
    `\n[generar-env] Variables sin definir (se usan valores de ejemplo): ${faltantes.join(', ')}\n` +
      `Copia .env.example como .env y completa los valores de Supabase y Firebase.\n`,
  );
}
console.log(`[generar-env] ${destino.replace(raiz, '.')} actualizado.`);
