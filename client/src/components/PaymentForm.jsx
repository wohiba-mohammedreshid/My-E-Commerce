/**
 * Payment form — Stripe Elements when configured, demo mode otherwise.
 *
 * In demo mode, clicking "Place Order" simulates a successful payment
 * without charging a real card. Great for learning without Stripe setup.
 */
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentApi } from '../services/api';
import { formatPrice } from '../utils/format';

/** Inner form that uses Stripe hooks (only rendered when Stripe is loaded) */
function StripeCheckoutForm({ amount, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      onError(error.message);
      setProcessing(false);
    } else {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        type="submit"
        className="btn btn-primary btn-block"
        style={{ marginTop: '1rem' }}
        disabled={!stripe || processing}
      >
        {processing ? 'Processing...' : `Pay ${formatPrice(amount)}`}
      </button>
    </form>
  );
}

/** Demo payment button — no real charge */
function DemoPaymentForm({ amount, onSuccess }) {
  const [processing, setProcessing] = useState(false);

  const handleDemoPay = () => {
    setProcessing(true);
    setTimeout(() => {
      onSuccess(`demo_payment_${Date.now()}`);
      setProcessing(false);
    }, 1000);
  };

  return (
    <div>
      <div className="payment-demo-notice">
        <strong>Demo Mode:</strong> No real payment will be processed.
        Click below to simulate a successful checkout.
      </div>
      <button
        className="btn btn-primary btn-block"
        onClick={handleDemoPay}
        disabled={processing}
      >
        {processing ? 'Processing...' : `Place Order — ${formatPrice(amount)}`}
      </button>
    </div>
  );
}

/** Main export — decides between Stripe and demo mode */
export default function PaymentForm({ amount, onSuccess, onError }) {
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [demoMode, setDemoMode] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentApi
      .getConfig()
      .then(async (config) => {
        if (config.demo || !config.publishableKey) {
          setDemoMode(true);
        } else {
          setDemoMode(false);
          const stripe = await loadStripe(config.publishableKey);
          setStripePromise(stripe);

          const { clientSecret: secret } = await paymentApi.createIntent(amount);
          setClientSecret(secret);
        }
      })
      .catch((err) => onError(err.message))
      .finally(() => setLoading(false));
  }, [amount, onError]);

  if (loading) return <p>Loading payment...</p>;

  if (demoMode) {
    return <DemoPaymentForm amount={amount} onSuccess={onSuccess} />;
  }

  if (!clientSecret || !stripePromise) {
    return <p className="form-error">Payment system unavailable.</p>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripeCheckoutForm amount={amount} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}
