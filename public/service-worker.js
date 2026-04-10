// Service Worker pour Tina PWA
// Cache les fichiers pour fonctionnement hors ligne

const CACHE_NAME = 'tina-pwa-v1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installation...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Service Worker: Cache ouvert');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('❌ Erreur lors du cache:', error);
      })
  );
  
  // Force le nouveau service worker à devenir actif immédiatement
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activation...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Suppression ancien cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Prend le contrôle immédiatement
  return self.clients.claim();
});

// Interception des requêtes (stratégie: Network First, puis Cache)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la réponse est valide, la mettre en cache
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si pas de réseau, chercher dans le cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          
          // Page par défaut si rien dans le cache
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// Gestion des notifications push (optionnel, pour plus tard)
self.addEventListener('push', (event) => {
  console.log('📬 Notification push reçue');
  
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification Tina',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'tina-notification',
    requireInteraction: false
  };
  
  event.waitUntil(
    self.registration.showNotification('Tina - Mon e-pressing', options)
  );
});

// Gestion du clic sur notification
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Clic sur notification');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Synchronisation en arrière-plan (optionnel)
self.addEventListener('sync', (event) => {
  console.log('🔄 Synchronisation en arrière-plan');
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Fonction pour synchroniser les données quand la connexion revient
  console.log('📡 Synchronisation des données...');
  // À implémenter selon tes besoins (sync avec Airtable, Firebase, etc.)
}