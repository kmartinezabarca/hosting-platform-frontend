import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@application/context/AuthContext";
import { emailRx, phoneRx, domainRx } from "@shared/utils/validation";
import { rfcMxRx, toBase64 } from "@shared/utils/cfdi";

import Stepper from "@presentation/components/features/checkout/Stepper";
import GameSelector from "@presentation/components/features/checkout/GameSelector";
import ServiceFields from "@presentation/components/features/checkout/ServiceFields";
import Addons from "@presentation/components/features/checkout/Addons";
import InvoiceFields from "@presentation/components/features/checkout/InvoiceFields";
import ReviewAndPay from "@presentation/components/features/checkout/ReviewAndPay";
import OrderSummary from "@presentation/components/features/checkout/OrderSummary";
import { usePlanAddons, usePaymentMethods, useGameEggs } from "@application/hooks/useCheckout";
import AddPaymentMethodModal from "@presentation/components/features/invoices/AddPaymentMethodModal";
import { queryClient } from "@shared/utils/react-query";

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { plan, category, billingCycle } = location.state || {};
  const [step, setStep] = useState(1);
  const payRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    serviceName: "",
    selectedEggId: null,
    domain: "",
    game: "",
    autoRenew: true,
    requireInvoice: false,
    invoiceProfileUuid: "",   // UUID del perfil fiscal guardado seleccionado
    invoicePersonType: "fisica",
    invoiceRfc: "",
    invoiceName: "",
    invoiceZip: "",
    invoiceRegimen: "",
    invoiceUsoCfdi: "G03",
    invoiceConstanciaName: "",
    invoiceConstanciaMime: "",
    invoiceConstanciaB64: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [addons, setAddons] = useState<any[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(null);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);

  useEffect(() => {
    if (!plan) navigate("/client/contract-service");
  }, [plan, navigate]);

  const isGameServer = category === "game_server" || category === "gameserver";
  const { data: gameNests = [], isLoading: gameEggsLoading } = useGameEggs(
    plan?.uuid || plan?.id,
    !!plan && isGameServer
  );

  const { data: fetchedAddons = [] } = usePlanAddons(plan?.id, !!plan);
  const { data: fetchedPaymentMethods = [] } = usePaymentMethods();

  useEffect(() => {
    setAddons(fetchedAddons);
  }, [fetchedAddons]);

  useEffect(() => {
    setPaymentMethods(fetchedPaymentMethods);
    if (fetchedPaymentMethods.length > 0) {
      const defaultPm = fetchedPaymentMethods.find((m) => m.is_default);
      setSelectedPaymentMethodId(defaultPm ? defaultPm.stripe_payment_method_id : null);
    }
  }, [fetchedPaymentMethods]);

  const billingCycles = {
    monthly: { name: "Mensual", discount: 0 },
    quarterly: { name: "Trimestral", discount: 10 },
    annually: { name: "Anual", discount: 20 },
  };

  const getPriceWithDiscount = (price, cycle) => {
    const discount = billingCycles[cycle]?.discount || 0;
    return price * (1 - discount / 100);
  };

  const calculateTotals = () => {
    if (!plan) return { subtotal: 0, iva: 0, total: 0 };

    let subtotal = getPriceWithDiscount(plan.price[billingCycle], billingCycle);

    selectedAddOns.forEach((addId) => {
      const add = addons.find((a) => a.uuid === addId || a.id === addId);

      if (add) {
        subtotal += parseFloat(add.price) || 0;
      }
    });

    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    const formattedSubtotal = parseFloat(subtotal.toFixed(2));
    const formattedIva = parseFloat(iva.toFixed(2));
    const formattedTotal = parseFloat(total.toFixed(2));

    return {
      subtotal: formattedSubtotal,
      iva: formattedIva,
      total: formattedTotal,
    };
  };

  const totals = calculateTotals();

  /* ---------- Validación (Paso 1) ---------- */
  const validateField = (name, raw) => {
    const v = (raw ?? "").toString().trim();

    if (name === "selectedEggId" && isGameServer) {
      if (!v) return "Debes seleccionar un juego";
    }
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
    if (name === "domain" && category === "hosting") {
      if (v && !domainRx.test(v)) return "Dominio inválido (ej. midominio.com)";
    }

    if (formData.requireInvoice) {
      if (name === "invoiceRfc") {
        if (!v) return "RFC es requerido";
        if (!rfcMxRx.test(v)) return "RFC inválido";
      }
      if (name === "invoiceName") {
        if (!v) return "Razón social / Nombre es requerido";
        if (v.length < 2) return "Escribe al menos 2 caracteres";
      }
      if (name === "invoiceZip") {
        if (!v) return "Código Postal del domicilio fiscal es requerido";
        if (!/^\d{5}$/.test(v)) return "CP inválido";
      }
      if (name === "invoiceRegimen" && !v) return "Régimen fiscal es requerido";
      if (name === "invoiceUsoCfdi" && !v) return "Uso de CFDI es requerido";
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
    el?.scrollIntoView?.({ behavior: "smooth", block: "center" });
    (el as HTMLElement)?.focus?.({ preventScroll: true });
  };

  const validateStep1 = () => {
    const base = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "serviceName",
      ...(category === "hosting" ? ["domain"] : []),
    ];
    const invoice = formData.requireInvoice
      ? [
          "invoiceRfc",
          "invoiceName",
          "invoiceZip",
          "invoiceRegimen",
          "invoiceUsoCfdi",
        ]
      : [];
    const targets = [...base, ...invoice];

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

  /* ---------- Handlers ---------- */
  const handleInputChange = async (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === "invoiceConstancia" && files?.[0]) {
      const f = files[0];
      const b64 = await toBase64(f);
      (setFormData as any)((p: any) => ({
        ...p,
        invoiceConstanciaName: f.name,
        invoiceConstanciaMime: f.type,
        invoiceConstanciaB64: b64,
      }));
      return;
    }

    const val = type === "checkbox" ? checked : value;
    setFormData((p) => ({ ...p, [name]: val }));

    if (touched[name]) {
      const msg = validateField(name, val);
      setErrors((prev) => ({ ...prev, [name]: msg }));
    }

    if (name === "requireInvoice" && !checked) {
      setErrors((prev) => {
        const n = { ...prev };
        [
          "invoiceRfc",
          "invoiceName",
          "invoiceZip",
          "invoiceRegimen",
          "invoiceUsoCfdi",
        ].forEach((k) => delete n[k]);
        return n;
      });
      setFormData((p) => ({
        ...p,
        invoiceProfileUuid: "",
        invoicePersonType: "fisica",
        invoiceRfc: "",
        invoiceName: "",
        invoiceZip: "",
        invoiceRegimen: "",
        invoiceUsoCfdi: "G03",
        invoiceConstanciaName: "",
        invoiceConstanciaMime: "",
        invoiceConstanciaB64: "",
      }));
    }

    // If the user edits any fiscal field manually, deselect the saved profile
    const fiscalManualFields = [
      "invoiceRfc", "invoiceName", "invoiceZip", "invoiceRegimen", "invoiceUsoCfdi",
    ];
    if (fiscalManualFields.includes(name) && formData.invoiceProfileUuid) {
      setFormData((p) => ({ ...p, invoiceProfileUuid: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    const msg = validateField(name, type === "checkbox" ? checked : value);
    setErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const clearConstancia = () =>
    setFormData((p) => ({
      ...p,
      invoiceConstanciaName: "",
      invoiceConstanciaMime: "",
      invoiceConstanciaB64: "",
    }));

  const onNext = () => {
    // Paso 1 game server → solo validar egg seleccionado
    if (step === 1 && isGameServer) {
      if (!formData.selectedEggId) {
        setErrors(prev => ({ ...prev, selectedEggId: "Debes seleccionar un juego" }));
        setTouched(prev => ({ ...prev, selectedEggId: true }));
        return;
      }
      setStep(2);
      return;
    }

    // Paso 1 no-game (o paso 2 game) → validar campos de servicio/contacto
    if (validateStep1()) {
      setStep(prev => prev + 1);
    }
  };
  const onBack = () => setStep(prev => prev - 1);

  const handlePaymentSuccess = (result) => {
    navigate("/client/checkout/success", {
      state: {
        plan,
        category,
        billingCycle,
        total: totals.total,
        serviceName: formData.serviceName,
        paymentIntent: result.paymentIntent,
        service: result.service,
      },
    });
  };
  const handlePaymentError = (error) => {
    console.error("Payment error:", error);
    alert(`Error en el pago: ${error}`);
  };

  if (!plan) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] dark:from-[#0b0f14] dark:to-[#111827]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-white/10 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate("/client/contract-service")}
              className="mt-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-[#101820] dark:hover:bg-white/10"
              aria-label="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Finalizar contratación</p>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
                {plan?.name && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                    {plan.name}
                  </span>
                )}
                {billingCycle && billingCycles[billingCycle] && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-white/10 dark:text-slate-300 dark:ring-white/10">
                    {billingCycles[billingCycle].name}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Paso {step} de {isGameServer ? 3 : 2}. Completa los datos necesarios y confirma tu pago.
              </p>
            </div>
          </div>

          {/* Stepper */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-x-auto rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-white/10 dark:bg-[#101820]"
          >
            <Stepper step={step} showInvoice={formData.requireInvoice} />
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Main */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#101820] lg:p-7"
            >
            {step === 1 && isGameServer ? (
              <div className="space-y-8">
                <GameSelector
                  gameNests={gameNests}
                  selectedEggId={formData.selectedEggId}
                  onSelectEgg={(eggId: any) => {
                    setFormData((p: any) => ({ ...p, selectedEggId: eggId }));
                    if ((touched as any).selectedEggId) {
                      const msg = validateField("selectedEggId", eggId);
                      setErrors((prev: any) => ({ ...prev, selectedEggId: msg }));
                    }
                  }}
                  isLoading={gameEggsLoading}
                  error={gameNests.length === 0 && !gameEggsLoading ? "No hay juegos disponibles para este plan" : null}
                />
                {(touched as any).selectedEggId && (errors as any).selectedEggId && (
                  <p className="text-sm text-red-500 font-medium">{(errors as any).selectedEggId}</p>
                )}
              </div>
            ) : step === (isGameServer ? 2 : 1) ? (
              <div className="space-y-8">
                <ServiceFields
                  formData={formData}
                  errors={errors}
                  touched={touched}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  category={category}
                />
                <Addons
                  addons={addons}
                  selectedAddOns={selectedAddOns}
                  onChange={(ids) => setSelectedAddOns(ids)}
                />
                <InvoiceFields
                  formData={formData}
                  errors={errors}
                  touched={touched}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  clearConstancia={clearConstancia}
                />
              </div>
            ) : (
              <ReviewAndPay
                plan={plan}
                billingCycle={billingCycle}
                billingCycles={billingCycles}
                formData={formData}
                totals={totals}
                payRef={payRef}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                paymentMethods={paymentMethods}
                selectedPaymentMethodId={selectedPaymentMethodId}
                setSelectedPaymentMethodId={setSelectedPaymentMethodId}
                onAddMethod={() => setShowAddMethodModal(true)}
                selectedAddOns={selectedAddOns as any}
              />
            )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <OrderSummary
                plan={plan}
                billingCycle={billingCycle}
                billingCycles={billingCycles}
                formData={formData}
                setFormData={setFormData}
                totals={totals}
                step={step}
                onNext={onNext}
                onBack={onBack}
                payRef={payRef}
                selectedAddOns={selectedAddOns}
                addons={addons}
                isGameServer={isGameServer}
              />
            </motion.div>
          </div>
        </div>

        {/* Payment Method Modal: allow user to add a new card */}
        {showAddMethodModal && (
          <AddPaymentMethodModal
            isOpen={showAddMethodModal}
            onClose={() => setShowAddMethodModal(false)}
            onSuccess={(pm) => {
              queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
              setSelectedPaymentMethodId(pm.stripe_payment_method_id);
            }}
            isDefault={paymentMethods.length === 0}
          />
        )}
      </div>
    </div>
  );
}
