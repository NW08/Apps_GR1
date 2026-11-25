import { evaluarConsistencia, validarObservada } from './acta-consistency';

describe('evaluarConsistencia', () => {
  it('el acta cuadra cuando la suma es exacta', () => {
    const r = evaluarConsistencia({ votos: [10, 20, 30, 5, 5], nulos: 3, blancos: 2, totalSufragantes: 75 });
    expect(r.consistente).toBe(true);
    expect(r.sumaVotos).toBe(70);
    expect(r.mensaje).toBe('El acta cuadra');
  });

  it('indica cuántos votos faltan', () => {
    const r = evaluarConsistencia({ votos: [10, 20, 30, 5, 5], nulos: 0, blancos: 0, totalSufragantes: 73 });
    expect(r.consistente).toBe(false);
    expect(r.diferencia).toBe(-3);
    expect(r.mensaje).toBe('Faltan 3 votos');
  });

  it('indica cuántos votos sobran', () => {
    const r = evaluarConsistencia({ votos: [10, 20, 30, 5, 5], nulos: 2, blancos: 0, totalSufragantes: 70 });
    expect(r.consistente).toBe(false);
    expect(r.mensaje).toBe('Sobran 2 votos');
  });

  it('trata valores vacíos como cero', () => {
    const r = evaluarConsistencia({ votos: [NaN, 0, 0, 0, 0], nulos: 0, blancos: 0, totalSufragantes: 0 });
    expect(r.consistente).toBe(true);
  });
});

describe('validarObservada', () => {
  it('exige la marca de inconsistencia', () => {
    expect(validarObservada(false, 'Acta física con borrones')).toBe(false);
  });

  it('exige al menos 10 caracteres de observación', () => {
    expect(validarObservada(true, 'corto')).toBe(false);
    expect(validarObservada(true, '          ')).toBe(false);
  });

  it('acepta una observación suficiente', () => {
    expect(validarObservada(true, 'Acta física con borrones')).toBe(true);
  });
});
