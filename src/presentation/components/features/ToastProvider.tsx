import React from "react";
import { Toaster, sileo as sileoToast } from "sileo";

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps): React.ReactElement => {
  return (
    <>
      {children}
      <Toaster 
        position="top-right" 
        theme="light"
      />
    </>
  );
};

interface SileoOptions {
  title?: string;
  description?: string;
  duration?: number;
}

// Helper function to maintain compatibility with existing code or provide a clean API
export const toast = (title: string, optionsOrDescription?: SileoOptions | string): void => {
  if (typeof optionsOrDescription === 'string') {
    sileoToast.show({ title, description: optionsOrDescription });
  } else {
    sileoToast.show({ title, ...optionsOrDescription });
  }
};

// Static methods for easier access
toast.success = (message: string, optionsOrDescription?: SileoOptions | string) => {
  if (typeof optionsOrDescription === 'string') {
    sileoToast.success({ title: message, description: optionsOrDescription });
  } else {
    sileoToast.success({ title: message, ...optionsOrDescription });
  }
};

toast.error = (message: string, optionsOrDescription?: SileoOptions | string) => {
  if (typeof optionsOrDescription === 'string') {
    sileoToast.error({ title: message, description: optionsOrDescription });
  } else {
    sileoToast.error({ title: message, ...optionsOrDescription });
  }
};

toast.warning = (message: string, optionsOrDescription?: SileoOptions | string) => {
  if (typeof optionsOrDescription === 'string') {
    sileoToast.warning({ title: message, description: optionsOrDescription });
  } else {
    sileoToast.warning({ title: message, ...optionsOrDescription });
  }
};

toast.info = (message: string, optionsOrDescription?: SileoOptions | string) => {
  if (typeof optionsOrDescription === 'string') {
    sileoToast.info({ title: message, description: optionsOrDescription });
  } else {
    sileoToast.info({ title: message, ...optionsOrDescription });
  }
};

export const useToast = () => {
  return { toast };
};
