/**
 * Order routes — create orders, view history, and admin management.
 */
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { getDb } from '../config/firebase.js';
import { demoOrders, demoProducts } from '../data/demoStore.js';
import { sendPushToUser } from '../utils/push.js';

const router = Router();

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

/**
 * GET /api/orders — User's order history (or all orders for admin)
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const db = getDb();

    if (!db) {
      let orders = req.user.isAdmin
        ? [...demoOrders]
        : demoOrders.filter((o) => o.userId === req.user.uid);
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(orders);
    }

    let query = db.collection('orders');
    if (!req.user.isAdmin) {
      query = query.where('userId', '==', req.user.uid);
    }
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/orders/:id — Single order with tracking info
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const db = getDb();
    let order;

    if (!db) {
      order = demoOrders.find((o) => o.id === req.params.id);
    } else {
      const doc = await db.collection('orders').doc(req.params.id).get();
      if (doc.exists) order = { id: doc.id, ...doc.data() };
    }

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!req.user.isAdmin && order.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/orders — Create a new order after payment
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { items, shipping, paymentIntentId, total } = req.body;

    if (!items?.length || !shipping || !total) {
      return res.status(400).json({ error: 'Items, shipping, and total are required' });
    }

    const order = {
      userId: req.user.uid,
      userEmail: req.user.email,
      items,
      shipping,
      paymentIntentId: paymentIntentId || 'demo_payment',
      total: Number(total),
      status: 'confirmed',
      trackingNumber: `SW${Date.now().toString(36).toUpperCase()}`,
      statusHistory: [
        { status: 'confirmed', date: new Date().toISOString(), note: 'Order placed successfully' },
      ],
      createdAt: new Date().toISOString(),
    };

    const db = getDb();

    if (!db) {
      // Reduce stock in demo mode
      for (const item of items) {
        const product = demoProducts.find((p) => p.id === item.productId);
        if (product) product.stock = Math.max(0, product.stock - item.quantity);
      }

      order.id = `order_${Date.now()}`;
      demoOrders.push(order);
    } else {
      const docRef = await db.collection('orders').add(order);
      order.id = docRef.id;

      // Update stock in Firestore
      for (const item of items) {
        const productRef = db.collection('products').doc(item.productId);
        const productDoc = await productRef.get();
        if (productDoc.exists) {
          const currentStock = productDoc.data().stock || 0;
          await productRef.update({ stock: Math.max(0, currentStock - item.quantity) });
        }
      }
    }

    // Notify user via push notification
    await sendPushToUser(req.user.uid, {
      title: 'Order Confirmed! 🎉',
      body: `Your order #${order.trackingNumber} has been placed.`,
      url: `/orders/${order.id}`,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/orders/:id/status — Update order status (admin only)
 */
router.patch('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${ORDER_STATUSES.join(', ')}` });
    }

    const db = getDb();
    const statusEntry = { status, date: new Date().toISOString(), note: note || '' };

    if (!db) {
      const order = demoOrders.find((o) => o.id === req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      order.status = status;
      order.statusHistory.push(statusEntry);

      await sendPushToUser(order.userId, {
        title: 'Order Update',
        body: `Your order is now: ${status}`,
        url: `/orders/${order.id}`,
      });

      return res.json(order);
    }

    const orderRef = db.collection('orders').doc(req.params.id);
    const doc = await orderRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Order not found' });

    const history = doc.data().statusHistory || [];
    await orderRef.update({
      status,
      statusHistory: [...history, statusEntry],
    });

    const updated = await orderRef.get();
    const orderData = { id: updated.id, ...updated.data() };

    await sendPushToUser(orderData.userId, {
      title: 'Order Update',
      body: `Your order is now: ${status}`,
      url: `/orders/${orderData.id}`,
    });

    res.json(orderData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
