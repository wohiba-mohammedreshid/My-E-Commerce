/**
 * Firebase Admin SDK setup
 * Used on the server to verify user tokens and access Firestore securely.
 */
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let db = null;
let auth = null;

/**
 * Initialize Firebase only when credentials are provided.
 * In demo mode (no credentials), the app uses in-memory storage instead.
 */
export function initFirebase() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.log('⚠️  Firebase credentials not found — running in DEMO mode (in-memory data)');
    return { isDemo: true, db: null, auth: null };
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  db = admin.firestore();
  auth = admin.auth();
  console.log('✅ Firebase connected');
  return { isDemo: false, db, auth };
}

export function getDb() {
  return db;
}

export function getAuth() {
  return auth;
}

export { admin };
