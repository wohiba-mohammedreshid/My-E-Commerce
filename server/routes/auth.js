/**
 * Auth routes — registration and profile in demo mode.
 * With Firebase, sign-up/login happens on the client; these routes handle profile sync.
 */
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getDb } from '../config/firebase.js';
import { demoUsers } from '../data/demoStore.js';

const router = Router();

/**
 * POST /api/auth/register — Demo mode registration
 * Body: { email, password, displayName }
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const db = getDb();
    const isAdmin = email === process.env.ADMIN_EMAIL;

    if (!db) {
      // Demo mode
      const existing = [...demoUsers.values()].find((u) => u.email === email);
      if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const userId = `user_${Date.now()}`;
      const user = {
        id: userId,
        email,
        displayName: displayName || email.split('@')[0],
        isAdmin,
        createdAt: new Date().toISOString(),
      };
      demoUsers.set(userId, { ...user, password });
      return res.json({
        user,
        token: `demo_${userId}`,
        message: 'Account created successfully',
      });
    }

    // Firebase mode — client handles registration; sync profile here
    res.status(400).json({
      error: 'Use Firebase client SDK for registration',
      hint: 'Call createUserWithEmailAndPassword in the React app',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/auth/login — Demo mode login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getDb();

    if (!db) {
      const user = [...demoUsers.values()].find(
        (u) => u.email === email && u.password === password
      );
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const { password: _, ...safeUser } = user;
      return res.json({
        user: safeUser,
        token: `demo_${user.id}`,
      });
    }

    res.status(400).json({
      error: 'Use Firebase client SDK for login',
      hint: 'Call signInWithEmailAndPassword in the React app',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/auth/me — Get current user profile
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const db = getDb();

    if (!db) {
      const user = demoUsers.get(req.user.uid);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const { password: _, ...safeUser } = user;
      return res.json(safeUser);
    }

    const doc = await db.collection('users').doc(req.user.uid).get();
    if (!doc.exists) {
      return res.json({
        id: req.user.uid,
        email: req.user.email,
        displayName: req.user.email?.split('@')[0],
        isAdmin: req.user.isAdmin,
      });
    }
    res.json({ id: doc.id, ...doc.data(), isAdmin: req.user.isAdmin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
