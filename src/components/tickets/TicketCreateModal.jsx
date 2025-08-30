import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, RefreshCw, ChevronDown, Tag, ShieldAlert, AlertCircle } from "lucide-react";

const cx = (...c) => c.filter(Boolean).join(" ");

const TicketCreateModal = ({ open, onClose, form, setForm, onSubmit, creating }) => {
  // límites
  const SUBJECT_MIN = 8;
  const SUBJECT_MAX = 120;
  const DESC_MIN = 20;
  const DESC_MAX = 2000;

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const priorityOptions = [
    { value: "low",    label: "Baja"    },
    { value: "medium", label: "Media"   },
    { value: "high",   label: "Alta"    },
    { value: "urgent", label: "Urgente" }
  ];

  const categoryOptions = [
    { value: "general",         label: "General" },
    { value: "technical",       label: "Soporte Técnico" },
    { value: "billing",         label: "Facturación y Pagos" },
    { value: "feature_request", label: "Sugerencia de Función" },
    { value: "bug_report",      label: "Reporte de Bug" },
  ];

  // --- Validación ---
  const validate = (values) => {
    const e = {};

    const subject = (values.subject || "").trim();
    if (!subject) e.subject = "El asunto es obligatorio.";
    else if (subject.length < SUBJECT_MIN) e.subject = `Mínimo ${SUBJECT_MIN} caracteres.`;
    else if (subject.length > SUBJECT_MAX) e.subject = `Máximo ${SUBJECT_MAX} caracteres.`;

    const description = (values.description || "").trim();
    if (!description) e.description = "La descripción es obligatoria.";
    else if (description.length < DESC_MIN) e.description = `Describe con más detalle (mínimo ${DESC_MIN}).`;
    else if (description.length > DESC_MAX) e.description = `Máximo ${DESC_MAX} caracteres.`;

    const p = values.priority;
    if (!["low","medium","high","urgent"].includes(p)) e.priority = "Selecciona una prioridad.";

    const c = values.category;
    if (!["general","technical","billing","feature_request","bug_report"].includes(c)) e.category = "Selecciona una categoría.";

    return e;
  };

  // Revalida en vivo cuando cambian los campos ya tocados
  useEffect(() => {
    const v = validate(form);
    const filtered = Object.fromEntries(Object.entries(v).filter(([k]) => touched[k]));
    setErrors(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const markTouched = (name) => setTouched((t) => ({ ...t, [name]: true }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validate(form);
    setTouched({ subject: true, description: true, priority: true, category: true });
    setErrors(v);
    if (Object.keys(v).length === 0) onSubmit(e); // delega al padre
  };

  // UI helpers
  const charCount = (val) => (val || "").length;
  const subjectChars = charCount(form.subject);
  const descChars = charCount(form.description);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[60] grid place-items-center bg-black/55 backdrop-blur-[2px] p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 22, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className={cx(
              "w-full max-w-2xl rounded-2xl",
              "bg-white text-foreground shadow-2xl",
              "border border-black/10",
              "dark:bg-[#0f1115] dark:border-white/10"
            )}
            role="dialog" aria-modal="true"
          >
            {/* header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/10 dark:border-white/10">
              <h2 className="text-xl font-semibold leading-none">Crear Nuevo Ticket de Soporte</h2>
              <button
                onClick={onClose}
                className="rounded-md p-2 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* form */}
            <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-6">
              {/* asunto */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="subject" className="block text-sm font-medium text-muted-foreground">Asunto</label>
                  <span className="text-xs text-muted-foreground">{subjectChars}/{SUBJECT_MAX}</span>
                </div>
                <input
                  id="subject"
                  value={form.subject}
                  onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  onBlur={() => markTouched("subject")}
                  placeholder="Ej: Problema al conectar con el servidor"
                  aria-invalid={!!errors.subject}
                  aria-describedby={errors.subject ? "subject-error" : undefined}
                  className={cx(
                    "w-full h-11 rounded-xl px-3",
                    "bg-white text-foreground border placeholder:text-black/45",
                    errors.subject ? "border-rose-400 focus:ring-rose-400/30" : "border-black/10 focus:ring-primary/40 focus:border-primary/50",
                    "focus:outline-none focus:ring-2",
                    "dark:bg-[#0b0e14] dark:border-white/10 dark:placeholder:text-white/50",
                    errors.subject && "dark:border-rose-400"
                  )}
                />
                {errors.subject && (
                  <p id="subject-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.subject}
                  </p>
                )}
              </div>

              {/* prioridad + categoría */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="priority" className="mb-2 block text-sm font-medium text-muted-foreground">Prioridad</label>
                  <div className="relative">
                    <ShieldAlert className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select
                      id="priority"
                      value={form.priority}
                      onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                      onBlur={() => markTouched("priority")}
                      aria-invalid={!!errors.priority}
                      aria-describedby={errors.priority ? "priority-error" : undefined}
                      className={cx(
                        "w-full h-11 rounded-xl pl-10 pr-9 appearance-none",
                        "bg-white text-foreground border",
                        errors.priority ? "border-rose-400 focus:ring-rose-400/30" : "border-black/10 focus:ring-primary/40 focus:border-primary/50",
                        "focus:outline-none focus:ring-2",
                        "dark:bg-[#0b0e14] dark:border-white/10",
                        errors.priority && "dark:border-rose-400"
                      )}
                    >
                      {priorityOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  {errors.priority && (
                    <p id="priority-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.priority}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="category" className="mb-2 block text-sm font-medium text-muted-foreground">Categoría</label>
                  <div className="relative">
                    <Tag className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select
                      id="category"
                      value={form.category}
                      onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                      onBlur={() => markTouched("category")}
                      aria-invalid={!!errors.category}
                      aria-describedby={errors.category ? "category-error" : undefined}
                      className={cx(
                        "w-full h-11 rounded-xl pl-10 pr-9 appearance-none",
                        "bg-white text-foreground border",
                        errors.category ? "border-rose-400 focus:ring-rose-400/30" : "border-black/10 focus:ring-primary/40 focus:border-primary/50",
                        "focus:outline-none focus:ring-2",
                        "dark:bg-[#0b0e14] dark:border-white/10",
                        errors.category && "dark:border-rose-400"
                      )}
                    >
                      {categoryOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  {errors.category && (
                    <p id="category-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>

              {/* descripción */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="description" className="block text-sm font-medium text-muted-foreground">Descripción</label>
                  <span className="text-xs text-muted-foreground">{descChars}/{DESC_MAX}</span>
                </div>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  onBlur={() => markTouched("description")}
                  placeholder="Por favor, proporciona todos los detalles posibles sobre tu solicitud. Incluye pasos para reproducir el problema si es relevante."
                  aria-invalid={!!errors.description}
                  aria-describedby={errors.description ? "description-error" : undefined}
                  className={cx(
                    "w-full min-h-[120px] rounded-xl px-3 py-3 resize-y",
                    "bg-white text-foreground border placeholder:text-black/45",
                    errors.description ? "border-rose-400 focus:ring-rose-400/30" : "border-black/10 focus:ring-primary/40 focus:border-primary/50",
                    "focus:outline-none focus:ring-2",
                    "dark:bg-[#0b0e14] dark:border-white/10 dark:placeholder:text-white/50",
                    errors.description && "dark:border-rose-400"
                  )}
                />
                {errors.description && (
                  <p id="description-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="h-px bg-black/10 dark:bg-white/10" />

              {/* acciones */}
              <div className="flex items-center justify-end gap-3 pb-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className={cx(
                    "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold",
                    "bg-[#1f242b] text-white hover:brightness-110 shadow-sm",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                    "dark:bg-white dark:text-[#0f1115]"
                  )}
                >
                  {creating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Creando Ticket...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Crear Ticket
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TicketCreateModal;