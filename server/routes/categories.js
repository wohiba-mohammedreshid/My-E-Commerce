/**
 * Category routes — list and manage product categories.
 */
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { getDb } from '../config/firebase.js';
import { demoCategories } from '../data/demoStore.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();

    if (!db) {
      return res.json(demoCategories);
    }

    const snapshot = await db.collection('categories').get();
    const categories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const category = { name, icon: icon || '📦' };
    const db = getDb();

    if (!db) {
      const id = name.toLowerCase().replace(/\s+/g, '-');
      demoCategories.push({ id, ...category });
      return res.status(201).json({ id, ...category });
    }

    const docRef = await db.collection('categories').add(category);
    res.status(201).json({ id: docRef.id, ...category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
