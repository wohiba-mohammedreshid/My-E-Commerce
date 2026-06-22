/**
 * Payment routes — Stripe integration for secure checkout.
 * Uses Stripe test mode — no real charges are made.
 */
import { Router } from 'express';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

/**
 * POST /api/payments/create-intent — Create a Stripe PaymentIntent
 * Body: { amount } (amount in dollars, e.g. 49.99)
 */
router.post('/create-intent', requireAuth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Demo mode when Stripe is not configured
    if (!stripe) {
      return res.json({
        clientSecret: 'demo_client_secret',
        demo: true,
        message: 'Demo mode — payment simulated',
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency: 'usd',
      metadata: { userId: req.user.uid },
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe error:', error.message);
    res.status(500).json({ error: 'Payment setup failed. Please try again.' });
  }
});

/**
 * GET /api/payments/config — Return publishable key for client
 */
router.get('/config', (req, res) => {
  res.json({
    publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    demo: !process.env.STRIPE_SECRET_KEY,
  });
});

export default router;
