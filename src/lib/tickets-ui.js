export const BADGE_CLASSES = {
  status: {
    open: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    in_progress: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    waiting_customer: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    closed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    default: "bg-muted/20 text-muted-foreground",
  },
  priority: {
    urgent: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    high: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    medium: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    default: "bg-muted/20 text-muted-foreground",
  },
};

export const statusText = (s) =>
  ({ open: "Abierto", in_progress: "En Progreso", waiting_customer: "Esperando respuesta", closed: "Cerrado" }[s] || "Desconocido");

export const priorityText = (p) =>
  ({ urgent: "Urgente", high: "Alta", medium: "Media", low: "Baja" }[p] || "Media");

export const categoryText = (c) =>
  ({ technical: "Técnico", billing: "Facturación", general: "General", feature_request: "Función", bug_report: "Bug" }[c] || "General");

export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
