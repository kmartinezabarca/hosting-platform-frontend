import React from "react";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

/** Botón inteligente: si trae `to` usa <Link>, si no, <button> */
const Action = ({ label, to, onClick, icon: Icon, variant = "primary" }) => {
  const base =
    "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold border border-border shadow-sm " +
    "hover:shadow-md transition-all active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2";
  const styles =
    variant === "destructive"
      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/30"
      : variant === "secondary"
      ? "bg-muted text-foreground hover:bg-muted/80 focus-visible:ring-primary/20"
      : "bg-primary text-primary-foreground hover:brightness-110 focus-visible:ring-primary/30";

  const content = (
    <>
      {Icon ? <Icon className="w-4 h-4" /> : null}
      {label}
    </>
  );

  return to ? (
    <Link to={to} className={`${base} ${styles}`}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={`${base} ${styles}`}>
      {content}
    </button>
  );
};

/**
 * ErrorState — estado de error centrado y reutilizable
 *
 * Props:
 * - title: string (título grande)
 * - hint: string (texto breve explicativo)
 * - error: any (se extrae mensaje de forma segura)
 * - showDetails: boolean (muestra el bloque <code> con detalles técnicos)
 * - icon: Icon component (por defecto AlertTriangle)
 * - primaryAction: { label, to?, onClick?, icon?, variant? }
 * - secondaryAction: { label, to?, onClick?, icon?, variant? }
 * - minHeight: string tailwind para alto mínimo (por defecto "min-h-[60vh]")
 * - className: string para estilos extra del contenedor
 */
const ErrorState = ({
  title = "Ocurrió un error",
  hint,
  error,
  showDetails = true,
  icon: Icon = AlertTriangle,
  primaryAction,
  secondaryAction,
  minHeight = "min-h-[60vh]",
  className = "",
}) => {
  const msg =
    typeof error === "string"
      ? error
      : error?.message || "Ocurrió un error inesperado.";

  return (
    <div
      className={`flex flex-col items-center justify-center ${minHeight} text-center px-4 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      {/* Badge con icono */}
      <span className="inline-flex items-center justify-center rounded-full p-4 bg-destructive/10 ring-1 ring-destructive/20 mb-4">
        <Icon className="w-12 h-12 text-destructive" />
      </span>

      {/* Título e hint */}
      <h2 className="mt-2 text-2xl font-bold text-foreground">{title}</h2>
      {hint ? (
        <p className="mt-2 max-w-md text-muted-foreground">{hint}</p>
      ) : null}

      {/* Detalles técnicos opcionales */}
      {showDetails && (
        <code className="mt-4 text-xs text-destructive/80 bg-destructive/5 p-2 rounded-md">
          {msg}
        </code>
      )}

      {/* Acciones */}
      {(primaryAction || secondaryAction) && (
        <div className="mt-8 inline-flex items-center justify-center gap-3 flex-wrap">
          {secondaryAction ? <Action {...secondaryAction} variant={secondaryAction.variant || "secondary"} /> : null}
          {primaryAction ? <Action {...primaryAction} /> : null}
        </div>
      )}
    </div>
  );
};

export default ErrorState;