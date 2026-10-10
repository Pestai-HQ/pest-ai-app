import { mountLogin } from './screens/login.js';

const app = document.getElementById('app');
const splash = document.getElementById('splash');

mountLogin(app, {
  onSuccess: user => { console.info('Connecté', user); /* Étape suivante : écran Accueil */ }
});

// Splash court : le logo reste 1,4 s puis disparaît en fondu.
setTimeout(() => {
  app.hidden = false;
  splash.classList.add('gone');
  setTimeout(() => splash.remove(), 500);
}, 1400);
