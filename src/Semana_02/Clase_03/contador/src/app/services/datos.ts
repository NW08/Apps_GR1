import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatosService {
  nombre_usuario = signal<string>('');
  correo_electronico = signal<string>('');
  numero_paralelo = signal<number>(0);
  valor_contador = signal<number>(0);
  datos_enviados = signal<boolean>(false);

  guardar_datos(
    nombre_parametro: string,
    correo_parametro: string,
    paralelo_parametro: number,
    contador_parametro: number
  ): void {
    this.nombre_usuario.set(nombre_parametro);
    this.correo_electronico.set(correo_parametro);
    this.numero_paralelo.set(paralelo_parametro);
    this.valor_contador.set(contador_parametro);
    this.datos_enviados.set(true);
  }

  reiniciar_datos(): void {
    this.nombre_usuario.set('');
    this.correo_electronico.set('');
    this.numero_paralelo.set(0);
    this.valor_contador.set(0);
    this.datos_enviados.set(false);
  }
}
