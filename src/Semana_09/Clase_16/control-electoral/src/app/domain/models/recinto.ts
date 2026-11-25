export interface Recinto {
  id: string;
  provincia: string;
  canton: string;
  parroquia: string;
  nombre: string;
  numJrv: number;
  lat: number | null;
  lng: number | null;
}
