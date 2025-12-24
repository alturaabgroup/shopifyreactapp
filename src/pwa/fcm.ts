import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

let messaging: any = null;

export async function initializeMessaging() {
  if (typeof window !== 'undefined') {
    const supported = await isSupported();
    if (supported) {
      messaging = getMessaging(app);
    }
  }
  return messaging;
}

export async function getFCMToken(): Promise<string | null> {
  try {
    if (!messaging) {
      await initializeMessaging();
    }
    
    if (!messaging) {
      console.warn('Firebase Messaging is not supported');
      return null;
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('VAPID key is not configured');
      return null;
    }

    const token = await getToken(messaging, { vapidKey });
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

export function onForegroundMessage(callback: (payload: any) => void) {
  if (messaging) {
    return onMessage(messaging, callback);
  }
}

// Update service worker with Firebase config
export function updateServiceWorkerConfig() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.active?.postMessage({
        type: 'FIREBASE_CONFIG',
        config: {
          __FIREBASE_API_KEY__: firebaseConfig.apiKey,
          __FIREBASE_PROJECT_ID__: firebaseConfig.projectId,
          __FIREBASE_MESSAGING_SENDER_ID__: firebaseConfig.messagingSenderId,
          __FIREBASE_APP_ID__: firebaseConfig.appId,
        },
      });
    });
  }
}
