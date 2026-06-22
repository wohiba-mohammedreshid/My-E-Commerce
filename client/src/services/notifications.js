/**
 * Push notification service — subscribes users to Web Push notifications.
 */
import { notificationApi } from './api';

/**
 * Request permission and subscribe to push notifications
 */
export async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const { publicKey } = await notificationApi.getVapidKey();
    if (!publicKey) {
      console.log('VAPID key not configured — notifications in demo mode');
      return true;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    await notificationApi.subscribe(subscription.toJSON());
    return true;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return false;
  }
}

/** Convert VAPID key from base64 to Uint8Array */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
