// Ajusta los enlaces de imágenes del README a la extensión real (.png, .jpg o .jpeg) de cada archivo en docs/.
// Uso: npm run evidencias (después de agregar o reemplazar capturas).
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const readme = resolve(raiz, 'README.md');
const EXTENSIONES = ['png', 'jpg', 'jpeg'];

function archivoReal(carpeta, nombre) {
  const ruta = resolve(raiz, 'docs', carpeta);
  if (!existsSync(ruta)) return null;
  return (
    readdirSync(ruta).find((archivo) => {
      const punto = archivo.lastIndexOf('.');
      return archivo.slice(0, punto) === nombre && EXTENSIONES.includes(archivo.slice(punto + 1).toLowerCase());
    }) ?? null
  );
}

let actualizados = 0;
const faltantes = [];
const contenido = readFileSync(readme, 'utf8').replace(
  /docs\/(evidencias|pruebas)\/([\w-]+)\.(png|jpe?g)/gi,
  (enlace, carpeta, nombre) => {
    const real = archivoReal(carpeta, nombre);
    if (!real) {
      faltantes.push(`${carpeta}/${nombre}`);
      return enlace;
    }
    const nuevo = `docs/${carpeta}/${real}`;
    if (nuevo !== enlace) actualizados++;
    return nuevo;
  },
);

writeFileSync(readme, contenido);
console.log(`[evidencias] Enlaces actualizados: ${actualizados}.`);
if (faltantes.length) console.log(`[evidencias] Sin imagen todavía (${faltantes.length}): ${faltantes.join(', ')}`);
