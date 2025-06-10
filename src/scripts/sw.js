/* eslint-disable no-undef */
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

precacheAndRoute(self.__WB_MANIFEST || []);

registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  }),
);

registerRoute(
  ({ url }) => url.origin === 'https://story-api.dicoding.dev',
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24,
      }),
    ],
  }),
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  }),
);

registerRoute(
  ({ request }) => request.destination === 'style' || request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  }),
);

registerRoute(
  ({ request }) => request.destination === 'script',
  new StaleWhileRevalidate({
    cacheName: 'js-cache',
  }),
);

self.addEventListener('push', (event) => {
  const defaultTitle = 'Notifikasi Baru';
  const defaultOptions = {
    body: 'Ada pembaruan dari D`story',
    icon: '/images/icons/icon8-192.png',
    badge: '/images/icons/icon8-96.png',
    data: {
      url: '/',
    },
  };

  let notificationData = {
    title: defaultTitle,
    options: defaultOptions,
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || defaultTitle,
        options: {
          ...defaultOptions,
          body: data.message || defaultOptions.body,
          data: {
            url: data.url || '/',
          },
        },
      };
    } catch (error) {
      console.error('Gagal memproses data notifikasi:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData.options),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    }),
  );
});
