// src/pages/CheckoutSuccessPage.jsx
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Download,
  Mail,
  Calendar,
  Home,
  Settings,
  ExternalLink,
  Clock,
  Shield,
  Zap,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const iconCircle =
  "inline-flex items-center justify-center w-12 h-12 rounded-full";
const cardShell =
  "rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0f1115]";

export default function CheckoutSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { plan, category, billingCycle, total, serviceName } =
    location.state || {};

  useEffect(() => {
    if (!plan) navigate("/client/dashboard");
  }, [plan, navigate]);

  const nextSteps = [
    {
      icon: Mail,
      title: "Revisa tu email",
      description:
        "Te hemos enviado los detalles de tu servicio y credenciales de acceso.",
      action: "Abrir Gmail",
      link: "https://gmail.com",
      circle:
        "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300 ring-1 ring-sky-700/10 dark:ring-sky-300/20",
    },
    {
      icon: Settings,
      title: "Configura tu servicio",
      description:
        "Accede al panel de control para configurar tu nuevo servicio.",
      action: "Ir al Panel",
      link: "/client/services",
      circle:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300 ring-1 ring-indigo-700/10 dark:ring-indigo-300/20",
    },
    {
      icon: Download,
      title: "Descarga recursos",
      description: "Guías de inicio rápido y documentación técnica.",
      action: "Descargar",
      link: "#",
      circle:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300 ring-1 ring-emerald-700/10 dark:ring-emerald-300/20",
    },
  ];

  const serviceDetails = {
    hosting: {
      setupTime: "5-10 minutos",
      accessInfo: "Panel cPanel disponible inmediatamente",
      nextAction: "Subir archivos vía FTP o File Manager",
    },
    gameserver: {
      setupTime: "2-5 minutos",
      accessInfo: "Servidor disponible inmediatamente",
      nextAction: "Conectar usando la IP del servidor",
    },
    vps: {
      setupTime: "10-15 minutos",
      accessInfo: "Acceso SSH disponible tras la configuración",
      nextAction: "Conectar vía SSH con las credenciales enviadas",
    },
    database: {
      setupTime: "3-7 minutos",
      accessInfo: "Base de datos disponible inmediatamente",
      nextAction:
        "Conectar usando las credenciales de la base de datos enviadas",
    },
  };
  const cur = serviceDetails[category] || serviceDetails.hosting;

  if (!plan) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-14 space-y-10">
      {/* Hero success */}
      <motion.section
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${cardShell} p-8 text-center`}
      >
        <div
          className={`${iconCircle} mx-auto mb-4 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20`}
          aria-hidden
        >
          <CheckCircle className="w-7 h-7" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          ¡Pago Exitoso!
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mt-2">
          Tu servicio <span className="font-medium">“{serviceName}”</span> ha
          sido contratado exitosamente.
        </p>

        <div className="mt-6 mx-auto max-w-md rounded-xl border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/15 p-5">
          <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
            Total pagado
          </p>
          <div className="text-3xl sm:text-4xl font-bold text-foreground mt-1">
            ${parseFloat(total || 0).toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Facturación{" "}
            {billingCycle === "monthly"
              ? "mensual"
              : billingCycle === "quarterly"
              ? "trimestral"
              : "anual"}
          </p>
        </div>
      </motion.section>

      {/* Información del servicio */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${cardShell} p-8`}
      >
        <h2 className="text-2xl font-semibold text-foreground">
          Información del Servicio
        </h2>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Plan Contratado
              </p>
              <p className="text-foreground mt-1">{plan.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Nombre del Servicio
              </p>
              <p className="text-foreground mt-1">{serviceName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Estado
              </p>
              <div className="mt-1 inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-600 dark:text-amber-400">
                  Configurando
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Tiempo de Configuración
              </p>
              <div className="mt-1 flex items-center gap-2 text-foreground">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{cur.setupTime}</span>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Acceso
              </p>
              <p className="text-muted-foreground mt-1">{cur.accessInfo}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Próximo Paso
              </p>
              <p className="text-muted-foreground mt-1">{cur.nextAction}</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Próximos pasos */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-semibold text-foreground">
          Próximos Pasos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {nextSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.article
                key={step.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * (i + 1) }}
                className={`${cardShell} p-6 hover:shadow-lg hover:-translate-y-0.5 transition`}
              >
                <div className="space-y-4">
                  <div className={`${iconCircle} ${step.circle}`} aria-hidden>
                    <Icon className="w-6 h-6" />
                  </div>

                  <header>
                    <h3 className="font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  </header>

                  <button
                    onClick={() => {
                      if (step.link.startsWith("http")) {
                        window.open(step.link, "_blank", "noopener,noreferrer");
                      } else if (step.link !== "#") {
                        navigate(step.link);
                      }
                    }}
                    className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold
                               bg-black/5 dark:bg-white/10 text-foreground
                               hover:bg-black/10 dark:hover:bg-white/15 transition inline-flex items-center justify-center gap-2"
                  >
                    {step.action}
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </motion.section>

      {/* Soporte & Garantías (banda oscura) */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-[#0f1629] text-white dark:bg-[#0f1629] p-6 sm:p-8"
      >
        <h2 className="text-2xl font-semibold mb-6">Soporte y Garantías</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className={`${iconCircle} bg-white/10`} aria-hidden>
              <Shield className="w-6 h-6" />
            </div>
            <p className="font-semibold">Garantía 30 días</p>
            <p className="text-sm text-white/70">
              Reembolso completo si no estás satisfecho.
            </p>
          </div>

          <div className="space-y-2">
            <div className={`${iconCircle} bg-white/10`} aria-hidden>
              <Zap className="w-6 h-6" />
            </div>
            <p className="font-semibold">Soporte 24/7</p>
            <p className="text-sm text-white/70">
              Asistencia técnica disponible siempre.
            </p>
          </div>

          <div className="space-y-2">
            <div className={`${iconCircle} bg-white/10`} aria-hidden>
              <Calendar className="w-6 h-6" />
            </div>
            <p className="font-semibold">SLA 99.9%</p>
            <p className="text-sm text-white/70">
              Garantía de disponibilidad del servicio.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Acciones */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-3 justify-center"
      >
        <button
          onClick={() => navigate("/client/services")}
          className="rounded-xl px-5 py-3 font-semibold
                     bg-foreground text-background hover:opacity-90 transition inline-flex items-center gap-2"
        >
          <Settings className="w-5 h-5" />
          Gestionar Servicios
        </button>
        <button
          onClick={() => navigate("/client/dashboard")}
          className="rounded-xl px-5 py-3 font-semibold
                     border border-black/10 dark:border-white/10
                     bg-transparent text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition inline-flex items-center gap-2"
        >
          <Home className="w-5 h-5" />
          Ir al Dashboard
        </button>
      </motion.section>

      {/* Aviso email */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-sky-500/20 bg-sky-500/10 dark:bg-sky-500/15 p-5 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <Mail className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <h3 className="font-semibold text-foreground">
            Confirmación por Email
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Enviamos los detalles del servicio, credenciales de acceso y tu
          factura a tu email. Si no lo encuentras, revisa la carpeta de spam.
        </p>
      </motion.section>
    </div>
  );
}
