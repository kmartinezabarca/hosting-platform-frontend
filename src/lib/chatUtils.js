export const fmtDate = (d) =>
  new Date(d).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export const fmtBytes = (bytes) => {
  if (bytes == null || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const isImageMime = (mime = "") => /^image\//.test(mime);

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
];
export const MAX_FILE_SIZE_MB = 20;
export const MAX_FILES_PER_MESSAGE = 5;

export const getStatusBadge = (status) => {
    const map = {
      open: {
        text: "Abierto",
        cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/25 dark:text-blue-300",
      },
      in_progress: {
        text: "En progreso",
        cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/25 dark:text-amber-300",
      },
      waiting_customer: {
        text: "Esperando cliente",
        cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/25 dark:text-purple-300",
      },
      closed: {
        text: "Cerrado",
        cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300",
      },
    };
    return map[status] || { text: "–", cls: "bg-muted text-foreground" };
};
