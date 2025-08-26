import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, Lock, Check, ArrowLeft, Shield, Zap, Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import StripeCheckout from "../../components/StripeCheckout";
import apiService from "../../services/api";
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
  
  // Dynamic data states
  const [billingCycles, setBillingCycles] = useState({});
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  // Load billing cycles data
  useEffect(() => {
    const loadBillingCycles = async () => {
      try {
        setLoading(true);
        const response = await apiService.getBillingCycles();
        
        if (response.success) {
          // Transform to match existing structure
          const cyclesMap = {};
          response.data.forEach(cycle => {
            cyclesMap[cycle.slug] = {
              name: cycle.name,
              discount: cycle.discount_percentage || 0,
            };
          });
          setBillingCycles(cyclesMap);
        }
      } catch (err) {
        console.error('Error loading billing cycles:', err);
        setDataError('Error al cargar los ciclos de facturación');
        // Fallback to static data
        setBillingCycles({
          monthly: { name: "Mensual", discount: 0 },
          quarterly: { name: "Trimestral", discount: 10 },
          annually: { name: "Anual", discount: 20 },
        });
      } finally {
        setLoading(false);
      }
    };

    loadBillingCycles();
  }, []);

  useEffect(() => {
    if (!plan) navigate("/client/contract-service");
  }, [plan, navigate]);

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

  const calculatePrice = (basePrice, cycle) => {
    const discount = billingCycles[cycle]?.discount || 0;
    return basePrice * (1 - discount / 100);
  };

  const calculateTotal = () => {
    if (!plan || !billingCycle) return 0;
    
    const basePrice = plan.price?.[billingCycle] || 0;
    let total = calculatePrice(basePrice, billingCycle);
    
    if (formData.backupService) total += 4.99;
    if (formData.prioritySupport) total += 9.99;
    
    return total;
  };

  const calculateSavings = () => {
    if (!plan || !billingCycle) return 0;
    
    const basePrice = plan.price?.[billingCycle] || 0;
    const discount = billingCycles[billingCycle]?.discount || 0;
    return (basePrice * discount) / 100;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;

    if (name === "cardNumber") processedValue = formatCardNumber(value);
    if (name === "expiryDate") processedValue = formatExpiry(value);
    if (name === "cvv") processedValue = onlyDigits(value).slice(0, 4);
    if (name === "zipCode") processedValue = onlyDigits(value).slice(0, 10);

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : processedValue,
    }));

    if (touched[name]) validateField(name, processedValue);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "firstName":
      case "lastName":
        if (!value.trim()) error = "Este campo es requerido";
        break;
      case "email":
        if (!value.trim()) error = "El email es requerido";
        else if (!emailRx.test(value)) error = "Email inválido";
        break;
      case "phone":
        if (!value.trim()) error = "El teléfono es requerido";
        else if (!phoneRx.test(value)) error = "Teléfono inválido";
        break;
      case "serviceName":
        if (!value.trim()) error = "El nombre del servicio es requerido";
        break;
      case "domain":
        if (value && !domainRx.test(value)) error = "Dominio inválido";
        break;
      case "cardNumber":
        if (!value.trim()) error = "El número de tarjeta es requerido";
        else if (!luhnValid(onlyDigits(value))) error = "Número de tarjeta inválido";
        break;
      case "expiryDate":
        if (!value.trim()) error = "La fecha de expiración es requerida";
        else if (!expiryValid(value)) error = "Fecha de expiración inválida";
        break;
      case "cvv":
        if (!value.trim()) error = "El CVV es requerido";
        else if (!cvvRx.test(value)) error = "CVV inválido";
        break;
      case "cardName":
        if (!value.trim()) error = "El nombre en la tarjeta es requerido";
        break;
      case "address":
        if (!value.trim()) error = "La dirección es requerida";
        break;
      case "city":
        if (!value.trim()) error = "La ciudad es requerida";
        break;
      case "state":
        if (!value.trim()) error = "El estado es requerido";
        break;
      case "zipCode":
        if (!value.trim()) error = "El código postal es requerido";
        else if (!zipRx.test(value)) error = "Código postal inválido";
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateStep = (stepNumber) => {
    const fieldsToValidate = {
      1: ["firstName", "lastName", "email", "phone", "serviceName"],
      2: ["cardNumber", "expiryDate", "cvv", "cardName", "address", "city", "state", "zipCode"],
    };

    const fields = fieldsToValidate[stepNumber] || [];
    let isValid = true;

    fields.forEach(field => {
      const fieldIsValid = validateField(field, formData[field]);
      if (!fieldIsValid) isValid = false;
      setTouched(prev => ({ ...prev, [field]: true }));
    });

    return isValid;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(2)) return;

    setProcessing(true);
    
    try {
      // Here you would typically process the payment
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to success page or dashboard
      navigate("/client/dashboard", {
        state: { 
          message: "¡Servicio contratado exitosamente!",
          service: {
            name: formData.serviceName,
            plan: plan.name,
            billingCycle: billingCycles[billingCycle]?.name,
            total: calculateTotal(),
          }
        }
      });
    } catch (error) {
      console.error('Payment processing error:', error);
      setErrors(prev => ({ 
        ...prev, 
        submit: "Error al procesar el pago. Por favor, intenta de nuevo." 
      }));
    } finally {
      setProcessing(false);
    }
  };

  // Show loading state while fetching billing cycles
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando información de checkout...</span>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No se encontró información del plan seleccionado.</p>
          <button 
            onClick={() => navigate("/client/contract-service")} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Volver a Servicios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <button
            onClick={() => navigate("/client/contract-service")}
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a servicios
          </button>
          <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
          <p className="text-muted-foreground">
            Completa tu información para contratar el servicio
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center space-x-8">
            <StepDot done={step > 1} current={step === 1}>1</StepDot>
            <div className={`h-px w-16 ${step > 1 ? 'bg-primary' : 'bg-border'}`} />
            <StepDot done={step > 2} current={step === 2}>2</StepDot>
            <div className={`h-px w-16 ${step > 2 ? 'bg-primary' : 'bg-border'}`} />
            <StepDot done={step > 3} current={step === 3}>3</StepDot>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-lg border p-6"
              >
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Service Information */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-foreground mb-4">
                        Información del Servicio
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Nombre *
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                              errors.firstName ? 'border-red-500' : 'border-border'
                            }`}
                            placeholder="Tu nombre"
                          />
                          {errors.firstName && (
                            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Apellido *
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                              errors.lastName ? 'border-red-500' : 'border-border'
                            }`}
                            placeholder="Tu apellido"
                          />
                          {errors.lastName && (
                            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                            errors.email ? 'border-red-500' : 'border-border'
                          }`}
                          placeholder="tu@email.com"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Teléfono *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                            errors.phone ? 'border-red-500' : 'border-border'
                          }`}
                          placeholder="+1 (555) 123-4567"
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Nombre del Servicio *
                        </label>
                        <input
                          type="text"
                          name="serviceName"
                          value={formData.serviceName}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                            errors.serviceName ? 'border-red-500' : 'border-border'
                          }`}
                          placeholder="Mi sitio web"
                        />
                        {errors.serviceName && (
                          <p className="text-red-500 text-sm mt-1">{errors.serviceName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Dominio (opcional)
                        </label>
                        <input
                          type="text"
                          name="domain"
                          value={formData.domain}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                            errors.domain ? 'border-red-500' : 'border-border'
                          }`}
                          placeholder="ejemplo.com"
                        />
                        {errors.domain && (
                          <p className="text-red-500 text-sm mt-1">{errors.domain}</p>
                        )}
                      </div>

                      {/* Additional Services */}
                      <div>
                        <h3 className="text-lg font-medium text-foreground mb-4">
                          Servicios Adicionales
                        </h3>
                        <div className="space-y-4">
                          {additionalServices.map((service) => {
                            const Icon = service.icon;
                            return (
                              <div
                                key={service.id}
                                className="flex items-center justify-between p-4 border rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <Icon className="h-5 w-5 text-primary" />
                                  <div>
                                    <h4 className="font-medium text-foreground">
                                      {service.name}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {service.description}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className="font-medium text-foreground">
                                    ${service.price}/mes
                                  </span>
                                  <input
                                    type="checkbox"
                                    name={service.field}
                                    checked={formData[service.field]}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-primary"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleNext}
                          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                          Continuar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Payment Information */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-foreground mb-4">
                        Información de Pago
                      </h2>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Número de Tarjeta *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`w-full px-3 py-2 pl-10 border rounded-md bg-background text-foreground ${
                              errors.cardNumber ? 'border-red-500' : 'border-border'
                            }`}
                            placeholder="1234 5678 9012 3456"
                          />
                          <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                        {errors.cardNumber && (
                          <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Fecha de Expiración *
                          </label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                              errors.expiryDate ? 'border-red-500' : 'border-border'
                            }`}
                            placeholder="MM/YY"
                          />
                          {errors.expiryDate && (
                            <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            CVV *
                          </label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                              errors.cvv ? 'border-red-500' : 'border-border'
                            }`}
                            placeholder="123"
                          />
                          {errors.cvv && (
                            <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Nombre en la Tarjeta *
                        </label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                            errors.cardName ? 'border-red-500' : 'border-border'
                          }`}
                          placeholder="Nombre como aparece en la tarjeta"
                        />
                        {errors.cardName && (
                          <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Dirección *
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                            errors.address ? 'border-red-500' : 'border-border'
                          }`}
                          placeholder="123 Main St"
                        />
                        {errors.address && (
                          <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Ciudad *
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                              errors.city ? 'border-red-500' : 'border-border'
                            }`}
                            placeholder="Ciudad"
                          />
                          {errors.city && (
                            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Estado *
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                              errors.state ? 'border-red-500' : 'border-border'
                            }`}
                            placeholder="Estado"
                          />
                          {errors.state && (
                            <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Código Postal *
                          </label>
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                              errors.zipCode ? 'border-red-500' : 'border-border'
                            }`}
                            placeholder="12345"
                          />
                          {errors.zipCode && (
                            <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="autoRenew"
                          checked={formData.autoRenew}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-primary"
                        />
                        <label className="text-sm text-foreground">
                          Renovación automática
                        </label>
                      </div>

                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="px-6 py-2 border border-border text-foreground rounded-md hover:bg-muted"
                        >
                          Atrás
                        </button>
                        <button
                          type="button"
                          onClick={handleNext}
                          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                          Revisar Pedido
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Confirmation */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-foreground mb-4">
                        Confirmar Pedido
                      </h2>

                      <div className="bg-muted/50 rounded-lg p-4">
                        <h3 className="font-medium text-foreground mb-2">
                          Resumen del Servicio
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Servicio:</span>
                            <span>{formData.serviceName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Plan:</span>
                            <span>{plan.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ciclo de facturación:</span>
                            <span className="text-foreground">{billingCycles[billingCycle]?.name}</span>
                          </div>
                          {billingCycles[billingCycle]?.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Descuento ({billingCycles[billingCycle].discount}%)</span>
                              <span>
                                -${((plan.price[billingCycle] * billingCycles[billingCycle].discount) / 100).toFixed(2)}
                              </span>
                            </div>
                          )}
                          {formData.backupService && (
                            <div className="flex justify-between">
                              <span>Backup Premium</span>
                              <span>$4.99</span>
                            </div>
                          )}
                          {formData.prioritySupport && (
                            <div className="flex justify-between">
                              <span>Soporte Prioritario</span>
                              <span>$9.99</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        <span>Tu información está protegida con encriptación SSL</span>
                      </div>

                      {errors.submit && (
                        <div className="text-red-500 text-sm">{errors.submit}</div>
                      )}

                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="px-6 py-2 border border-border text-foreground rounded-md hover:bg-muted"
                        >
                          Atrás
                        </button>
                        <button
                          type="submit"
                          disabled={processing}
                          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center space-x-2"
                        >
                          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                          <span>
                            {processing ? "Procesando..." : `Pagar $${calculateTotal().toFixed(2)}`}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-lg border p-6 sticky top-8"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Resumen del Pedido
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="font-medium text-foreground">{plan.name}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Precio base:</span>
                    <span className="text-foreground">
                      ${plan.price?.[billingCycle]?.toFixed(2) || '0.00'}
                    </span>
                  </div>

                  {billingCycles[billingCycle]?.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento ({billingCycles[billingCycle].discount}%)</span>
                      <span>-${calculateSavings().toFixed(2)}</span>
                    </div>
                  )}

                  {formData.backupService && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Backup Premium</span>
                      <span className="text-foreground">$4.99</span>
                    </div>
                  )}

                  {formData.prioritySupport && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Soporte Prioritario</span>
                      <span className="text-foreground">$9.99</span>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-foreground">Total:</span>
                      <span className="text-foreground">${calculateTotal().toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Facturado {billingCycles[billingCycle]?.name?.toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Garantía de devolución de 30 días</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

