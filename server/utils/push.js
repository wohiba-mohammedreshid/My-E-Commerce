/**
 * Web Push notification utilities
 */
import webpush from 'web-push';
import { getDb } from '../config/firebase.js';
import { demoPushSubscriptions } from '../data/demoStore.js';

const vapidPublic = process.env.VAPID_PUBLIC_KEY;
const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@shopwave.com';

if (vapidPublic && vapidPrivate) {
  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
}

/**
 * Send a push notification to a specific user
 */
export async function sendPushToUser(userId, payload) {
  if (!vapidPublic || !vapidPrivate) {
    console.log(`📬 [Demo] Push to ${userId}: ${payload.title}`);
    return;
  }

  try {
    const db = getDb();
    let subscription;

    if (!db) {
      subscription = demoPushSubscriptions.get(userId);
    } else {
      const doc = await db.collection('pushSubscriptions').doc(userId).get();
      subscription = doc.data()?.subscription;
    }

    if (!subscription) return;

    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
  } catch (error) {
    console.error('Push error:', error.message);
  }
}

/**
 * Send a push notification to all subscribers
 */
export async function sendPushToAll(payload) {
  if (!vapidPublic || !vapidPrivate) {
    console.log(`📬 [Demo] Broadcast: ${payload.title}`);
    return demoPushSubscriptions.size;
  }

  const db = getDb();
  let count = 0;

  if (!db) {
    for (const [, subscription] of demoPushSubscriptions) {
      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
        count++;
      } catch (error) {
        console.error('Broadcast push error:', error.message);
      }
    }
  } else {
    const snapshot = await db.collection('pushSubscriptions').get();
    for (const doc of snapshot.docs) {
      try {
        const subscription = doc.data().subscription;
        await webpush.sendNotification(subscription, JSON.stringify(payload));
        count++;
      } catch (error) {
        console.error('Broadcast push error:', error.message);
      }
    }
  }

  return count;
}
