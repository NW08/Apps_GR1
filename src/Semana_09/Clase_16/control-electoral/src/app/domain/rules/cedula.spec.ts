import { esCedulaValida } from './cedula';

describe('esCedulaValida', () => {
  it('acepta una cédula válida', () => {
    expect(esCedulaValida('1710034065')).toBe(true);
  });

  it('acepta espacios alrededor', () => {
    expect(esCedulaValida(' 1710034065 ')).toBe(true);
  });

  it('rechaza la provincia 25', () => {
    expect(esCedulaValida('2510034065')).toBe(false);
  });

  it('rechaza el tercer dígito 6', () => {
    expect(esCedulaValida('1760034065')).toBe(false);
  });

  it('rechaza un verificador incorrecto', () => {
    expect(esCedulaValida('1710034064')).toBe(false);
  });

  it('rechaza 9 dígitos', () => {
    expect(esCedulaValida('171003406')).toBe(false);
  });

  it('rechaza letras', () => {
    expect(esCedulaValida('17100340A5')).toBe(false);
  });
});
