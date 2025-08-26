import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Gamepad2,
  Cloud,
  Database,
  Star,
  Check,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BillingCycleSwitch from "../../components/pricing/billing-cycle-switch";
import PricingCard from "../../components/pricing/pricing-card";

const ContractServicePage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("hosting");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");

  /* === CATEGORÍAS === */
  const serviceCategories = [
    {
      id: "hosting",
      name: "Web Hosting",
      icon: Globe,
      description: "Hosting compartido y dedicado para sitios web",
      color: "text-blue-500",
      bgColor: "bg-blue-500/15",
    },
    {
      id: "gameserver",
      name: "Servidores de Juegos",
      icon: Gamepad2,
      description: "Servidores optimizados para gaming",
      color: "text-purple-500",
      bgColor: "bg-purple-500/15",
    },
    {
      id: "vps",
      name: "VPS Cloud",
      icon: Cloud,
      description: "Servidores virtuales privados escalables",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/15",
    },
    {
      id: "database",
      name: "Base de Datos",
      icon: Database,
      description: "Bases de datos administradas y optimizadas",
      color: "text-amber-500",
      bgColor: "bg-amber-500/15",
    },
  ];

  /* === PLANES (tus datos, sin cambios) === */
  const servicePlans = {
    hosting: [
      {
        id: "hosting-starter",
        name: "Hosting Starter",
        description: "Perfecto para sitios web personales y pequeños proyectos",
        price: { monthly: 9.99, quarterly: 8.99, annually: 7.99 },
        popular: false,
        features: [
          "1 Sitio Web",
          "10 GB SSD",
          "Ancho de banda ilimitado",
          "5 Cuentas de email",
          "SSL gratuito",
          "Soporte 24/7",
        ],
        specs: {
          storage: "10 GB SSD",
          bandwidth: "Ilimitado",
          domains: "1 Dominio",
          email: "5 Cuentas",
        },
      },
      {
        id: "hosting-pro",
        name: "Hosting Pro",
        description: "Ideal para empresas y sitios web con tráfico medio",
        price: { monthly: 19.99, quarterly: 17.99, annually: 15.99 },
        popular: true,
        features: [
          "5 Sitios Web",
          "50 GB SSD",
          "Ancho de banda ilimitado",
          "Cuentas de email ilimitadas",
          "SSL gratuito",
          "Backup diario",
          "CDN incluido",
          "Soporte prioritario",
        ],
        specs: {
          storage: "50 GB SSD",
          bandwidth: "Ilimitado",
          domains: "5 Dominios",
          email: "Ilimitado",
        },
      },
      {
        id: "hosting-enterprise",
        name: "Hosting Enterprise",
        description: "Máximo rendimiento para sitios web de alto tráfico",
        price: { monthly: 39.99, quarterly: 35.99, annually: 31.99 },
        popular: false,
        features: [
          "Sitios web ilimitados",
          "200 GB SSD",
          "Ancho de banda ilimitado",
          "Cuentas de email ilimitadas",
          "SSL gratuito",
          "Backup diario",
          "CDN premium",
          "Soporte dedicado",
          "Staging environment",
        ],
        specs: {
          storage: "200 GB SSD",
          bandwidth: "Ilimitado",
          domains: "Ilimitado",
          email: "Ilimitado",
        },
      },
    ],
    gameserver: [
      {
        id: "minecraft-basic",
        name: "Minecraft Basic",
        description: "Servidor Minecraft para jugar con amigos",
        price: { monthly: 12.99, quarterly: 11.99, annually: 9.99 },
        popular: false,
        features: [
          "Hasta 10 jugadores",
          "2 GB RAM",
          "1 vCPU",
          "25 GB SSD",
          "Panel de control",
          "Mods y plugins",
          "Backup automático",
          "Soporte 24/7",
        ],
        specs: {
          players: "10 Jugadores",
          ram: "2 GB RAM",
          cpu: "1 vCPU",
          storage: "25 GB SSD",
        },
      },
      {
        id: "minecraft-pro",
        name: "Minecraft Pro",
        description: "Servidor Minecraft para comunidades medianas",
        price: { monthly: 24.99, quarterly: 22.99, annually: 19.99 },
        popular: true,
        features: [
          "Hasta 25 jugadores",
          "4 GB RAM",
          "2 vCPU",
          "50 GB SSD",
          "Panel de control avanzado",
          "Mods y plugins ilimitados",
          "Backup automático",
          "DDoS protection",
          "Soporte prioritario",
        ],
        specs: {
          players: "25 Jugadores",
          ram: "4 GB RAM",
          cpu: "2 vCPU",
          storage: "50 GB SSD",
        },
      },
      {
        id: "minecraft-enterprise",
        name: "Minecraft Enterprise",
        description: "Servidor Minecraft para grandes comunidades",
        price: { monthly: 49.99, quarterly: 44.99, annually: 39.99 },
        popular: false,
        features: [
          "Hasta 100 jugadores",
          "8 GB RAM",
          "4 vCPU",
          "100 GB SSD",
          "Panel de control premium",
          "Mods y plugins ilimitados",
          "Backup automático",
          "DDoS protection",
          "Soporte dedicado",
          "Servidor de desarrollo",
        ],
        specs: {
          players: "100 Jugadores",
          ram: "8 GB RAM",
          cpu: "4 vCPU",
          storage: "100 GB SSD",
        },
      },
    ],
    vps: [
      {
        id: "vps-basic",
        name: "VPS Basic",
        description: "Servidor virtual para proyectos pequeños",
        price: { monthly: 19.99, quarterly: 17.99, annually: 15.99 },
        popular: false,
        features: [
          "2 GB RAM",
          "2 vCPU",
          "50 GB SSD",
          "2 TB Transferencia",
          "Ubuntu/CentOS/Debian",
          "Acceso root completo",
          "IPv4 dedicada",
          "Soporte 24/7",
        ],
        specs: {
          ram: "2 GB RAM",
          cpu: "2 vCPU",
          storage: "50 GB SSD",
          bandwidth: "2 TB",
        },
      },
      {
        id: "vps-pro",
        name: "VPS Pro",
        description: "Servidor virtual para aplicaciones medianas",
        price: { monthly: 39.99, quarterly: 35.99, annually: 31.99 },
        popular: true,
        features: [
          "4 GB RAM",
          "4 vCPU",
          "100 GB SSD",
          "4 TB Transferencia",
          "Ubuntu/CentOS/Debian/Windows",
          "Acceso root completo",
          "IPv4 dedicada",
          "Backup automático",
          "Monitoreo 24/7",
          "Soporte prioritario",
        ],
        specs: {
          ram: "4 GB RAM",
          cpu: "4 vCPU",
          storage: "100 GB SSD",
          bandwidth: "4 TB",
        },
      },
      {
        id: "vps-enterprise",
        name: "VPS Enterprise",
        description: "Servidor virtual para aplicaciones críticas",
        price: { monthly: 79.99, quarterly: 71.99, annually: 63.99 },
        popular: false,
        features: [
          "8 GB RAM",
          "8 vCPU",
          "200 GB SSD",
          "8 TB Transferencia",
          "Ubuntu/CentOS/Debian/Windows",
          "Acceso root completo",
          "IPv4 dedicada",
          "Backup automático",
          "Monitoreo 24/7",
          "Soporte dedicado",
          "SLA 99.9%",
        ],
        specs: {
          ram: "8 GB RAM",
          cpu: "8 vCPU",
          storage: "200 GB SSD",
          bandwidth: "8 TB",
        },
      },
    ],
    database: [
      {
        id: "mysql-basic",
        name: "MySQL Basic",
        description: "Base de datos MySQL para aplicaciones pequeñas",
        price: { monthly: 14.99, quarterly: 13.49, annually: 11.99 },
        popular: false,
        features: [
          "1 GB RAM",
          "20 GB SSD",
          "100 conexiones",
          "MySQL 8.0",
          "Backup diario",
          "SSL encryption",
          "Monitoreo básico",
          "Soporte 24/7",
        ],
        specs: {
          ram: "1 GB RAM",
          storage: "20 GB SSD",
          connections: "100 Conexiones",
          version: "MySQL 8.0",
        },
      },
      {
        id: "postgresql-pro",
        name: "PostgreSQL Pro",
        description: "Base de datos PostgreSQL para aplicaciones medianas",
        price: { monthly: 29.99, quarterly: 26.99, annually: 23.99 },
        popular: true,
        features: [
          "2 GB RAM",
          "50 GB SSD",
          "500 conexiones",
          "PostgreSQL 15",
          "Backup automático",
          "SSL encryption",
          "Monitoreo avanzado",
          "Réplicas de lectura",
          "Soporte prioritario",
        ],
        specs: {
          ram: "2 GB RAM",
          storage: "50 GB SSD",
          connections: "500 Conexiones",
          version: "PostgreSQL 15",
        },
      },
      {
        id: "mongodb-enterprise",
        name: "MongoDB Enterprise",
        description: "Base de datos MongoDB para aplicaciones escalables",
        price: { monthly: 59.99, quarterly: 53.99, annually: 47.99 },
        popular: false,
        features: [
          "4 GB RAM",
          "100 GB SSD",
          "1000 conexiones",
          "MongoDB 7.0",
          "Backup automático",
          "SSL encryption",
          "Monitoreo premium",
          "Sharding automático",
          "Réplicas múltiples",
          "Soporte dedicado",
        ],
        specs: {
          ram: "4 GB RAM",
          storage: "100 GB SSD",
          connections: "1000 Conexiones",
          version: "MongoDB 7.0",
        },
      },
    ],
  };

  const billingCycles = [
    { id: "monthly", name: "Mensual", discount: 0 },
    { id: "quarterly", name: "Trimestral", discount: 10 },
    { id: "annually", name: "Anual", discount: 20 },
  ];

  const getPriceWithDiscount = (price, cycle) => {
    const d = billingCycles.find((c) => c.id === cycle)?.discount || 0;
    return price * (1 - d / 100);
  };

  const handleSelectPlan = (plan) => setSelectedPlan(plan);
  const handleProceedToCheckout = () =>
    selectedPlan &&
    navigate("/client/checkout", {
      state: { plan: selectedPlan, category: selectedCategory, billingCycle },
    });

  // DEBUG rápido
  console.log(
    "cat:",
    selectedCategory,
    "planes:",
    servicePlans[selectedCategory]?.length
  );

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 mt-8 mb-10 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <h1 className="text-4xl font-bold text-foreground">
          Contratar Servicios
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Elige el servicio perfecto para tu proyecto: Hosting, servidores de
          juegos, VPS y bases de datos.
        </p>
      </motion.div>

      {/* Categorías */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {serviceCategories.map((cat) => {
          const Icon = cat.icon;
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`group text-left p-5 rounded-2xl transition-all
                          bg-white dark:bg-[#101214]
                          border border-black/5 dark:border-white/10
                          hover:shadow-md
                          ${
                            active
                              ? "ring-2 ring-[#222]/40 dark:ring-white/40"
                              : "hover:ring-1 hover:ring-[#222]/15 dark:hover:ring-white/15"
                          }`}
            >
              <div
                className={`
    grid place-items-center
    w-12 h-12 rounded-full
    ${
      cat.bgColor
    }
    shadow-sm mb-4
    transition-transform
    ${
      active
        ? "scale-105"
        : "group-hover:scale-105"
    }
  `}
              >
                <Icon className={`w-6 h-6 ${cat.color}`} />
              </div>

              <h3 className="font-semibold text-foreground mb-1">{cat.name}</h3>
              <p className="text-sm text-muted-foreground">{cat.description}</p>
            </button>
          );
        })}
      </motion.div>

      {/* Ciclo de facturación */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center"
      >
        <div className="flex justify-center">
          <BillingCycleSwitch
            value={billingCycle}
            onChange={setBillingCycle}
            cycles={billingCycles}
          />
        </div>
      </motion.div>

      {/* Planes */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {(() => {
          const list = [...(servicePlans[selectedCategory] || [])];

          // opcional: mover el popular al centro cuando hay 3
          const popIdx = list.findIndex((p) => p.popular);
          if (list.length === 3 && popIdx > -1 && popIdx !== 1) {
            const [p] = list.splice(popIdx, 1);
            list.splice(1, 0, p);
          }

          const currentDiscount =
            billingCycles.find((c) => c.id === billingCycle)?.discount ?? 0;

          return list.length ? (
            list.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                billingCycle={billingCycle}
                discount={currentDiscount}
                selected={selectedPlan?.id === plan.id}
                onSelect={() => setSelectedPlan(plan)}
              />
            ))
          ) : (
            <div className="col-span-full text-center p-10 rounded-2xl bg-black/5 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/5">
              <p className="text-foreground font-semibold">
                No hay planes para esta categoría.
              </p>
              <p className="text-muted-foreground text-sm">
                Revisa <code>servicePlans</code>.
              </p>
            </div>
          );
        })()}
      </motion.div>

      {/* CTA Checkout */}
      {selectedPlan && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-[60]"
        >
          <button
            onClick={handleProceedToCheckout}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold
                       bg-[#222222] text-white
                       dark:bg-white dark:text-[#101214]
                       shadow-lg hover:shadow-xl hover:brightness-110 active:translate-y-px
                       focus-visible:outline-none focus-visible:ring-2
                       focus-visible:ring-[#222222]/40 dark:focus-visible:ring-white/40 transition"
          >
            Proceder al Checkout
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ContractServicePage;
