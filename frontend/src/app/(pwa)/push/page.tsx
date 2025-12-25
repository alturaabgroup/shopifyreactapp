'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';

export default function PushNotificationsPage() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkSupport();
    checkSubscription();
  }, []);

  const checkSupport = () => {
    const isSupported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
    setSupported(isSupported);
  };

  const checkSubscription = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setSubscribed(!!subscription);
    } catch (err) {
      console.error('Error checking subscription:', err);
    }
  };

  const subscribe = async () => {
    if (!supported) return;

    setLoading(true);
    setError('');

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        setError('Notification permission denied');
        setLoading(false);
        return;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Get VAPID public key from backend
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const response = await fetch(`${backendUrl}/api/notifications/vapid-public-key`);
      const data = await response.json();

      if (!data.success || !data.publicKey) {
        setError('Push notifications not configured on server');
        setLoading(false);
        return;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      });

      // Send subscription to backend
      const subscribeResponse = await fetch(`${backendUrl}/api/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      if (!subscribeResponse.ok) {
        throw new Error('Failed to save subscription');
      }

      setSubscribed(true);
      alert('Successfully subscribed to push notifications!');
    } catch (err: any) {
      console.error('Error subscribing:', err);
      setError(err.message || 'Failed to subscribe to push notifications');
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!supported) return;

    setLoading(true);
    setError('');

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push
        await subscription.unsubscribe();

        // Notify backend
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
        await fetch(`${backendUrl}/api/notifications/unsubscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        setSubscribed(false);
        alert('Successfully unsubscribed from push notifications');
      }
    } catch (err: any) {
      console.error('Error unsubscribing:', err);
      setError(err.message || 'Failed to unsubscribe from push notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Push Notifications
          </h1>

          {!supported ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
              Push notifications are not supported in your browser.
            </div>
          ) : (
            <>
              <p className="text-gray-700 mb-6">
                Enable push notifications to receive updates about new products, special
                offers, and order status updates.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {subscribed ? (
                  <>
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                      ✓ You are subscribed to push notifications
                    </div>
                    <button
                      onClick={unsubscribe}
                      disabled={loading}
                      className={`w-full py-3 px-6 rounded-lg font-semibold ${
                        loading
                          ? 'bg-gray-400 text-white cursor-wait'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {loading ? 'Processing...' : 'Unsubscribe'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={subscribe}
                      disabled={loading}
                      className={`w-full py-3 px-6 rounded-lg font-semibold ${
                        loading
                          ? 'bg-blue-400 text-white cursor-wait'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {loading ? 'Processing...' : 'Enable Push Notifications'}
                    </button>
                  </>
                )}
              </div>

              <div className="mt-8 pt-8 border-t">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  About Push Notifications
                </h2>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Receive instant updates about your orders</li>
                  <li>• Get notified about exclusive deals and promotions</li>
                  <li>• Be the first to know about new product launches</li>
                  <li>• You can unsubscribe at any time</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
