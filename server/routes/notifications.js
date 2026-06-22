/**
 * Push notification routes — subscribe users and send offers.
 */
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { getDb } from '../config/firebase.js';
import { demoPushSubscriptions } from '../data/demoStore.js';
import { sendPushToAll } from '../utils/push.js';

const router = Router();

/**
 * POST /api/notifications/subscribe — Save push subscription for a user
 */
router.post('/subscribe', requireAuth, async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription) {
      return res.status(400).json({ error: 'Subscription object required' });
    }

    const db = getDb();

    if (!db) {
      demoPushSubscriptions.set(req.user.uid, subscription);
      return res.json({ message: 'Subscribed to notifications' });
    }

    await db.collection('pushSubscriptions').doc(req.user.uid).set({
      subscription,
      updatedAt: new Date().toISOString(),
    });

    res.json({ message: 'Subscribed to notifications' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/notifications/vapid-key — Public VAPID key for client
 */
router.get('/vapid-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || '' });
});

/**
 * POST /api/notifications/broadcast — Send offer to all subscribers (admin)
 */
router.post('/broadcast', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, body, url } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    const count = await sendPushToAll({ title, body, url: url || '/' });
    res.json({ message: `Notification sent to ${count} subscribers` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
