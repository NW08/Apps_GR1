import { aGrises, BRILLO_MINIMO_POR_DEFECTO, evaluarNitidez, UMBRAL_NITIDEZ_POR_DEFECTO } from './image-quality.util';

const ANCHO = 40;
const ALTO = 40;

function tablero(): number[] {
  const px: number[] = [];
  for (let y = 0; y < ALTO; y++) {
    for (let x = 0; x < ANCHO; x++) {
      px.push((Math.floor(x / 4) + Math.floor(y / 4)) % 2 === 0 ? 30 : 230);
    }
  }
  return px;
}

describe('evaluarNitidez', () => {
  it('acepta una imagen con bordes nítidos', () => {
    const r = evaluarNitidez(tablero(), ANCHO, ALTO);
    expect(r.varianza).toBeGreaterThan(UMBRAL_NITIDEZ_POR_DEFECTO);
    expect(r.aceptada).toBe(true);
  });

  it('rechaza una imagen uniforme (sin bordes) como borrosa', () => {
    const r = evaluarNitidez(new Array(ANCHO * ALTO).fill(128), ANCHO, ALTO);
    expect(r.varianza).toBe(0);
    expect(r.aceptada).toBe(false);
    expect(r.motivo).toBe('La foto está borrosa');
  });

  it('rechaza una imagen negra por brillo insuficiente', () => {
    const r = evaluarNitidez(new Array(ANCHO * ALTO).fill(0), ANCHO, ALTO);
    expect(r.brilloMedio).toBeLessThan(BRILLO_MINIMO_POR_DEFECTO);
    expect(r.aceptada).toBe(false);
    expect(r.motivo).toBe('La foto está demasiado oscura');
  });
});

describe('aGrises', () => {
  it('convierte RGBA a luminancia', () => {
    const gris = aGrises(new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 255]));
    expect(gris[0]).toBe(255);
    expect(gris[1]).toBe(0);
  });
});
