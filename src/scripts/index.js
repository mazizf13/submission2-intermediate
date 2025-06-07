/* eslint-disable no-undef */
import '../styles/styles.css';
import '../styles/responsive.css';
import 'tiny-slider/dist/tiny-slider.css';
import 'leaflet/dist/leaflet.css';

const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      if (process.env.NODE_ENV === 'production') {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service worker berhasil didaftarkan:', registration);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              if (confirm('Versi baru aplikasi tersedia. Muat ulang sekarang?')) {
                window.location.reload();
              }
            }
          });
        });
      } else {
        console.log('Mode development: Service worker tidak didaftarkan');
      }
    } catch (error) {
      console.error('Gagal mendaftarkan service worker:', error);
    }
  }
};

window.addEventListener('load', registerServiceWorker);

import App from './pages/app';
import Camera from './utils/camera';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.getElementById('main-content'),
    drawerButton: document.getElementById('drawer-button'),
    drawerNavigation: document.getElementById('navigation-drawer'),
  });

  const drawerButton = document.getElementById('drawer-button');
  const navigationDrawer = document.getElementById('navigation-drawer');

  drawerButton.addEventListener('click', () => {
    navigationDrawer.classList.toggle('open');
  });

  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();

    Camera.stopAllStreams();
  });
});
