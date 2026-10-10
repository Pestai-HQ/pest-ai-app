import { mountLogin } from './screens/login.js';
import { mountHome } from './screens/home.js';

const app = document.getElementById('app');
const splash = document.getElementById('splash');

mountLogin(app, {
  onSuccess: user => mountHome(app, { user })
});

// Splash court : le logo reste 1,4 s puis disparaît en fondu.
setTimeout(() => {
  app.hidden = false;
  splash.classList.add('gone');
  setTimeout(() => splash.remove(), 500);
}, 1400);
