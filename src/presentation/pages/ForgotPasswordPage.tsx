import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  ArrowRight,
  ShieldCheck,
  Clock3,
  LockKeyhole,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { AxiosError } from "axios";

import { useForgotPassword } from "@application/hooks/useAuth";
import logoROKE from "@presentation/assets/ROKEIndustriesFusionLogo.png";

interface ApiErrorResponse {
  success?: boolean;
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { mutateAsync: forgotPassword, isPending: isLoading } =
    useForgotPassword();

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      errors.email = "El correo electrónico es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      errors.email = "Ingresa un correo electrónico válido.";
    }

    return errors;
  };

  const getErrorMessage = (error: unknown): string => {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    if (!axiosError.response) {
      return "No fue posible conectar con el servidor. Verifica tu conexión.";
    }

    const { status, data } = axiosError.response;

    switch (status) {
      case 403:
        return (
          data?.message ||
          "Esta cuenta utiliza inicio de sesión con Google."
        );

      case 422:
        if (data?.errors) {
          const firstError = Object.values(data.errors)?.[0];

          if (Array.isArray(firstError) && firstError.length > 0) {
            return firstError[0];
          }
        }

        return data?.message || "La solicitud no pudo ser procesada.";

      case 429:
        return (
          data?.message ||
          "Demasiados intentos. Intenta nuevamente más tarde."
        );

      case 500:
        return "Ocurrió un error interno. Intenta nuevamente más tarde.";

      default:
        return data?.message || "Ocurrió un error inesperado.";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);

    if (formErrors.email) {
      setFormErrors((prev) => ({
        ...prev,
        email: "",
      }));
    }

    clearMessages();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    clearMessages();

    const errors = validateForm();

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const response = await forgotPassword(
        email.trim().toLowerCase(),
      );

      setMessage(
        response?.message ||
          "Si la cuenta existe, enviaremos instrucciones al correo registrado.",
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f7fb]">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-[-250px] left-[-120px] h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-200px] right-[-100px] h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-6xl gap-14 lg:grid-cols-2 lg:items-center">
          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="hidden lg:block"
          >
            <img
              src={logoROKE}
              alt="ROKE Industries"
              className="mb-10 h-16 w-auto"
            />

            <div className="max-w-xl">
              <span className="mb-5 inline-flex items-center rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                Seguridad y recuperación de acceso
              </span>

              <h1 className="text-5xl font-bold leading-tight text-slate-900">
                Recupera el acceso a tu cuenta
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                Restablece tu contraseña de forma segura y continúa gestionando
                tus servicios, infraestructura y plataforma desde cualquier
                lugar.
              </p>
            </div>

            <div className="mt-12 space-y-6">
              {[
                {
                  icon: ShieldCheck,
                  title: "Protección avanzada",
                  text: "Todas las solicitudes son protegidas mediante validaciones y controles de seguridad.",
                },
                {
                  icon: Clock3,
                  title: "Proceso rápido",
                  text: "Recibe instrucciones de recuperación en cuestión de segundos.",
                },
                {
                  icon: LockKeyhole,
                  title: "Acceso seguro",
                  text: "Tus credenciales y sesiones permanecen protegidas durante todo el proceso.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT CARD */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto w-full max-w-md"
          >
            <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              {/* MOBILE LOGO */}
              <div className="mb-6 flex justify-center lg:hidden">
                <img
                  src={logoROKE}
                  alt="ROKE Industries"
                  className="h-14 w-auto"
                />
              </div>

              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Recuperar contraseña
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  Ingresa el correo asociado a tu cuenta y te enviaremos las
                  instrucciones necesarias para restablecer tu contraseña.
                </p>
              </div>

              {/* SUCCESS */}
              {message && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />

                  <p className="text-sm leading-relaxed">
                    {message}
                  </p>
                </div>
              )}

              {/* ERROR */}
              {error && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-red-700">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />

                  <p className="text-sm leading-relaxed">
                    {error}
                  </p>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-6"
                noValidate
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Correo electrónico
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={handleChange}
                      disabled={isLoading}
                      placeholder="correo@empresa.com"
                      className={`
                        w-full rounded-2xl border bg-white py-3.5 pl-12 pr-4
                        text-slate-900 placeholder:text-slate-400
                        transition-all duration-200 outline-none
                        ${
                          formErrors.email
                            ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                            : "border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10"
                        }
                      `}
                    />
                  </div>

                  {formErrors.email && (
                    <p className="mt-2 text-sm text-red-500">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                    flex w-full items-center justify-center gap-2
                    rounded-2xl bg-slate-950 px-4 py-3.5
                    text-sm font-semibold text-white
                    transition-all duration-300
                    hover:-translate-y-[1px]
                    hover:bg-slate-900
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      Enviar instrucciones
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-slate-500">
                ¿Recordaste tu contraseña?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-slate-900 transition-colors hover:text-primary"
                >
                  Iniciar sesión
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;