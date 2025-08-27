import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { 
  CreditCard, 
  X, 
  AlertCircle, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import invoicesService from '../../services/invoices';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: false,
};

const PaymentMethodForm = ({ onSuccess, onCancel, isDefault = false }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [makeDefault, setMakeDefault] = useState(isDefault);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create setup intent
      const setupIntentResponse = await invoicesService.createSetupIntent();
      
      if (!setupIntentResponse.success) {
        throw new Error(setupIntentResponse.message || 'Error creating setup intent');
      }

      const { client_secret } = setupIntentResponse.data;

      // Confirm setup intent with card
      const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(
        client_secret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: name || 'Cardholder',
            },
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Save payment method to backend
      const saveResponse = await invoicesService.addPaymentMethod({
        stripe_payment_method_id: setupIntent.payment_method,
        name: name || undefined,
        is_default: makeDefault
      });

      if (saveResponse.success) {
        onSuccess(saveResponse.data);
      } else {
        throw new Error(saveResponse.message || 'Error saving payment method');
      }

    } catch (err) {
      console.error('Error adding payment method:', err);
      setError(err.message || 'Error al agregar método de pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Nombre del método de pago (opcional)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Mi tarjeta principal"
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Información de la tarjeta
        </label>
        <div className="p-3 border border-border rounded-lg bg-background">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="makeDefault"
          checked={makeDefault}
          onChange={(e) => setMakeDefault(e.target.checked)}
          className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
        />
        <label htmlFor="makeDefault" className="ml-2 text-sm text-foreground">
          Establecer como método de pago predeterminado
        </label>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
        </motion.div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 border border-border text-foreground hover:bg-accent font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              Agregar Método
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const AddPaymentMethodModal = ({ isOpen, onClose, onSuccess, isDefault = false }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  Agregar Método de Pago
                </h3>
                <p className="text-sm text-muted-foreground">
                  Agrega una tarjeta de forma segura
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <Elements stripe={stripePromise}>
            <PaymentMethodForm
              onSuccess={(paymentMethod) => {
                onSuccess(paymentMethod);
                onClose();
              }}
              onCancel={onClose}
              isDefault={isDefault}
            />
          </Elements>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-600 dark:text-blue-400">
                <p className="font-medium mb-1">Información segura</p>
                <p className="text-xs">
                  Tu información de tarjeta está protegida por Stripe y nunca se almacena en nuestros servidores.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddPaymentMethodModal;

