import React, { createContext, useCallback, useContext, useState } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'default';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
}

type ToastFn = (opts: ToastOptions) => void;

const ToastCtx = createContext<ToastFn | null>(null);

let toastFunction: ToastFn | null = null;

const colors: Record<ToastVariant, string> = {
  success: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200",
  error: "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
  warning: "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200",
  info: "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
  default: "bg-card border-border text-foreground",
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps): React.ReactElement => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string): void => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(({ title, description, variant = "default", duration = 4000 }: ToastOptions): void => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, title, description, variant }]);
    if (duration > 0) setTimeout(() => remove(id), duration);
  }, [remove]);

  toastFunction = toast;

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      {createPortal(
        <div className="fixed z-[1000] top-4 right-4 space-y-2 w-[calc(100vw-2rem)] max-w-sm">
          {toasts.map(({ id, title, description, variant }) => (
            <div key={id} className={`pointer-events-auto rounded-xl border p-4 shadow-lg ${colors[variant ?? 'default']}`}>
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  {title && <p className="text-sm font-semibold">{title}</p>}
                  {description && <p className="text-sm opacity-80">{description}</p>}
                </div>
                <button onClick={() => remove(id)} className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5" aria-label="Cerrar">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastCtx.Provider>
  );
};

export const useToast = (): ToastFn | { toast: () => void } => {
  const ctx = useContext(ToastCtx);
  if (!ctx) return { toast: () => {} };
  return ctx;
};

export const toast = (opts: ToastOptions): void => {
  if (toastFunction) {
    toastFunction(opts);
  }
};

toast.success = (message: string, opts?: Omit<ToastOptions, 'variant'>): void => toastFunction?.({ title: message, variant: "success", ...opts });
toast.error = (message: string, opts?: Omit<ToastOptions, 'variant'>): void => toastFunction?.({ title: message, variant: "error", ...opts });
toast.warning = (message: string, opts?: Omit<ToastOptions, 'variant'>): void => toastFunction?.({ title: message, variant: "warning", ...opts });
toast.info = (message: string, opts?: Omit<ToastOptions, 'variant'>): void => toastFunction?.({ title: message, variant: "info", ...opts });