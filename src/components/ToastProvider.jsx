import React from "react";
import { Toaster } from "sonner";

export const ToastProvider = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        theme="system"
        toastOptions={{
          styles: {
            root: {
              background: 'var(--card)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              borderRadius: '0.75rem',
            },
            success: {
              background: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
            },
            error: {
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca',
            },
            warning: {
              background: '#fffbeb',
              color: '#92400e',
              border: '1px solid #fde68a',
            },
            info: {
              background: '#eff6ff',
              color: '#1e40af',
              border: '1px solid #bfdbfe',
            },
          },
        }}
      />
    </>
  );
};

export const useToast = () => {
  return {
    toast: () => {},
    toastSuccess: () => {},
    toastError: () => {},
  };
};