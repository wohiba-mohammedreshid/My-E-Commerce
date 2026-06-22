/**
 * Checkout Page — shipping form, Stripe payment, and order confirmation.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { paymentApi, orderApi } from '../services/api';

// Stripe payment form (inner component needs Stripe hooks)
function PaymentForm({ shipping, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const { items, total, clearCart } = useCart();

  async function handleSubmit(e) {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      let paymentIntentId = 'demo_payment';

      if (stripe && elements) {
        const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: { return_url: window.location.origin + '/orders' },
          redirect: 'if_required',
        });

        if (stripeError) {
          setError(stripeError.message);
          setProcessing(false);
          return;
        }
        paymentIntentId = paymentIntent.id;
      }

      // Create the order on our server
      const order = await orderApi.create({
        items,
        shipping,
        paymentIntentId,
        total,
      });

      clearCart();
      onSuccess(order);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      {stripe && elements ? (
        <PaymentElement />
      ) : (
        <div className="demo-payment">
          <p>💳 <strong>Demo Mode</strong> — No real payment will be processed.</p>
          <p>Click "Place Order" to simulate a successful checkout.</p>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      <button
        type="submit"
        className="btn btn-primary btn-block btn-lg"
        disabled={processing || (stripe && !elements)}
      >
        {processing ? 'Processing...' : `Place Order — $${total.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function Checkout() {
  const { items, subtotal, shipping, total } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = shipping, 2 = payment
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');
  const [shippingData, setShippingData] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  useEffect(() => {
    async function initPayment() {
      try {
        const config = await paymentApi.getConfig();
        if (config.publishableKey) {
          setStripePromise(loadStripe(config.publishableKey));
        }
        const intent = await paymentApi.createIntent(total);
        setClientSecret(intent.clientSecret);
      } catch (error) {
        console.error('Payment initialization failed:', error);
        setError(error.message || 'Failed to initialize payment. Please try again.');
      }
    }
    if (step === 2) initPayment();
  }, [step, total]);

  function handleShippingSubmit(e) {
    e.preventDefault();
    setError('');
    setStep(2);
  }

  function handleOrderSuccess(order) {
    navigate(`/orders/${order.id}`, { state: { justPlaced: true } });
  }

  function updateShipping(field, value) {
    setShippingData((prev) => ({ ...prev, [field]: value }));
  }

  if (items.length === 0) return null;

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="page-title">Checkout</h1>

        {/* Progress Steps */}
        <div className="checkout-steps">
          <span className={step >= 1 ? 'active' : ''}>1. Shipping</span>
          <span className={step >= 2 ? 'active' : ''}>2. Payment</span>
          <span>3. Confirmation</span>
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">
            {step === 1 && (
              <form onSubmit={handleShippingSubmit} className="shipping-form">
                <h2>Shipping Details</h2>

                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    value={shippingData.fullName}
                    onChange={(e) => updateShipping('fullName', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input
                    value={shippingData.address}
                    onChange={(e) => updateShipping('address', e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      value={shippingData.city}
                      onChange={(e) => updateShipping('city', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      value={shippingData.state}
                      onChange={(e) => updateShipping('state', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>ZIP Code</label>
                    <input
                      value={shippingData.zip}
                      onChange={(e) => updateShipping('zip', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg">
                  Continue to Payment
                </button>
              </form>
            )}

            {step === 2 && (
              <div className="payment-section">
                <h2>Payment</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>
                  ← Back to Shipping
                </button>

                {error && <div className="alert alert-error">{error}</div>}

                {clientSecret && (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentForm shipping={shippingData} onSuccess={handleOrderSuccess} />
                  </Elements>
                )}
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <aside className="checkout-summary">
            <h2>Order Summary</h2>
            {items.map((item) => (
              <div key={item.productId} className="summary-item">
                <img src={item.image} alt={item.name} />
                <div>
                  <p>{item.name} × {item.quantity}</p>
                  <p>${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
            <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
            <div className="summary-row summary-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </aside>
        </div>
      </div>
    </div>
  );
}
