// Catálogos mínimos para CFDI 4.0 y regex RFC
export const REGIMENES = [
  { id: "601", label: "601 - General de Ley PM" },
  { id: "603", label: "603 - Personas Morales con Fines no Lucrativos" },
  { id: "605", label: "605 - Sueldos y Salarios" },
  { id: "606", label: "606 - Arrendamiento" },
  { id: "608", label: "608 - Demás ingresos" },
  { id: "612", label: "612 - Personas Físicas con Actividades Empresariales" },
];

export const USOS_CFDI = [
  { id: "G03", label: "G03 - Gastos en general" },
  { id: "CP01", label: "CP01 - Pagos" },
];

export const rfcMxRx =
  /^([A-ZÑ&]{3,4})(\d{2})(0[1-9]|1[0-2])([0-2]\d|3[01])[A-Z\d]{2}[A\d]$/i;

export const toBase64 = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
