import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyC1eP3KZ8xWpGRVSkG4T7U3EUWv887uJe4",
  authDomain: "astro-app-6f4b6.firebaseapp.com",
  projectId: "astro-app-6f4b6",
  storageBucket: "astro-app-6f4b6.firebasestorage.app",
  messagingSenderId: "107502949558",
  appId: "1:107502949558:web:9ddc6fdab6d33a0a888217",
  measurementId: "G-NL7WQ0N73W"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

const isBrowser = () =>
  typeof window !== "undefined" &&
  typeof navigator !== "undefined";

// Initialize messaging conditionally based on feature flag and browser support
export const getMessagingInstance = async () => {
  if (!isBrowser()) {
    return null;
  }

  if (process.env.NEXT_PUBLIC_ENABLE_FCM !== "true") {
    console.log("Firebase Messaging is disabled via NEXT_PUBLIC_ENABLE_FCM.");
    return null;
  }

  try {
    const supported = await isSupported();
    if (supported) {
      return getMessaging(app);
    } else {
      console.warn("Firebase Messaging is not supported by this browser.");
      return null;
    }
  } catch (e) {
    console.error("Error checking Firebase Messaging support:", e);
    return null;
  }
};

/**
 * Request FCM token after registering the service worker.
 * Returns the token string or undefined on failure.
 */
export const requestForToken = async () => {
  try {
    if (!isBrowser()) return;

    const messaging = await getMessagingInstance();
    if (!messaging) return;

    // Request notification permission from the browser
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission not granted:", permission);
      return;
    }

    const registration = await navigator.serviceWorker.register(
      (process.env.NEXT_PUBLIC_BASE_URL || "/") + "firebase-messaging-sw.js"
    );

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      return token;
    } else {
      console.warn("No registration token available.");
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
  }
};

/**
 * Listen for foreground push notifications.
 * Returns a Promise that resolves with the message payload.
 */
export const onMessageListener = async () => {
  if (!isBrowser()) {
    return Promise.reject(new Error("Firebase Messaging is only available in the browser."));
  }

  const messaging = await getMessagingInstance();
  if (!messaging) {
    return new Promise((_, reject) => {
      reject(new Error("Firebase Messaging is disabled or unsupported."));
    });
  }

  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Foreground Message Received:", payload);
      resolve(payload);
    }); 
  });
};

