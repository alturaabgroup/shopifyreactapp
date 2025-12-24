importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: self.__FIREBASE_API_KEY__,
  projectId: self.__FIREBASE_PROJECT_ID__,
  messagingSenderId: self.__FIREBASE_MESSAGING_SENDER_ID__,
  appId: self.__FIREBASE_APP_ID__
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || "Notification", {
    body: body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: payload.data || {}
  });
});
