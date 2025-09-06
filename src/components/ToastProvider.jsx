import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

const ToastCtx = createContext({ toast: () => {} });

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(({ title, description, variant = "default", duration = 3200 }) => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, title, description, variant }]);
    if (duration > 0) setTimeout(() => remove(id), duration);
  }, [remove]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      {createPortal(
        <div
          className="fixed z-[1000] top-4 right-4 space-y-2 w-[calc(100vw-2rem)] max-w-sm"
          role="region" aria-live="polite" aria-label="Notificaciones"
        >
          {toasts.map(({ id, title, description, variant }) => {
            const base = "pointer-events-auto rounded-xl border p-3 shadow-lg ring-1 bg-card";
            const color =
              variant === "success"
                ? "border-emerald-400/30 ring-emerald-400/20"
                : variant === "destructive"
                ? "border-destructive/40 ring-destructive/25"
                : variant === "info"
                ? "border-primary/30 ring-primary/20"
                : "border-border/60 ring-black/5 dark:ring-white/5";
            return (
              <div key={id} className={`${base} ${color}`}>
                <div className="flex items-start gap-3">
                  <div className="min-w-0">
                    {title && <p className="text-sm font-semibold text-foreground">{title}</p>}
                    {description && (
                      <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => remove(id)}
                    className="ml-auto p-1 rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    aria-label="Cerrar notificación"
                  >
                    <X className="w-4 h-4 text-foreground/90" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </ToastCtx.Provider>
  );
};

export const useToast = () => useContext(ToastCtx);