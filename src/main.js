import { setRoot, register, go } from './router.js';
import { api } from './api/mock.js';
import { toast } from './components/navbar.js';
import { mountLogin } from './screens/login.js';
import { mountHome } from './screens/home.js';
import { mountCapture } from './screens/capture.js';
import { mountVerify } from './screens/verify.js';
import { mountAnalyse } from './screens/analyse.js';
import { mountResult } from './screens/result.js';

const app = document.getElementById('app');
const splash = document.getElementById('splash');
['/styles/shell.css', '/styles/home.css', '/styles/diagnostic.css'].forEach(h => document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="${h}">`));

setRoot(app);
register('login', root => mountLogin(root, { onSuccess: user => go('home', { user }) }));
register('home', mountHome);
register('capture', mountCapture);
register('verify', mountVerify);
register('analyse', mountAnalyse);
register('result', mountResult);
go('login');

// Retour du réseau : les analyses en attente se terminent (simulation tant que le back-end n'est pas branché).
addEventListener('online', async () => { const n = await api.syncPending(); if (n) toast(n === 1 ? 'Une analyse en attente est terminée.' : `${n} analyses en attente sont terminées.`); });

// Splash court : le logo reste 1,4 s puis disparaît en fondu.
setTimeout(() => { app.hidden = false; splash.classList.add('gone'); setTimeout(() => splash.remove(), 500); }, 1400);
