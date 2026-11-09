import { puedeCambiar, TRANSICIONES, Estado } from './estados';

describe('estados utils', () => {
  it('debe permitir transiciones válidas', () => {
    expect(puedeCambiar('pendiente', 'en_proceso')).toBe(true);
    expect(puedeCambiar('pendiente', 'resuelta')).toBe(true);
    expect(puedeCambiar('en_proceso', 'resuelta')).toBe(true);
  });

  it('no debe permitir transiciones inválidas o hacia atrás', () => {
    expect(puedeCambiar('resuelta', 'pendiente')).toBe(false);
    expect(puedeCambiar('resuelta', 'en_proceso')).toBe(false);
    expect(puedeCambiar('en_proceso', 'pendiente')).toBe(false);
  });
});
