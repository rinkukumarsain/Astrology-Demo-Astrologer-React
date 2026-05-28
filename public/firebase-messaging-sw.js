/* eslint-disable no-undef */
// Firebase Messaging Service Worker – handles background push notifications.
importScripts("https://www.gstatic.com/firebasejs/11.8.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.8.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC1eP3KZ8xWpGRVSkG4T7U3EUWv887uJe4",
  authDomain: "astro-app-6f4b6.firebaseapp.com",
  projectId: "astro-app-6f4b6",
  storageBucket: "astro-app-6f4b6.firebasestorage.app",
  messagingSenderId: "107502949558",
  appId: "1:107502949558:web:9ddc6fdab6d33a0a888217",
  measurementId: "G-NL7WQ0N73W",
});

const messaging = firebase.messaging();

// Track whether the call has been handled (accepted/rejected/ended)
// so stale notification clicks are ignored
let handledChannelNames = new Set();

// Optional: customise the background notification here
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Background message received:", payload);

  const data = payload.data || {};

  // If this is an incoming call, forward the data to all open client windows
  // so Redux can pick it up when the tab regains focus
  if (data.type === "incoming_call") {
    console.log("[firebase-messaging-sw.js] Incoming call detected, forwarding to clients...");

    // Store the call data so we can serve it on tab focus
    self.__pendingCallData = {
      ...data,
      receivedAt: Date.now(),
    };

    // Remove from handled set since this is a new call
    if (data.channelName) {
      handledChannelNames.delete(data.channelName);
    }

    // Post message to all connected clients immediately
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: "BACKGROUND_INCOMING_CALL",
          data: data,
        });
      });
    });

    // Show notification with call info
    const callerName = data.userName || "User";
    const callType = (data.callType || "video").toLowerCase();
    const isAudio = callType === "audio" || callType === "voice" || callType === "voice_call";

    self.registration.showNotification(
      `Incoming ${isAudio ? "Audio" : "Video"} Call`,
      {
        body: `${callerName} is calling you...`,
        icon: "/assets/img/logo.png",
        badge: "/assets/img/logo.png",
        tag: "incoming-call",
        requireInteraction: true, // Keep notification visible until user interacts
        data: { type: "incoming_call", ...data },
      }
    );
  } else if (data.type === "call_ended" || data.type === "call_rejected") {
    // Mark channel as handled
    if (data.channelName) {
      handledChannelNames.add(data.channelName);
    }

    // Clear any pending call data
    self.__pendingCallData = null;

    // Dismiss the call notification
    self.registration.getNotifications({ tag: "incoming-call" }).then((notifications) => {
      notifications.forEach((n) => n.close());
    });

    // Notify clients to clear incoming call
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: "BACKGROUND_CALL_DISMISSED",
          data: data,
        });
      });
    });
  } else {
    // Regular notification
    const { title, body, icon } = payload.notification || {};
    self.registration.showNotification(title || "New Notification", {
      body: body || "",
      icon: icon || "/logo.png",
    });
  }
});

// Listen for messages from the client (e.g., "dismiss the call notification")
self.addEventListener("message", (event) => {
  const { type, channelName } = event.data || {};

  if (type === "DISMISS_CALL_NOTIFICATION") {
    console.log("[firebase-messaging-sw.js] Client requested notification dismissal for:", channelName);

    // Mark this channel as handled so future notification clicks are ignored
    if (channelName) {
      handledChannelNames.add(channelName);
    }

    // Clear pending call data
    self.__pendingCallData = null;

    // Close the notification
    self.registration.getNotifications({ tag: "incoming-call" }).then((notifications) => {
      notifications.forEach((n) => n.close());
    });
  }
});

// When the user clicks the notification, focus/open the app
self.addEventListener("notificationclick", (event) => {
  const data = event.notification.data || {};
  event.notification.close();

  if (data.type === "incoming_call") {
    // Check if this call has already been handled (accepted/rejected/ended)
    if (data.channelName && handledChannelNames.has(data.channelName)) {
      console.log("[firebase-messaging-sw.js] Ignoring stale notification click for channel:", data.channelName);
      return;
    }

    // Focus existing window or open new one
    event.waitUntil(
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
        // Try to focus an existing window
        for (const client of clients) {
          if (client.url && "focus" in client) {
            // Post the call data to the client so it shows the overlay
            client.postMessage({
              type: "BACKGROUND_INCOMING_CALL",
              data: data,
            });
            return client.focus();
          }
        }
        // No existing window, open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow("/");
        }
      })
    );
  }
});
