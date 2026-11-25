export type ErrorApp = {
  codigo: 'sin-conexion' | 'sin-permiso' | 'credenciales' | 'validacion' | 'conflicto' | 'desconocido';
  mensaje: string;
};

export type Estado<T> =
  | { tipo: 'inactivo' }
  | { tipo: 'cargando' }
  | { tipo: 'exito'; datos: T }
  | { tipo: 'vacio' }
  | { tipo: 'error'; error: ErrorApp; reintentar?: () => void };
