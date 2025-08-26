import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { paymentService } from '../services/payments';
import { servicesService } from '../services/services';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51S0FlDJY7gjOIiThIYJFXVqfYCYwyZvewSW8mXtNOcKzpv4TCUoNNAIY7rHjB71YJuUC4DjzbQPnP23gv3qvUiRs00FQLerEgT');

const CheckoutForm = ({ 
  amount, 
  currency = 'usd', 
  serviceData, 
  onSuccess, 
  onError,
  processing,
  setProcessing 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await paymentService.createPaymentIntent({
          amount: amount,
          currency: currency,
          service_id: serviceData?.service_id,
          description: `Payment for ${serviceData?.serviceName || 'service'}`
        });

        if (response.success) {
          setClientSecret(response.data.client_secret);
        } else {
          onError(response.message || 'Error creating payment intent');
        }
      } catch (error) {
        console.error('Error creating payment intent:', error);
        onError('Error setting up payment');
      }
    };

    if (amount && serviceData) {
      createPaymentIntent();
    }
  }, [amount, currency, serviceData]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);

    const card = elements.getElement(CardElement);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card,
          billing_details: {
            name: `${serviceData.firstName} ${serviceData.lastName}`,
            email: serviceData.email,
            phone: serviceData.phone,
            address: {
              line1: serviceData.address,
              city: serviceData.city,
              state: serviceData.state,
              postal_code: serviceData.zipCode,
              country: serviceData.country || 'US'
            }
          }
        }
      });

      if (error) {
        console.error('Payment failed:', error);
        onError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Contract the service after successful payment
        try {
          const contractResponse = await servicesService.contractService({
            plan_id: serviceData.plan_id,
            billing_cycle: serviceData.billingCycle,
            domain: serviceData.domain,
            service_name: serviceData.serviceName,
            payment_intent_id: paymentIntent.id,
            additional_options: {
              backup_service: serviceData.backupService,
              priority_support: serviceData.prioritySupport,
              auto_renew: serviceData.autoRenew
            }
          });

          if (contractResponse.success) {
            onSuccess({
              paymentIntent,
              service: contractResponse.data
            });
          } else {
            onError('Payment successful but service setup failed. Please contact support.');
          }
        } catch (contractError) {
          console.error('Error contracting service:', contractError);
          onError('Payment successful but service setup failed. Please contact support.');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError('Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-black/10 dark:border-white/10 rounded-xl bg-white dark:bg-[#12151c]">
        <label className="block text-sm font-medium text-foreground mb-3">
          Información de la Tarjeta
        </label>
        <CardElement 
          options={cardElementOptions}
          className="p-3"
        />
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/15">
        <div className="w-5 h-5 rounded-full bg-emerald-600 dark:bg-emerald-400 flex items-center justify-center mt-0.5">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h4 className="font-medium text-foreground">Pago Seguro con Stripe</h4>
          <p className="text-muted-foreground text-sm">
            Tu información está protegida con encriptación SSL de 256 bits.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing || !clientSecret}
        className="w-full rounded-xl px-5 py-3 bg-foreground text-background font-semibold hover:opacity-90 transition disabled:opacity-60"
      >
        {processing ? (
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-background border-t-transparent animate-spin" />
            Procesando Pago...
          </span>
        ) : (
          `Pagar $${amount.toFixed(2)}`
        )}
      </button>
    </form>
  );
};

const StripeCheckout = ({ amount, currency, serviceData, onSuccess, onError }) => {
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
      />
    </Elements>
  );
};

export default StripeCheckout;

