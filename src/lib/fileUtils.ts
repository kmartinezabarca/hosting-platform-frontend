/**
 * Genera y descarga un archivo de texto (.txt) en el navegador del cliente.
 *
 * @param content  - El contenido de texto que irá dentro del archivo.
 * @param filename - El nombre del archivo a descargar (ej. "logs-servicio-123.txt").
 */
export const downloadAsTxt = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
