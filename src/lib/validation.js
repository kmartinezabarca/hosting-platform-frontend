export const emailRx  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRx  = /^\+?[0-9()\s-]{7,}$/;
export const domainRx = /^(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}$/;
export const cvvRx    = /^\d{3,4}$/;
export const zipRx    = /^[A-Za-z0-9 -]{3,10}$/;

export const onlyDigits = (s='') => s.replace(/\D/g, '');

export function luhnValid(numStr='') {
  const s = onlyDigits(numStr);
  let sum = 0, dbl = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let d = +s[i];
    if (dbl) { d *= 2; if (d > 9) d -= 9; }
    sum += d; dbl = !dbl;
  }
  return s.length >= 13 && s.length <= 19 && sum % 10 === 0;
}

export function expiryValid(mmYY='') {
  const m = mmYY.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return false;
  const mm = +m[1], yy = +m[2];
  if (mm < 1 || mm > 12) return false;
  const now = new Date();
  const exp = new Date(2000 + yy, mm, 0, 23, 59, 59);
  return exp >= now;
}