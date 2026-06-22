/**
 * Authentication middleware
 * Verifies Firebase ID tokens sent from the React client.
 */
import { getAuth } from '../config/firebase.js';
import { demoUsers } from '../data/demoStore.js';

/**
 * Require a valid logged-in user.
 * Client sends: Authorization: Bearer <firebase-id-token>
 */
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Please log in to continue' });
    }

    const token = header.split('Bearer ')[1];
    const auth = getAuth();

    // Demo mode: accept demo tokens (format: demo_<userId>)
    if (!auth && token.startsWith('demo_')) {
      const userId = token.replace('demo_', '');
      const user = demoUsers.get(userId);
      if (!user) {
        return res.status(401).json({ error: 'Invalid session' });
      }
      req.user = { uid: userId, email: user.email, isAdmin: user.isAdmin };
      return next();
    }

    if (!auth) {
      return res.status(503).json({ error: 'Auth service unavailable' });
    }

    const decoded = await auth.verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      isAdmin: decoded.email === process.env.ADMIN_EMAIL,
    };
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

/**
 * Require admin role for dashboard routes.
 */
export function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

/**
 * Optional auth — attaches user if token present, but doesn't block.
 */
export async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return next();

    const token = header.split('Bearer ')[1];
    const auth = getAuth();

    if (!auth && token.startsWith('demo_')) {
      const userId = token.replace('demo_', '');
      const user = demoUsers.get(userId);
      if (user) req.user = { uid: userId, email: user.email, isAdmin: user.isAdmin };
      return next();
    }

    if (auth) {
      const decoded = await auth.verifyIdToken(token);
      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        isAdmin: decoded.email === process.env.ADMIN_EMAIL,
      };
    }
    next();
  } catch {
    next();
  }
}
