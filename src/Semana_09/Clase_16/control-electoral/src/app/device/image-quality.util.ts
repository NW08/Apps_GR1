export const UMBRAL_NITIDEZ_POR_DEFECTO = 100;
export const BRILLO_MINIMO_POR_DEFECTO = 35;

export interface ResultadoNitidez {
  varianza: number;
  brilloMedio: number;
  aceptada: boolean;
  motivo?: string;
}

export function aGrises(rgba: Uint8ClampedArray): Uint8ClampedArray {
  const gris = new Uint8ClampedArray(rgba.length / 4);
  for (let i = 0, p = 0; i < rgba.length; i += 4, p++) {
    gris[p] = 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2];
  }
  return gris;
}

export function evaluarNitidez(
  gris: Uint8ClampedArray | number[],
  ancho: number,
  alto: number,
  umbral = UMBRAL_NITIDEZ_POR_DEFECTO,
  brilloMinimo = BRILLO_MINIMO_POR_DEFECTO,
): ResultadoNitidez {
  const total = ancho * alto;
  let sumaBrillo = 0;
  for (let i = 0; i < total; i++) sumaBrillo += gris[i];
  const brilloMedio = total > 0 ? sumaBrillo / total : 0;

  let suma = 0;
  let sumaCuadrados = 0;
  let n = 0;
  for (let y = 1; y < alto - 1; y++) {
    for (let x = 1; x < ancho - 1; x++) {
      const i = y * ancho + x;
      const lap = gris[i - ancho] + gris[i - 1] - 4 * gris[i] + gris[i + 1] + gris[i + ancho];
      suma += lap;
      sumaCuadrados += lap * lap;
      n++;
    }
  }
  const media = n > 0 ? suma / n : 0;
  const varianza = n > 0 ? sumaCuadrados / n - media * media : 0;

  if (brilloMedio < brilloMinimo) {
    return { varianza, brilloMedio, aceptada: false, motivo: 'La foto está demasiado oscura' };
  }
  if (varianza < umbral) {
    return { varianza, brilloMedio, aceptada: false, motivo: 'La foto está borrosa' };
  }
  return { varianza, brilloMedio, aceptada: true };
}
