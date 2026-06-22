/**
 * Hook for managing push notification subscriptions.
 */
import { useState, useCallback } from 'react';
import { notificationsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function useNotifications() {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState(null);

  const subscribe = useCallback(async () => {
    if (!user) return;
    setError(null);

    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setError('Push notifications are not supported in this browser');
        return;
      }

      const { publicKey } = await notificationsApi.getVapidKey();

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U',
      });

      await notificationsApi.subscribe(subscription.toJSON());
      setSubscribed(true);
    } catch (err) {
      setError(err.message || 'Failed to subscribe');
    }
  }, [user]);

  return { subscribed, error, subscribe };
}
