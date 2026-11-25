export interface DatosConsistencia {
  votos: number[];
  nulos: number;
  blancos: number;
  totalSufragantes: number;
}

export interface ResultadoConsistencia {
  sumaVotos: number;
  total: number;
  diferencia: number;
  consistente: boolean;
  mensaje: string;
}

const aNumero = (v: number): number => (Number.isFinite(Number(v)) ? Number(v) : 0);

export function evaluarConsistencia(datos: DatosConsistencia): ResultadoConsistencia {
  const sumaVotos = datos.votos.reduce((acc, v) => acc + aNumero(v), 0);
  const total = sumaVotos + aNumero(datos.nulos) + aNumero(datos.blancos);
  const diferencia = total - aNumero(datos.totalSufragantes);

  let mensaje = 'El acta cuadra';
  if (diferencia < 0) mensaje = `Faltan ${-diferencia} votos`;
  if (diferencia > 0) mensaje = `Sobran ${diferencia} votos`;

  return { sumaVotos, total, diferencia, consistente: diferencia === 0, mensaje };
}

export const MIN_OBSERVACION = 10;

export function validarObservada(esInconsistente: boolean, observacion: string): boolean {
  return esInconsistente && (observacion ?? '').trim().length >= MIN_OBSERVACION;
}
