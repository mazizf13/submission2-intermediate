/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'D-story-v1';

const LOCAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/scripts/index.js',
  '/styles/styles.css',
  '/styles/responsive.css',
  '/images/icons/icon8-96.png',
  '/images/icons/icon8-192.png',
  '/images/icons/add.png',
  '/images/icons/heart.png',
  '/offline.html',
];

const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css',
];

const urlsToCache = [...LOCAL_ASSETS, ...EXTERNAL_ASSETS];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(urlsToCache);
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)),
      );
    })(),
  );
});

async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
      }
      return networkResponse;
    })
    .catch(() => {
      if (request.mode === 'navigate') {
        return caches.match('/offline.html');
      }
      return null;
    });

  return cachedResponse || fetchPromise;
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  return cached || fetch(request);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin === location.origin) {
    event.respondWith(staleWhileRevalidate(request));
  } else {
    event.respondWith(cacheFirst(request));
  }
});

self.addEventListener('push', (event) => {
  const defaultData = {
    title: 'Notifikasi Baru',
    options: {
      body: 'Ada Pembaruan dari D-story',
      icon: '/images/icons/icon8-192.png',
      data: { url: '/' },
    },
  };

  let notificationData = defaultData;

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || defaultData.title,
        options: {
          ...defaultData.options,
          body: data.message || defaultData.options.body,
          data: { url: data.url || '/' },
        },
      };
    } catch (err) {
      console.error('Gagal parsing notifikasi:', err);
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
    (async () => {
      const allClients = await clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      const matchingClient = allClients.find((client) => client.url === urlToOpen);

      if (matchingClient) {
        matchingClient.focus();
      } else {
        try {
          await clients.openWindow(urlToOpen);
        } catch (err) {
          console.error('Gagal membuka jendela:', err);
        }
      }
    })(),
  );
});
