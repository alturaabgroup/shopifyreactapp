import { useEffect, useState } from 'react';
import { getFCMToken, requestNotificationPermission } from '@/pwa/fcm';

export function useFCM() {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        setPermission('granted');
        const fcmToken = await getFCMToken();
        setToken(fcmToken);
        return fcmToken;
      } else {
        setPermission('denied');
        return null;
      }
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  };

  return {
    token,
    permission,
    isSupported,
    requestPermission,
  };
}
