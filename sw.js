// Service worker PEST AI : l'application s'installe, s'ouvre sans réseau et se met à jour toute seule.
// Précache : tous les fichiers de l'application. Si vous ajoutez un fichier dans src/, styles/ ou assets/, ajoutez-le à SHELL.
const V = 'pestai-v1';
const SHELL = ['/assets/apple-touch-icon.png', '/assets/contact-whatsapp.webp', '/assets/fary.png', '/assets/favicon.png', '/assets/icon-192.png', '/assets/icon-512.png', '/assets/icon-maskable-512.png', '/assets/logo-mark.png', '/assets/logo.png', '/src/api/geo.js', '/src/api/mock.js', '/src/api/weather.js', '/src/components/art.js', '/src/components/charts.js', '/src/components/contact.js', '/src/components/fary.js', '/src/components/field.js', '/src/components/icons.js', '/src/components/nav.js', '/src/components/navbar.js', '/src/components/photo.js', '/src/components/pictos.js', '/src/components/prefs.js', '/src/components/qr.js', '/src/components/verdict.js', '/src/components/voice.js', '/src/components/weather.js', '/src/lib/qr.js', '/src/main.js', '/src/router.js', '/src/screens/advice.js', '/src/screens/analyse.js', '/src/screens/capture.js', '/src/screens/history.js', '/src/screens/home.js', '/src/screens/login.js', '/src/screens/onboarding.js', '/src/screens/parcel.js', '/src/screens/parcels.js', '/src/screens/profile.js', '/src/screens/qrcode.js', '/src/screens/result.js', '/src/screens/verify.js', '/src/screens/weather.js', '/styles/app.css', '/styles/auth.css', '/styles/diagnostic.css', '/styles/history.css', '/styles/home.css', '/styles/home2.css', '/styles/home3.css', '/styles/parcels.css', '/styles/profile.css', '/styles/qr.css', '/styles/shell.css', '/styles/weather.css', '/', '/index.html', '/manifest.webmanifest'];
const CDN = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  // Tolérant : un fichier absent n'empêche pas l'installation.
  e.waitUntil(caches.open(V).then(c => Promise.allSettled(SHELL.map(u => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'skip') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;
  // Polices : en cache après la première visite.
  if (CDN.includes(u.hostname)) {
    e.respondWith(caches.open(V).then(c => c.match(r).then(hit => hit || fetch(r).then(res => { c.put(r, res.clone()); return res; }).catch(() => hit))));
    return;
  }
  if (u.origin !== location.origin) return;   // météo, géocodage : gérés par l'application
  // Pages : réseau d'abord (nouvelle version), cache si hors connexion.
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put('/index.html', cp)); return res; }).catch(() => caches.match('/index.html')));
    return;
  }
  // Fichiers : cache tout de suite, mise à jour en arrière-plan.
  e.respondWith(caches.open(V).then(c => c.match(r).then(hit => {
    const net = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  })));
});
