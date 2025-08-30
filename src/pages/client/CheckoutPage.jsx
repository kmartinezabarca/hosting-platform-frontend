import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { emailRx, phoneRx, domainRx } from "../../lib/validation";
import { rfcMxRx, toBase64 } from "../../lib/cfdi";

import Stepper from "../../components/checkout/Stepper";
import ServiceFields from "../../components/checkout/ServiceFields";
import Addons from "../../components/checkout/Addons";
import InvoiceFields from "../../components/checkout/InvoiceFields";
import ReviewAndPay from "../../components/checkout/ReviewAndPay";
import OrderSummary from "../../components/checkout/OrderSummary";
import invoicesService from "../../services/invoices";
import servicesService from "../../services/services";
import AddPaymentMethodModal from "../../components/invoices/AddPaymentMethodModal";

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
    phone: "",
    serviceName: "",
    domain: "",
    autoRenew: true,
    requireInvoice: false,
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

  /**
   * addons: list of available add-ons for the selected plan fetched from API
   * selectedAddOns: ids of add-ons user chooses to include
   */
  const [addons, setAddons] = useState([]);
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  /**
   * paymentMethods: saved methods for the user
   * selectedPaymentMethodId: id of the method chosen for payment
   * showAddMethodModal: controls whether modal for adding new method is open
   */
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(null);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);

  useEffect(() => {
    if (!plan) navigate("/client/contract-service");
  }, [plan, navigate]);

  // fetch available add-ons and user's payment methods on mount
  useEffect(() => {
    if (!plan) return;
    // fetch add-ons for the plan by id/slug
    const fetchAddons = async () => {
      try {
        const res = await servicesService.getPlanAddOns(plan.id);
        if (res.success) {
          setAddons(res.data || []);
        }
      } catch (err) {
        console.error("Error fetching add-ons:", err);
      }
    };
    // fetch payment methods and pick default
    const fetchPaymentMethods = async () => {
      try {
        const res = await invoicesService.getPaymentMethods();
        if (res.success) {
          setPaymentMethods(res.data || []);
          const defaultPm = res.data?.find((m) => m.is_default);
          setSelectedPaymentMethodId(defaultPm ? defaultPm.stripe_payment_method_id : null);
        }
      } catch (err) {
        console.error("Error fetching payment methods:", err);
      }
    };
    fetchAddons();
    fetchPaymentMethods();
  }, [plan]);

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
    el?.focus?.({ preventScroll: true });
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
      setFormData((p) => ({
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
    if (step === 1 && validateStep1()) setStep(2);
  };
  const onBack = () => setStep(1);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-16 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => navigate("/client/contract-service")}
          className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
          <p className="text-muted-foreground">
            Finaliza tu contratación de servicio
          </p>
        </div>
      </motion.div>

      {/* Stepper */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Stepper step={step} showInvoice={formData.requireInvoice} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0f1115] p-8"
          >
            {step === 1 ? (
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold text-foreground">
                  Información del Servicio
                </h2>
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
                selectedAddOns={selectedAddOns}
              />
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
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
            // refresh payment methods after adding new one
            invoicesService.getPaymentMethods().then((res) => {
              if (res.success) {
                setPaymentMethods(res.data);
                setSelectedPaymentMethodId(pm.stripe_payment_method_id);
              }
            });
          }}
          isDefault={paymentMethods.length === 0}
        />
      )}
    </div>
  );
}
