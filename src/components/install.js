// Installation de l'application sur l'écran d'accueil (PWA).
import { pic } from './pictos.js';
import { getPref, setPref } from './prefs.js';

let deferred = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; dispatchEvent(new Event('pwa:state')); });
addEventListener('appinstalled', () => { deferred = null; setPref('installed', '1'); dispatchEvent(new Event('pwa:state')); });

export const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
export const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const canInstall = () => !isStandalone() && getPref('installed', '') !== '1';
export const dismissed = () => Number(getPref('install.later', '0')) > Date.now() - 7 * 864e5;
export const dismiss = () => { setPref('install.later', String(Date.now())); dispatchEvent(new Event('pwa:state')); };

// Lance l'installation : la fenêtre du téléphone s'ouvre si possible, sinon on montre comment faire.
export async function install() {
  if (deferred) {
    deferred.prompt();
    const r = await deferred.userChoice; deferred = null; dispatchEvent(new Event('pwa:state'));
    return r.outcome;
  }
  showHelp(); return 'manual';
}

export function showHelp() {
  if (!document.querySelector('link[href="/styles/install.css"]')) document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="/styles/install.css">');
  const ios = isIOS();
  const steps = ios
    ? ['Touchez le bouton <b>Partager</b> de Safari (le carré avec une flèche).', 'Choisissez <b>« Sur l\'écran d\'accueil »</b>.', 'Touchez <b>Ajouter</b>. L\'icône PEST AI apparaît sur votre écran.']
    : ['Ouvrez le <b>menu du navigateur</b> (les trois points en haut).', 'Touchez <b>« Installer l\'application »</b> ou <b>« Ajouter à l\'écran d\'accueil »</b>.', 'Confirmez. L\'icône PEST AI apparaît sur votre écran.'];
  const el = document.createElement('div');
  el.className = 'ins-bg';
  el.innerHTML = `<div class="ins-sheet" role="dialog" aria-modal="true" aria-label="Installer l'application"><h2>Installer PEST AI</h2><p>${ios ? 'Sur iPhone, utilisez Safari.' : 'Sur votre téléphone :'}</p>
    <ol>${steps.map((s, i) => `<li><span>${i + 1}</span><p>${s}</p></li>`).join('')}</ol><button class="ins-btn" id="ins-close">J'ai compris</button></div>`;
  document.body.appendChild(el);
  el.querySelector('#ins-close').onclick = () => el.remove();
  el.onclick = e => { if (e.target === el) el.remove(); };
  el.querySelector('#ins-close').focus();
}

// Carte d'invitation (accueil).
export const installCard = () => `<section class="ib" aria-label="Installer l'application"><span class="ib-ic">${pic('phone')}</span>
  <div><strong>Installer PEST AI</strong><p>Plein écran, plus rapide, s'ouvre même sans réseau.</p></div>
  <div class="ib-act"><button class="ib-go" data-act="install">Installer</button><button class="ib-later" data-act="later">Plus tard</button></div></section>`;
