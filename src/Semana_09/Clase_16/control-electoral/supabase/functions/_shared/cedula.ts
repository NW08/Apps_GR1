const COEFICIENTES = [2, 1, 2, 1, 2, 1, 2, 1, 2];

export function esCedulaValida(cedula: string): boolean {
  const c = (cedula ?? '').trim();
  if (!/^\d{10}$/.test(c)) return false;

  const provincia = Number(c.slice(0, 2));
  if (!((provincia >= 1 && provincia <= 24) || provincia === 30)) return false;

  if (Number(c[2]) >= 6) return false;

  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let producto = Number(c[i]) * COEFICIENTES[i];
    if (producto > 9) producto -= 9;
    suma += producto;
  }
  return (10 - (suma % 10)) % 10 === Number(c[9]);
}
