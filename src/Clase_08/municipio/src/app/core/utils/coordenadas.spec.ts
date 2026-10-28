import { coordenadasValidas } from './coordenadas';

describe('coordenadasValidas', () => {
  it('debe aceptar coordenadas válidas', () => {
    expect(coordenadasValidas(-0.1807, -78.4678)).toBe(true);
    expect(coordenadasValidas(0, 0)).toBe(true);
    expect(coordenadasValidas(90, 180)).toBe(true);
    expect(coordenadasValidas(-90, -180)).toBe(true);
  });

  it('debe rechazar coordenadas fuera de rango', () => {
    expect(coordenadasValidas(91, 0)).toBe(false);
    expect(coordenadasValidas(-91, 0)).toBe(false);
    expect(coordenadasValidas(0, 181)).toBe(false);
    expect(coordenadasValidas(0, -181)).toBe(false);
  });

  it('debe rechazar valores no numéricos o infinitos', () => {
    expect(coordenadasValidas(null, -78.4678)).toBe(false);
    expect(coordenadasValidas(undefined, -78.4678)).toBe(false);
    expect(coordenadasValidas('0', 0)).toBe(false);
    expect(coordenadasValidas(NaN, 0)).toBe(false);
    expect(coordenadasValidas(Infinity, 0)).toBe(false);
  });
});
