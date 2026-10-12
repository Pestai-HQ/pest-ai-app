import { setRoot, register, go } from './router.js';
import { api } from './api/mock.js';
import { toast } from './components/navbar.js';
import { mountOnboarding } from './screens/onboarding.js';
import { mountLogin } from './screens/login.js';
import { mountHome } from './screens/home.js';
import { mountCapture } from './screens/capture.js';
import { mountVerify } from './screens/verify.js';
import { mountAnalyse } from './screens/analyse.js';
import { mountResult } from './screens/result.js';
import { mountAdvice } from './screens/advice.js';
import { mountHistory } from './screens/history.js';
import { mountQr } from './screens/qrcode.js';
import { mountParcels } from './screens/parcels.js';
import { mountParcel } from './screens/parcel.js';
import { mountWeather } from './screens/weather.js';

const app = document.getElementById('app');
const splash = document.getElementById('splash');
['/styles/shell.css', '/styles/home.css', '/styles/diagnostic.css', '/styles/qr.css', '/styles/auth.css'].forEach(h => document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="${h}">`));

setRoot(app);
register('welcome', mountOnboarding);
register('onboarding', mountOnboarding);
register('login', root => mountLogin(root, { onSuccess: user => go('home', { user }) }));
register('home', mountHome);
register('capture', mountCapture);
register('verify', mountVerify);
register('analyse', mountAnalyse);
register('result', mountResult);
register('advice', mountAdvice);
register('history', mountHistory);
register('qr', mountQr);
register('parcels', mountParcels);
register('parcel', mountParcel);
register('weather', mountWeather);
// Première ouverture : lancement et présentation. Ensuite : connexion directe. « ?onboarding » rejoue la présentation.
let seen = false; try { seen = !!localStorage.getItem('pestai.onboarded'); } catch (_) { /* ignoré */ }
go(seen && !/[?&]onboarding/.test(location.search) ? 'login' : 'welcome');

// Retour du réseau : les analyses en attente se terminent (simulation tant que le back-end n'est pas branché).
addEventListener('online', async () => { const n = await api.syncPending(); if (n) toast(n === 1 ? 'Une analyse en attente est terminée.' : `${n} analyses en attente sont terminées.`); });

// Splash court : le logo reste 1,4 s puis disparaît en fondu.
setTimeout(() => { app.hidden = false; splash.classList.add('gone'); setTimeout(() => splash.remove(), 500); }, 1400);
