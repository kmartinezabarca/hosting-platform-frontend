// src/pages/client/CheckoutPage.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, Lock, Check, ArrowLeft, Shield, Zap } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  emailRx,
  phoneRx,
  domainRx,
  cvvRx,
  zipRx,
  onlyDigits,
  luhnValid,
  expiryValid,
} from "../../lib/validation";

/* -------- formateo visual -------- */
const formatCardNumber = (val = "") =>
  onlyDigits(val).slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ").trim();
const formatExpiry = (val = "") => {
  const d = onlyDigits(val).slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
};

const StepDot = ({ done, current, children }) => (
  <div className="flex items-center gap-3">
    <div
      className={[
        "grid place-items-center w-9 h-9 rounded-full text-sm font-semibold transition-colors",
        done
          ? "bg-primary text-primary-foreground"
          : current
          ? "bg-foreground/90 text-background"
          : "bg-black/10 text-foreground/70 dark:bg-white/10 dark:text-white/70",
      ].join(" ")}
      aria-current={current ? "step" : undefined}
    >
      {done ? <Check className="w-4 h-4" /> : children}
    </div>
    <span
      className={[
        "text-sm font-medium",
        done || current ? "text-foreground" : "text-muted-foreground",
      ].join(" ")}
    >
      {children === 1 ? "Información" : children === 2 ? "Pago" : "Confirmación"}
    </span>
  </div>
);

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plan, category, billingCycle } = location.state || {};

  const [formData, setFormData] = useState({
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    email: user?.email || "",
    phone: "",
    serviceName: "",
    domain: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    autoRenew: true,
    backupService: false,
    prioritySupport: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!plan) navigate("/client/contract-service");
  }, [plan, navigate]);

  const billingCycles = {
    monthly: { name: "Mensual", discount: 0 },
    quarterly: { name: "Trimestral", discount: 10 },
    annually: { name: "Anual", discount: 20 },
  };

  const additionalServices = [
    {
      id: "backup",
      name: "Servicio de Backup Premium",
      description: "Backups automáticos diarios con retención de 30 días",
      price: 4.99,
      icon: Shield,
      field: "backupService",
    },
    {
      id: "priority",
      name: "Soporte Prioritario",
      description: "Soporte 24/7 con tiempo de respuesta garantizado",
      price: 9.99,
      icon: Zap,
      field: "prioritySupport",
    },
  ];

  const getPriceWithDiscount = (price, cycle) => {
    const discount = billingCycles[cycle]?.discount || 0;
    return price * (1 - discount / 100);
  };

  const calculateTotal = () => {
    if (!plan) return 0;
    let total = getPriceWithDiscount(plan.price[billingCycle], billingCycle);
    if (formData.backupService) total += 4.99;
    if (formData.prioritySupport) total += 9.99;
    return total;
  };

  /* ------------ VALIDACIÓN ------------ */
  const validateField = (name, valRaw) => {
    const v = (valRaw ?? "").toString().trim();

    // Paso 1
    if (name === "firstName") {
      if (!v) return "Nombre es requerido";
      if (v.length < 2) return "Escribe al menos 2 caracteres";
    }
    if (name === "lastName") {
      if (!v) return "Apellido es requerido";
      if (v.length < 2) return "Escribe al menos 2 caracteres";
    }
    if (name === "email") {
      if (!v) return "Email es requerido";
      if (!emailRx.test(v)) return "Email inválido";
    }
    if (name === "phone") {
      if (!v) return "Teléfono es requerido";
      if (!phoneRx.test(v)) return "Teléfono inválido";
    }
    if (name === "serviceName") {
      if (!v) return "Nombre del servicio es requerido";
      if (v.length < 3) return "Escribe al menos 3 caracteres";
    }
    if (name === "domain") {
      if (category === "hosting" && v && !domainRx.test(v))
        return "Dominio inválido (ej. midominio.com)";
    }

    // Paso 2
    if (name === "cardNumber") {
      if (!v) return "Número de tarjeta es requerido";
      const digits = onlyDigits(v);
      if (digits.length < 13) return "Número muy corto";
      if (!luhnValid(digits)) return "Número de tarjeta inválido";
    }
    if (name === "expiryDate") {
      if (!v) return "Fecha de expiración es requerida";
      if (!expiryValid(v)) return "Fecha inválida (MM/YY)";
    }
    if (name === "cvv") {
      if (!v) return "CVV es requerido";
      if (!cvvRx.test(v)) return "CVV inválido";
    }
    if (name === "cardName") {
      if (!v) return "Nombre en la tarjeta es requerido";
      if (v.length < 3) return "Escribe el nombre completo";
    }
    if (name === "address") {
      if (!v) return "Dirección es requerida";
      if (v.length < 5) return "Dirección muy corta";
    }
    if (name === "city" && !v) return "Ciudad es requerida";
    if (name === "zipCode") {
      if (!v) return "Código postal es requerido";
      if (!zipRx.test(v)) return "Código postal inválido";
    }

    return "";
  };

  const markTouched = (names) =>
    setTouched((prev) =>
      names.reduce((acc, n) => ({ ...acc, [n]: true }), { ...prev })
    );

  const focusFirstError = (errObj) => {
    const first = Object.keys(errObj)[0];
    if (!first) return;
    const el = document.querySelector(`[name="${first}"]`);
    if (el?.focus) el.focus({ preventScroll: false });
    el?.scrollIntoView?.({ behavior: "smooth", block: "center" });
  };

  const validateStep = (n) => {
    const fieldsStep1 = ["firstName", "lastName", "email", "phone", "serviceName", ...(category === "hosting" ? ["domain"] : [])];
    const fieldsStep2 = ["cardNumber", "expiryDate", "cvv", "cardName", "address", "city", "zipCode"];

    const targets = n === 1 ? fieldsStep1 : fieldsStep2;
    const newErrors = {};
    targets.forEach((k) => {
      const msg = validateField(k, formData[k]);
      if (msg) newErrors[k] = msg;
    });

    setErrors((prev) => ({ ...prev, ...newErrors }));
    markTouched(targets);

    if (Object.keys(newErrors).length) {
      focusFirstError(newErrors);
      return false;
    }
    return true;
  };

  /* ------------ cambios/blur ------------ */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    let nextValue = value;
    if (name === "cardNumber") nextValue = formatCardNumber(value);
    if (name === "expiryDate") nextValue = formatExpiry(value);
    if (name === "cvv") nextValue = onlyDigits(value).slice(0, 4);

    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : nextValue }));

    // si ya se tocó, validamos en vivo
    if (touched[name]) {
      const msg = validateField(name, type === "checkbox" ? checked : nextValue);
      setErrors((prev) => ({ ...prev, [name]: msg }));
    }
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    const msg = validateField(name, type === "checkbox" ? checked : value);
    setErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const handleNextStep = () => validateStep(step) && setStep((s) => s + 1);
  const handlePreviousStep = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(2)) return;
    setProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      navigate("/client/checkout/success", {
        state: {
          plan,
          category,
          billingCycle,
          total: calculateTotal(),
          serviceName: formData.serviceName,
        },
      });
    } finally {
      setProcessing(false);
    }
  };

  /* -------- clases visuales por campo -------- */
  const fieldStatus = (name) => {
    if (!touched[name]) return "neutral";
    if (errors[name]) return "invalid";
    // opcional: domain solo es válido si hay valor; si está vacío en hosting es neutral (no error)
    if (name === "domain" && !formData.domain) return "neutral";
    return "valid";
  };

  const inputClass = (name) => {
    const st = fieldStatus(name);
    const base =
      "w-full rounded-xl px-4 py-3 bg-white dark:bg-[#12151c] text-foreground placeholder:text-black/40 dark:placeholder:text-white/55 border transition focus:outline-none";
    if (st === "invalid")
      return `${base} border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50 dark:bg-red-500/10 placeholder:text-red-600/70`;
    if (st === "valid")
      return `${base} border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25`;
    return `${base} border-black/10 dark:border-white/10 focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30`;
  };

  if (!plan) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-16 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <button
          onClick={() => navigate("/client/contract-service")}
          className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
          <p className="text-muted-foreground">Finaliza tu contratación de servicio</p>
        </div>
      </motion.div>

      {/* Stepper */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-6">
        <StepDot done={step > 1} current={step === 1}>1</StepDot>
        <div className={`h-px w-20 ${step > 1 ? "bg-foreground/80" : "bg-black/10 dark:bg-white/10"}`} />
        <StepDot done={step > 2} current={step === 2}>2</StepDot>
        <div className={`h-px w-20 ${step > 2 ? "bg-foreground/80" : "bg-black/10 dark:bg-white/10"}`} />
        <StepDot done={false} current={step === 3}>3</StepDot>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0f1115] p-8"
          >
            {/* Paso 1 */}
            {step === 1 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold text-foreground">Información del Servicio</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { k: "firstName", label: "Nombre *", ph: "Tu nombre" },
                    { k: "lastName", label: "Apellido *", ph: "Tu apellido" },
                    { k: "email", label: "Email *", ph: "tu@email.com", type: "email" },
                    { k: "phone", label: "Teléfono *", ph: "+1 (555) 123-4567", type: "tel" },
                  ].map((f) => (
                    <div key={f.k}>
                      <label className="block text-sm font-medium text-foreground mb-2">{f.label}</label>
                      <input
                        type={f.type || "text"}
                        name={f.k}
                        value={formData[f.k]}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={inputClass(f.k)}
                        placeholder={f.ph}
                        aria-invalid={!!errors[f.k]}
                      />
                      {errors[f.k] && <p className="mt-1 text-sm text-red-600">{errors[f.k]}</p>}
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nombre del Servicio *</label>
                  <input
                    type="text"
                    name="serviceName"
                    value={formData.serviceName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={inputClass("serviceName")}
                    placeholder="Mi sitio web"
                    aria-invalid={!!errors.serviceName}
                  />
                  {errors.serviceName && <p className="mt-1 text-sm text-red-600">{errors.serviceName}</p>}
                  <p className="text-muted-foreground text-sm mt-1">
                    Este nombre te ayudará a identificar tu servicio en el panel.
                  </p>
                </div>

                {category === "hosting" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Dominio (Opcional)</label>
                    <input
                      type="text"
                      name="domain"
                      value={formData.domain}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={inputClass("domain")}
                      placeholder="midominio.com"
                      aria-invalid={!!errors.domain}
                    />
                    {errors.domain && <p className="mt-1 text-sm text-red-600">{errors.domain}</p>}
                    <p className="text-muted-foreground text-sm mt-1">
                      Puedes configurar tu dominio después de la contratación.
                    </p>
                  </div>
                )}

                {/* Servicios adicionales */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Servicios Adicionales</h3>
                  {additionalServices.map(({ id, name, description, price, icon: Icon, field }) => {
                    const checked = formData[field];
                    return (
                      <label
                        key={id}
                        className={[
                          "flex items-start gap-3 rounded-xl p-4",
                          "border border-black/10 dark:border-white/10",
                          "bg-black/[0.02] dark:bg-white/[0.03]",
                          "hover:border-foreground/20 transition cursor-pointer",
                          checked ? "ring-2 ring-foreground/20" : "",
                        ].join(" ")}
                      >
                        <input
                          type="checkbox"
                          name={field}
                          checked={checked}
                          onChange={handleInputChange}
                          className="mt-1.5 accent-foreground"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4.5 h-4.5 text-foreground/80" />
                            <h4 className="font-medium text-foreground">{name}</h4>
                            <span className="ml-auto text-foreground font-medium">+${price}/mes</span>
                          </div>
                          <p className="text-muted-foreground text-sm mt-1">{description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Paso 2 */}
            {step === 2 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold text-foreground">Información de Pago</h2>

                <div className="flex items-center gap-3 p-4 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04]">
                  <CreditCard className="w-5 h-5 text-foreground/80" />
                  <span className="font-medium text-foreground">Tarjeta de Crédito/Débito</span>
                  <div className="ml-auto flex gap-2 opacity-70">
                    <div className="w-8 h-5 rounded bg-black/10 dark:bg-white/10" />
                    <div className="w-8 h-5 rounded bg-black/10 dark:bg-white/10" />
                    <div className="w-8 h-5 rounded bg-black/10 dark:bg-white/10" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">Número de Tarjeta *</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      inputMode="numeric"
                      maxLength={23}
                      placeholder="1234 5678 9012 3456"
                      className={inputClass("cardNumber")}
                      aria-invalid={!!errors.cardNumber}
                    />
                    {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Fecha de Expiración *</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      inputMode="numeric"
                      maxLength={5}
                      placeholder="MM/YY"
                      className={inputClass("expiryDate")}
                      aria-invalid={!!errors.expiryDate}
                    />
                    {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">CVV *</label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="123"
                      className={inputClass("cvv")}
                      aria-invalid={!!errors.cvv}
                    />
                    {errors.cvv && <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">Nombre en la Tarjeta *</label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="Juan Pérez"
                      className={inputClass("cardName")}
                      aria-invalid={!!errors.cardName}
                    />
                    {errors.cardName && <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>}
                  </div>
                </div>

                {/* Dirección */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Dirección de Facturación</h3>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Dirección *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="Calle y número"
                      className={inputClass("address")}
                      aria-invalid={!!errors.address}
                    />
                    {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Ciudad *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Ciudad"
                        className={inputClass("city")}
                        aria-invalid={!!errors.city}
                      />
                      {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Estado</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Estado"
                        className={inputClass("state")}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Código Postal *</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="00000"
                        className={inputClass("zipCode")}
                        aria-invalid={!!errors.zipCode}
                      />
                      {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>}
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] cursor-pointer">
                  <input
                    type="checkbox"
                    name="autoRenew"
                    checked={formData.autoRenew}
                    onChange={handleInputChange}
                    className="mt-1.5 accent-foreground"
                  />
                  <div>
                    <h4 className="font-medium text-foreground">Renovación Automática</h4>
                    <p className="text-muted-foreground text-sm">
                      Tu servicio se renovará automáticamente para evitar interrupciones.
                    </p>
                  </div>
                </label>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handlePreviousStep}
                    className="sm:flex-1 rounded-xl px-5 py-3 border border-black/10 dark:border-white/10 bg-transparent text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition"
                  >
                    Volver
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="sm:flex-1 rounded-xl px-5 py-3 bg-foreground text-background font-semibold hover:opacity-90 transition"
                  >
                    Revisar Pedido
                  </button>
                </div>
              </div>
            )}

            {/* Paso 3 */}
            {step === 3 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold text-foreground">Confirmar Pedido</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-black/10 dark:border-white/10 p-4">
                    <h3 className="font-semibold text-foreground mb-2">Resumen del Servicio</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Servicio:</span>
                        <span className="text-foreground">{plan.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nombre:</span>
                        <span className="text-foreground">{formData.serviceName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ciclo:</span>
                        <span className="text-foreground">{billingCycles[billingCycle].name}</span>
                      </div>
                      {formData.domain && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dominio:</span>
                          <span className="text-foreground">{formData.domain}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-black/10 dark:border-white/10 p-4">
                    <h3 className="font-semibold text-foreground mb-2">Información de Contacto</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nombre:</span>
                        <span className="text-foreground">
                          {formData.firstName} {formData.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="text-foreground">{formData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Teléfono:</span>
                        <span className="text-foreground">{formData.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/15">
                  <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground">Pago Seguro</h4>
                    <p className="text-muted-foreground text-sm">
                      Tu información está protegida con encriptación SSL de 256 bits.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handlePreviousStep}
                    className="sm:flex-1 rounded-xl px-5 py-3 border border-black/10 dark:border-white/10 bg-transparent text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition"
                  >
                    Volver
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={processing}
                    className="sm:flex-1 rounded-xl px-5 py-3 bg-foreground text-background font-semibold hover:opacity-90 transition disabled:opacity-60"
                  >
                    {processing ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-background border-t-transparent animate-spin" />
                        Procesando…
                      </span>
                    ) : (
                      `Pagar $${calculateTotal().toFixed(2)}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <motion.aside
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky top-6 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0f1115] p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-5">Resumen del Pedido</h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{plan.name}</span>
                <span className="text-foreground font-medium">
                  ${getPriceWithDiscount(plan.price[billingCycle], billingCycle).toFixed(2)}
                </span>
              </div>

              {formData.backupService && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Backup Premium</span>
                  <span className="text-foreground font-medium">$4.99</span>
                </div>
              )}
              {formData.prioritySupport && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Soporte Prioritario</span>
                  <span className="text-foreground font-medium">$9.99</span>
                </div>
              )}

              {billingCycles[billingCycle].discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Descuento ({billingCycles[billingCycle].discount}%)</span>
                  <span>
                    -${((plan.price[billingCycle] * billingCycles[billingCycle].discount) / 100).toFixed(2)}
                  </span>
                </div>
              )}

              <hr className="border-black/10 dark:border-white/10 my-2" />

              <div className="flex justify-between text-lg font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">${calculateTotal().toFixed(2)}</span>
              </div>
              <p className="text-muted-foreground text-sm">
                /
                {billingCycle === "monthly"
                  ? "mes"
                  : billingCycle === "quarterly"
                  ? "trimestre"
                  : "año"}
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-black/10 dark:border-white/10">
              <h4 className="font-semibold text-foreground mb-3">Incluye:</h4>
              <div className="space-y-2">
                {plan.features.slice(0, 4).map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm text-muted-foreground">{f}</span>
                  </div>
                ))}
                {plan.features.length > 4 && (
                  <p className="text-muted-foreground text-sm">
                    +{plan.features.length - 4} características más
                  </p>
                )}
              </div>
            </div>

            {step === 1 && (
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full mt-6 rounded-xl px-5 py-3 bg-foreground text-background font-semibold hover:opacity-90 transition"
              >
                Continuar al Pago
              </button>
            )}
          </motion.aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
