// /components/chat/NewTicketForm.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, ChevronDown } from "lucide-react";
import { useCreateTicket } from "../../hooks/useTickets";
import { cn } from "../../lib/utils";

const PRIORITIES = [
  { value: "low",    label: "Baja",    dot: "bg-slate-400" },
  { value: "medium", label: "Media",   dot: "bg-blue-400" },
  { value: "high",   label: "Alta",    dot: "bg-amber-400" },
  { value: "urgent", label: "Urgente", dot: "bg-red-500" },
];

const inputCls = cn(
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm",
  "text-foreground placeholder:text-muted-foreground",
  "outline-none ring-0 transition",
  "focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10",
  "disabled:opacity-50 disabled:cursor-not-allowed"
);

export const NewTicketForm = ({ onCancel, onCreated }) => {
  const [subject, setSubject]   = useState("");
  const [priority, setPriority] = useState("medium");
  const [message, setMessage]   = useState("");
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [done, setDone]         = useState(false);

  const { mutateAsync: createTicket, isPending } = useCreateTicket();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!subject.trim()) e.subject = "El asunto es requerido";
    else if (subject.trim().length < 5) e.subject = "Mínimo 5 caracteres";
    if (!message.trim()) e.message = "Describe tu problema";
    else if (message.trim().length < 10) e.message = "Mínimo 10 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await createTicket({ subject: subject.trim(), priority, message: message.trim() });
      setDone(true);
      onCreated?.();
    } catch (err) {
      setErrors({ _global: (err as any)?.response?.data?.message || "Error al crear el ticket. Intenta de nuevo." });
    }
  };

  /* ── Estado de éxito ─────────────────────────────────────── */
  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center"
      >
        <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="font-semibold text-foreground">¡Ticket creado!</p>
          <p className="text-sm text-muted-foreground mt-1">
            Nuestro equipo te responderá pronto.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="mt-2 px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Volver al chat
        </button>
      </motion.div>
    );
  }

  /* ── Formulario ──────────────────────────────────────────── */
  return (
    <form
      onSubmit={handleSubmit}
      className="flex-1 flex flex-col overflow-hidden"
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Error global */}
        {errors._global && (
          <div className="flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {errors._global}
          </div>
        )}

        {/* Asunto */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            Asunto <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            className={cn(inputCls, errors.subject && "border-destructive focus:border-destructive focus:ring-destructive/10")}
            placeholder="Resumen breve de tu problema"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (errors.subject) setErrors((p) => { const n = { ...p }; delete n.subject; return n; });
            }}
            disabled={isPending}
            maxLength={120}
          />
          {errors.subject && (
            <p className="text-xs text-destructive">{errors.subject}</p>
          )}
        </div>

        {/* Prioridad */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Prioridad</label>
          <div className="relative">
            <select
              className={cn(inputCls, "pr-8 appearance-none cursor-pointer")}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={isPending}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          {/* Indicador visual de prioridad seleccionada */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("inline-block w-2 h-2 rounded-full", PRIORITIES.find(p => p.value === priority)?.dot)} />
            {PRIORITIES.find(p => p.value === priority)?.label}
          </div>
        </div>

        {/* Descripción */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            Descripción <span className="text-destructive">*</span>
          </label>
          <textarea
            className={cn(
              inputCls,
              "resize-none leading-relaxed",
              errors.message && "border-destructive focus:border-destructive focus:ring-destructive/10"
            )}
            placeholder="Describe tu problema con el mayor detalle posible..."
            rows={5}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (errors.message) setErrors((p) => { const n = { ...p }; delete n.message; return n; });
            }}
            disabled={isPending}
            maxLength={2000}
          />
          <div className="flex justify-between items-center">
            {errors.message
              ? <p className="text-xs text-destructive">{errors.message}</p>
              : <span />
            }
            <span className="text-xs text-muted-foreground">{message.length}/2000</span>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="flex-1 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 py-2 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              Enviando...
            </>
          ) : (
            "Crear ticket"
          )}
        </button>
      </div>
    </form>
  );
};
