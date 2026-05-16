// Intrun Service Worker — maneja push notifications
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('push', e => {
  if (!e.data) return;
  let data;
  try { data = e.data.json(); } catch { data = { title: 'Intrun', body: e.data.text() }; }

  e.waitUntil(
    self.registration.showNotification(data.title || '⚠️ Alerta - Intrun', {
      body:             data.body,
      icon:             '/icon-192.png',
      badge:            '/icon-72.png',
      vibrate:          [200, 100, 200, 100, 400],
      tag:              'intrun-alert',
      renotify:         true,
      requireInteraction: true,
      data:             data.data || {},
      actions: [
        { action: 'med',     title: '💊 Tomar medicación' },
        { action: 'dismiss', title: 'Entendido' },
      ],
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length) return list[0].focus();
      return clients.openWindow('/');
    })
  );
});
