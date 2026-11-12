// Genera src/environments/firebase.config.ts a partir de las variables del archivo .env.
// Se ejecuta automáticamente antes de `ionic serve`/`build`, `npm start`, `npm run build`, lint y tests.
// Las variables de entorno del sistema tienen prioridad sobre .env (útil en CI).
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const archivoEnv = resolve(raiz, '.env');
const destino = resolve(raiz, 'src/environments/firebase.config.ts');

const VARIABLES = {
  apiKey: 'FIREBASE_API_KEY',
  authDomain: 'FIREBASE_AUTH_DOMAIN',
  projectId: 'FIREBASE_PROJECT_ID',
  storageBucket: 'FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'FIREBASE_MESSAGING_SENDER_ID',
  appId: 'FIREBASE_APP_ID',
  measurementId: 'FIREBASE_MEASUREMENT_ID',
};
const OPCIONALES = new Set(['FIREBASE_MEASUREMENT_ID']);

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

const deArchivo = leerEnv(archivoEnv);
const config = {};
const faltantes = [];

for (const [campo, variable] of Object.entries(VARIABLES)) {
  const valor = process.env[variable] ?? deArchivo[variable] ?? '';
  if (!valor && !OPCIONALES.has(variable)) faltantes.push(variable);
  if (valor) config[campo] = valor;
}

if (faltantes.length) {
  console.error(
    `\n[generar-env] Faltan variables de Firebase: ${faltantes.join(', ')}\n` +
      `Copia .env.example como .env y completa los valores de tu app web de Firebase\n` +
      `(Consola de Firebase > Configuración del proyecto > Tus apps).\n`,
  );
  process.exit(1);
}

const cuerpo = Object.entries(config)
  .map(([campo, valor]) => `  ${campo}: '${valor.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',`)
  .join('\n');
const contenido =
  `// Archivo GENERADO por scripts/generar-env.mjs a partir de .env. No editar ni versionar.\n` +
  `export const firebaseConfig = {\n${cuerpo}\n};\n`;

writeFileSync(destino, contenido);
console.log(`[generar-env] ${destino.replace(raiz, '.')} actualizado (${Object.keys(config).length} valores).`);
