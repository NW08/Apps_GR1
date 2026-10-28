const API = 'https://6ae21911bbb541292299a149.mockapi.io/incidencias';

const tipos = ['luminaria', 'bache', 'senalizacion', 'alcantarilla', 'parque'];
const estados = ['pendiente', 'en_proceso', 'resuelta'];
const prioridades = ['baja', 'media', 'alta'];
const sectores = ['La Mariscal', 'Carcelén', 'Cumbayá', 'Quitumbe', 'Centro Histórico', 'La Floresta', 'Calderón'];
const calles = ['Av. 6 de Diciembre', 'Av. Amazonas', 'Av. Naciones Unidas', 'Calle Guayaquil', 'Av. Mariscal Sucre', 'Av. De los Shyris', 'Calle Venezuela'];
const desc = {
  luminaria: 'Luminaria apagada o con daño en el poste',
  bache: 'Bache en la calzada que afecta la circulación',
  senalizacion: 'Señal de tránsito deteriorada o ilegible',
  alcantarilla: 'Alcantarilla obstruida con acumulación de agua',
  parque: 'Daño en mobiliario o juegos del parque',
};

for (let i = 0; i < 28; i++) {
  const tipo = tipos[i % 5];
  const estado = estados[i % 3];
  const prioridad = prioridades[(i + Math.floor(i / 3)) % 3];
  const conFoto = prioridad === 'alta' || i % 2 === 0;

  const body = {
    codigo: `INC-${String(i + 1).padStart(3, '0')}`,
    tipo,
    descripcion: desc[tipo],
    direccion: `${calles[i % 7]} y calle ${100 + i}`,
    sector: sectores[i % 7],
    fecha: new Date(2026, 8, 1 + i).toISOString(),
    estado,
    prioridad,
    fotoUrl: conFoto ? `https://picsum.photos/seed/inc${i + 1}/600/400` : null,
    latitud: -0.1807 - (i % 7) * 0.01,
    longitud: -78.4678 + (i % 5) * 0.01,
    observacion: estado === 'resuelta' ? 'Reparación verificada en sitio.' : '',
  };

  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  console.log(body.codigo, res.status);
}