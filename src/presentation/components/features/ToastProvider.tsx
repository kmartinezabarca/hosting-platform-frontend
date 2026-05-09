import React from "react";
import { Toaster, toast as sonnerToast } from "sonner";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'default';
  duration?: number;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps): React.ReactElement => {
  return (
    <>
      {children}
      <Toaster 
        position="top-right" 
        richColors 
        closeButton
        theme="light"
        toastOptions={{
          style: {
            borderRadius: '12px',
            padding: '16px',
          },
        }}
      />
    </>
  );
};

// Helper function to maintain compatibility with existing code or provide a clean API
export const toast = (opts: ToastOptions | string): void => {
  if (typeof opts === 'string') {
    sonnerToast(opts);
    return;
  }

  const { title, description, variant = 'default', duration = 4000 } = opts;
  
  const toastFn = variant === 'default' ? sonnerToast : sonnerToast[variant];
  
  toastFn(title, {
    description,
    duration,
  });
};

// Static methods for easier access
toast.success = (message: string, description?: string) => sonnerToast.success(message, { description });
toast.error = (message: string, description?: string) => sonnerToast.error(message, { description });
toast.warning = (message: string, description?: string) => sonnerToast.warning(message, { description });
toast.info = (message: string, description?: string) => sonnerToast.info(message, { description });

export const useToast = () => {
  return { toast };
};
