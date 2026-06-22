/**
 * Push notification service using web-push.
 * Sends order updates and promotional offers to subscribed users.
 */
import webpush from 'web-push';
import { pushSubscriptions } from '../data/demoData.js';

let isConfigured = false;

export function initPushNotifications() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL || 'mailto:admin@shopease.com';

  if (publicKey && privateKey) {
    webpush.setVapidDetails(email, publicKey, privateKey);
    isConfigured = true;
    console.log('✅ Push notifications configured');
  } else {
    console.log('ℹ️  Push notifications not configured — set VAPID keys in .env');
  }
}

export function getVapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY || null;
}

export function saveSubscription(subscription, userId) {
  const existing = pushSubscriptions.findIndex((s) => s.userId === userId);
  const entry = { ...subscription, userId, createdAt: new Date().toISOString() };

  if (existing >= 0) {
    pushSubscriptions[existing] = entry;
  } else {
    pushSubscriptions.push(entry);
  }
}

export async function sendNotification(userId, payload) {
  const subscription = pushSubscriptions.find((s) => s.userId === userId);
  if (!subscription) return false;

  if (!isConfigured) {
    console.log(`📬 [Demo] Notification for ${userId}:`, payload.title);
    return true;
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
    return true;
  } catch (error) {
    console.error('Push notification failed:', error.message);
    return false;
  }
}

export async function broadcastOffer(title, body) {
  const payload = { title, body, icon: '/pwa-192x192.png' };

  if (!isConfigured) {
    console.log(`📬 [Demo] Broadcast offer: ${title}`);
    return pushSubscriptions.length;
  }

  let sent = 0;
  for (const sub of pushSubscriptions) {
    try {
      await webpush.sendNotification(sub, JSON.stringify(payload));
      sent++;
    } catch {
      // Skip failed subscriptions
    }
  }
  return sent;
}
