import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@application/context/AuthContext";
import { emailRx, phoneRx, domainRx } from "@shared/utils/validation";
import { rfcMxRx, toBase64 } from "@shared/utils/cfdi";
import { toast } from "@presentation/components/features/ToastProvider";

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
      toast.error("Por favor, revisa los errores en el formulario");
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
      toast.success("Constancia cargada correctamente");
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

  const clearConstancia = () => {
    setFormData((p) => ({
      ...p,
      invoiceConstanciaName: "",
      invoiceConstanciaMime: "",
      invoiceConstanciaB64: "",
    }));
    toast.info("Constancia eliminada");
  };

  const onNext = () => {
    // Paso 1 game server → solo validar egg seleccionado
    if (step === 1 && isGameServer) {
      if (!formData.selectedEggId) {
        setErrors(prev => ({ ...prev, selectedEggId: "Debes seleccionar un juego" }));
        setTouched(prev => ({ ...prev, selectedEggId: true }));
        toast.warning("Debes seleccionar un juego para continuar");
        return;
      }
      setStep(2);
      return;
    }

    // Paso 1 no-game (o paso 2 game) → validar campos de servicio
    const isInfoStep = (!isGameServer && step === 1) || (isGameServer && step === 2);
    if (isInfoStep) {
      if (validateStep1()) {
        setStep(step + 1);
      }
      return;
    }

    setStep(step + 1);
  };

  const onBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate(-1);
  };

  const handleSuccess = (res: any) => {
    console.log("Checkout success:", res);
    queryClient.invalidateQueries({ queryKey: ["services"] });
    toast.success("¡Servicio contratado con éxito!", "Estamos configurando tu instancia.");
    navigate("/client/services", { replace: true });
  };

  const handleError = (msg: string) => {
    console.error("Checkout error:", msg);
    toast.error("Error al procesar el pago", msg);
  };

  const handleAddMethodSuccess = () => {
    setShowAddMethodModal(false);
    queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    toast.success("Método de pago agregado correctamente");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f14]">
      {/* Header / Stepper */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#101820]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver</span>
          </button>

          <div className="flex-1 flex justify-center overflow-x-auto no-scrollbar">
            <Stepper step={step} showInvoice={formData.requireInvoice} />
          </div>

          <div className="w-20 hidden sm:block" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 items-start">
          {/* Left Column: Forms */}
          <div className="space-y-8">
            {/* Step 1: Game Selection (Only for Game Servers) */}
            {step === 1 && isGameServer && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <GameSelector
                  gameNests={gameNests}
                  selectedEggId={formData.selectedEggId}
                  onSelect={(id) => {
                    setFormData(p => ({ ...p, selectedEggId: id }));
                    setErrors(prev => ({ ...prev, selectedEggId: "" }));
                  }}
                  loading={gameEggsLoading}
                  error={errors["selectedEggId"]}
                />
              </motion.div>
            )}

            {/* Step 1 (Non-Game) or Step 2 (Game): Service Info */}
            {((!isGameServer && step === 1) || (isGameServer && step === 2)) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
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
                  onToggle={(id) => {
                    setSelectedAddOns(prev =>
                      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                    );
                    const add = addons.find(a => a.id === id || a.uuid === id);
                    if (selectedAddOns.includes(id)) {
                      toast.info(`Removido: ${add?.name || 'Addon'}`);
                    } else {
                      toast.success(`Agregado: ${add?.name || 'Addon'}`);
                    }
                  }}
                />

                <InvoiceFields
                  formData={formData}
                  errors={errors}
                  touched={touched}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  onClearConstancia={clearConstancia}
                  onProfileSelect={(profile) => {
                    setFormData(p => ({
                      ...p,
                      invoiceProfileUuid: profile.uuid,
                      invoicePersonType: profile.person_type,
                      invoiceRfc: profile.rfc,
                      invoiceName: profile.name,
                      invoiceZip: profile.zip,
                      invoiceRegimen: profile.regimen,
                      invoiceUsoCfdi: profile.uso_cfdi,
                      invoiceConstanciaName: profile.constancia_name || "",
                    }));
                    toast.success("Perfil fiscal aplicado");
                  }}
                />
              </motion.div>
            )}

            {/* Final Step: Review & Pay */}
            {((!isGameServer && step === 2) || (isGameServer && step === 3)) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <ReviewAndPay
                  plan={plan}
                  billingCycle={billingCycle}
                  billingCycles={billingCycles}
                  formData={formData}
                  totals={totals}
                  payRef={payRef}
                  onSuccess={handleSuccess}
                  onError={handleError}
                  paymentMethods={paymentMethods}
                  selectedPaymentMethodId={selectedPaymentMethodId}
                  setSelectedPaymentMethodId={setSelectedPaymentMethodId}
                  onAddMethod={() => setShowAddMethodModal(true)}
                  selectedAddOns={selectedAddOns}
                />
              </motion.div>
            )}

            {/* Navigation Buttons (Only if not on last step) */}
            {step < (isGameServer ? 3 : 2) && (
              <div className="flex justify-end pt-4">
                <button
                  onClick={onNext}
                  className="px-8 py-4 bg-foreground text-background rounded-2xl font-bold hover:opacity-90 transition shadow-lg shadow-foreground/10"
                >
                  Continuar al siguiente paso
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Summary */}
          <aside className="sticky top-32">
            <OrderSummary
              plan={plan}
              billingCycle={billingCycle}
              billingCycles={billingCycles}
              formData={formData}
              totals={totals}
              addons={addons}
              selectedAddOns={selectedAddOns}
              onNext={onNext}
              showButton={step < (isGameServer ? 3 : 2)}
            />
          </aside>
        </div>
      </main>

      <AddPaymentMethodModal
        isOpen={showAddMethodModal}
        onClose={() => setShowAddMethodModal(false)}
        onSuccess={handleAddMethodSuccess}
      />
    </div>
  );
}
