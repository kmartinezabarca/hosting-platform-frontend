import React from "react";
import { Toaster, sileo as sileoToast } from "sileo";
import "sileo/styles.css";
import { useTheme } from "@application/context/ThemeContext";

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider = ({
  children,
}: ToastProviderProps): React.ReactElement => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <>
      {children}
      <Toaster
        position="top-center"
        theme={isDark ? "dark" : "light"}
        options={{
          styles: {
            description: isDark ? "text-zinc-600!" : "text-white/75!",
          },
          // In dark mode: white pill on dark page (matches reference look)
          // In light mode: soft gray pill on light page
          fill: isDark ? "#ffffff" : "#0F172B",
          roundness: 14,
          duration: 4000,
        }}
      />
    </>
  );
};

interface SileoOptions {
  title?: string;
  description?: string;
  duration?: number;
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  icon?: React.ReactNode;
  action?: { label: string; onClick: () => void };
  roundness?: number;
  fill?: string;
  styles?: Record<string, string>;
  autopilot?: boolean | { expand: number; collapse: number };
}

export const toast = (
  title: string,
  optionsOrDescription?: SileoOptions | string,
): void => {
  if (typeof optionsOrDescription === "string") {
    sileoToast.show({ title, description: optionsOrDescription });
  } else {
    sileoToast.show({ title, ...optionsOrDescription });
  }
};

toast.success = (
  message: string,
  optionsOrDescription?: SileoOptions | string,
) => {
  if (typeof optionsOrDescription === "string") {
    sileoToast.success({ title: message, description: optionsOrDescription });
  } else {
    sileoToast.success({ title: message, ...optionsOrDescription });
  }
};

toast.error = (
  message: string,
  optionsOrDescription?: SileoOptions | string,
) => {
  if (typeof optionsOrDescription === "string") {
    sileoToast.error({ title: message, description: optionsOrDescription });
  } else {
    sileoToast.error({ title: message, ...optionsOrDescription });
  }
};

toast.warning = (
  message: string,
  optionsOrDescription?: SileoOptions | string,
) => {
  if (typeof optionsOrDescription === "string") {
    sileoToast.warning({ title: message, description: optionsOrDescription });
  } else {
    sileoToast.warning({ title: message, ...optionsOrDescription });
  }
};

toast.info = (
  message: string,
  optionsOrDescription?: SileoOptions | string,
) => {
  if (typeof optionsOrDescription === "string") {
    sileoToast.info({ title: message, description: optionsOrDescription });
  } else {
    sileoToast.info({ title: message, ...optionsOrDescription });
  }
};

// Native Sileo promise — shows loading → success/error automatically
toast.promise = <T,>(
  promise: Promise<T>,
  messages: { loading: string; success: string; error: string },
): Promise<T> => {
  return sileoToast.promise(promise, {
    loading: { title: messages.loading },
    success: { title: messages.success },
    error: { title: messages.error },
  });
};

export const useToast = () => {
  return { toast };
};
