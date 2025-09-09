// StripeCheckout.jsx - VERSIÓN COMPLETA Y CORREGIDA

import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { paymentService } from "../services/paymentService";
import { servicesService } from "../services/serviceService";

// Initialize Stripe (Sin cambios, esto está perfecto)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// --- Componente Interno del Formulario ---
const CheckoutForm = ({
  amount,
  currency = "mxn",
  serviceData,
  onSuccess,
  onError,
  processing,
  setProcessing,
  paymentMethodId, // ID de una tarjeta ya guardada. Si está presente, cambia el flujo.
  addOns = [],
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState("");

  // La función para construir la factura está bien, no se necesita cambiar.
  const buildInvoice = () => {
    if (!serviceData?.requireInvoice) return null;
    const inv = serviceData.invoice || {};
    const get = (k, fb = "") =>
      inv[k] ?? serviceData[`invoice${k[0].toUpperCase()}${k.slice(1)}`] ?? fb;
    const constancia =
      inv.constancia ||
      (serviceData.invoiceConstanciaB64
        ? {
            filename: serviceData.invoiceConstanciaName,
            mime: serviceData.invoiceConstanciaMime,
            content_b64: serviceData.invoiceConstanciaB64,
          }
        : null);
    return {
      rfc: get("rfc"),
      name: get("name"),
      zip: get("zip"),
      regimen: get("regimen"),
      uso_cfdi: get("usoCfdi") || get("uso_cfdi") || "G03",
      constancia,
    };
  };

  // --- MEJORA 1: useEffect ahora es más inteligente ---
  // Solo crea un "intent" (PaymentIntent o SetupIntent) si el usuario va a introducir una NUEVA tarjeta.
  useEffect(() => {
    // Si se está usando una tarjeta guardada (paymentMethodId tiene un valor), no hacemos nada aquí.
    // El backend se encargará de todo el proceso de cobro.
    if (paymentMethodId) {
      setClientSecret(""); // Limpiamos cualquier client secret anterior para evitar confusiones.
      console.log("Modo de pago: Usando tarjeta guardada. No se crea intent en el frontend.");
      return;
    }

    // Si no hay una tarjeta guardada seleccionada, entonces sí necesitamos un intent para el formulario.
    const createIntentForNewCard = async () => {
      try {
        console.log("Modo de pago: Nueva tarjeta. Solicitando client_secret al backend...");
        const response = await paymentService.createPaymentIntent({
          amount,
          currency,
          service_id: serviceData?.service_id,
          description: `Payment for ${serviceData?.serviceName || "service"}`,
          // Es crucial enviar si se creará una suscripción, para que el backend decida
          // si devuelve un PaymentIntent (para cobro único) o un SetupIntent (para guardar tarjeta).
          create_subscription: !!serviceData.autoRenew,
        });

        console.log("Respuesta del backend (createIntent):", response);

        if (response?.success) {
          setClientSecret(response.data.client_secret);
        } else {
          onError?.(response?.message || "Error creando el intento de pago");
        }
      } catch (error) {
        console.error("Error crítico al crear el intento de pago:", error);
        onError?.("Error al configurar el pago");
      }
    };

    // Solo ejecutar si hay datos suficientes y no se está usando una tarjeta guardada.
    if (amount && serviceData && !paymentMethodId) {
      createIntentForNewCard();
    }
  }, [amount, currency, serviceData, paymentMethodId]); // `paymentMethodId` es ahora una dependencia clave.

  // --- MEJORA 2: handleSubmit ahora maneja los 3 escenarios de pago ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe) {
      // No hacer nada si Stripe no ha cargado.
      return;
    }

    setProcessing(true);

    try {
      // --- ESCENARIO A: Usar una tarjeta ya guardada ---
      if (paymentMethodId) {
        console.log("Procesando pago con tarjeta guardada:", paymentMethodId);
        // No necesitamos confirmar nada en el frontend. Le pasamos toda la responsabilidad al backend.
        // El backend se encargará de crear el PaymentIntent y confirmarlo en un solo paso (pago "off-session").
        const contractResponse = await servicesService.contractService({
          plan_id: serviceData.plan_id,
          billing_cycle: serviceData.billingCycle,
          domain: serviceData.domain,
          service_name: serviceData.serviceName,
          payment_method_id: paymentMethodId, // La clave es enviar el ID de la tarjeta.
          add_ons: addOns,
          additional_options: { auto_renew: !!serviceData.autoRenew },
          invoice: buildInvoice(),
          create_subscription: !!serviceData.autoRenew,
          amount: amount, // Importante: envía el monto para que el backend sepa cuánto cobrar.
          currency: currency,
        });

        if (contractResponse?.success) {
          onSuccess?.({ service: contractResponse.data });
        } else {
          // Si el backend falla (ej. tarjeta rechazada), mostramos su mensaje de error.
          throw new Error(contractResponse?.message || "El pago con la tarjeta guardada falló.");
        }
      }
      // --- ESCENARIO B: Usar una nueva tarjeta (requiere un clientSecret) ---
      else {
        if (!clientSecret || !elements) {
          onError?.("El formulario de pago no está listo, por favor espere un momento.");
          setProcessing(false);
          return;
        }

        const isSetupIntent = clientSecret.startsWith('seti_');
        let result;
        let finalPaymentMethodId;

        if (isSetupIntent) {
          // Sub-escenario: Guardar nueva tarjeta para una suscripción.
          console.log("Confirmando SetupIntent (guardar nueva tarjeta)...");
          result = await stripe.confirmCardSetup(clientSecret, {
            payment_method: {
              card: elements.getElement(CardElement),
              billing_details: {
                name: `${serviceData.firstName || ""} ${serviceData.lastName || ""}`.trim(),
                email: serviceData.email,
                phone: serviceData.phone,
              },
            },
          });
          if (result.error) throw result.error;
          finalPaymentMethodId = result.setupIntent.payment_method;
        } else {
          // Sub-escenario: Cobro único con una nueva tarjeta.
          console.log("Confirmando PaymentIntent (cobro único)...");
          result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: elements.getElement(CardElement),
              billing_details: {
                name: `${serviceData.firstName || ""} ${serviceData.lastName || ""}`.trim(),
                email: serviceData.email,
                phone: serviceData.phone,
              },
            },
          });
          if (result.error) throw result.error;
          if (result.paymentIntent?.status !== "succeeded") throw new Error("El pago no fue exitoso.");
          finalPaymentMethodId = result.paymentIntent.payment_method;
        }

        // Llamada unificada al backend DESPUÉS de confirmar la nueva tarjeta en el frontend.
        const contractResponse = await servicesService.contractService({
          plan_id: serviceData.plan_id,
          billing_cycle: serviceData.billingCycle,
          domain: serviceData.domain,
          service_name: serviceData.serviceName,
          payment_intent_id: result.paymentIntent?.id, // Será undefined en el flujo de SetupIntent, y eso está bien.
          payment_method_id: finalPaymentMethodId,
          add_ons: addOns,
          additional_options: { auto_renew: !!serviceData.autoRenew },
          invoice: buildInvoice(),
          create_subscription: !!serviceData.autoRenew,
        });

        if (contractResponse?.success) {
          onSuccess?.({ paymentIntent: result.paymentIntent, setupIntent: result.setupIntent, service: contractResponse.data });
        } else {
          throw new Error(contractResponse?.message || "La creación del servicio falló después del pago.");
        }
      }
    } catch (error) {
      console.error("Error en el proceso de pago:", error);
      onError?.(error.message || "El procesamiento del pago falló.");
    } finally {
      setProcessing(false);
    }
  };

  // Opciones del CardElement (sin cambios)
  const cardElementOptions = {
    style: {
      base: { fontSize: "16px", color: "#424770", "::placeholder": { color: "#aab7c4" } },
      invalid: { color: "#9e2146" },
    },
    hidePostalCode: true,
  };

  // --- MEJORA 3: La condición `disabled` del botón ahora es más robusta ---
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* El formulario de tarjeta solo se muestra si NO se está usando una tarjeta guardada */}
      {!paymentMethodId && (
        <div className="p-4 border border-black/10 dark:border-white/10 rounded-xl bg-white dark:bg-[#12151c]">
          <label className="block text-sm font-medium text-foreground mb-3">
            Información de la Tarjeta
          </label>
          <CardElement options={cardElementOptions} className="p-3" />
        </div>
      )}

      {/* Aviso de pago seguro (sin cambios) */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/15">
        <div className="w-5 h-5 rounded-full bg-emerald-600 dark:bg-emerald-400 flex items-center justify-center mt-0.5">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h4 className="font-medium text-foreground">Pago Seguro con Stripe</h4>
          <p className="text-muted-foreground text-sm">Tu información está protegida con encriptación SSL de 256 bits.</p>
        </div>
      </div>

      {/* Botón de Pago */}
      <button
        type="submit"
        disabled={!stripe || processing || (!paymentMethodId && !clientSecret)}
        className="w-full rounded-xl px-5 py-3 bg-foreground text-background font-semibold hover:opacity-90 transition disabled:opacity-60"
      >
        {processing ? (
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-background border-t-transparent animate-spin" />
            Procesando Pago...
          </span>
        ) : (
          `Pagar $${Number(amount || 0).toFixed(2)}`
        )}
      </button>
    </form>
  );
};

const StripeCheckout = ({
  amount,
  currency,
  serviceData,
  onSuccess,
  onError,
  paymentMethodId,
  addOns,
}) => {
  const [processing, setProcessing] = useState(false);

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        amount={amount}
        currency={currency}
        serviceData={serviceData}
        onSuccess={onSuccess}
        onError={onError}
        processing={processing}
        setProcessing={setProcessing}
        paymentMethodId={paymentMethodId}
        addOns={addOns}
      />
    </Elements>
  );
};

export default StripeCheckout;