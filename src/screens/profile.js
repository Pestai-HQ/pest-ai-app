import { api, lastSync } from '../api/mock.js';
import { go, ctx } from '../router.js';
import { pic } from '../components/pictos.js';
import { navbar, topbar, offlineBar, watchNetwork, toast } from '../components/navbar.js';
import { bindNav } from '../components/nav.js';
import { waLink } from '../components/contact.js';
import { getPref, setPref, applyFontSize } from '../components/prefs.js';
import { canInstall, install } from '../components/install.js';

const css = href => { if (!document.querySelector(`link[href="${href}"]`)) document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="${href}">`); };
const styles = () => ['shell', 'home', 'history', 'profile'].forEach(n => css(`/styles/${n}.css`));
const when = ts => new Date(ts).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const chev = `<span class="chev" aria-hidden="true">${pic('chevron')}</span>`;
const row = (act, icon, title, value) => `<button class="pf-row" data-act="${act}"><span class="ri">${pic(icon)}</span><span class="rt"><b>${title}</b>${value ? `<small>${value}</small>` : ''}</span>${chev}</button>`;

// Page secondaire : retour vers le Profil, barre du bas conservée.
function sub(root, { title, lead, body, act }) {
  styles();
  const draw = html => { root.innerHTML = `<div class="shell">${offlineBar()}<header class="bar"><button class="ghost dark" data-act="back">← Profil</button></header>
    <main class="pf"><div class="hhead"><h1>${title}</h1>${lead ? `<p>${lead}</p>` : ''}</div>${html}</main>${navbar('profile')}</div>`; watchNetwork(); };
  const unbind = bindNav(root, 'profile-sub', el => { if (el.dataset.act === 'back') { go('profile'); return true; } return act ? act(el, draw) : false; });
  return { draw, unbind };
}

/* ---------- P-23 Profil ---------- */
export function mountProfile(root) {
  styles();
  const u = ctx.user || { first: 'Producteur', org: '' };
  root.innerHTML = `<div class="shell">${offlineBar()}${topbar()}<main class="pf" aria-busy="true"><div class="sk" style="height:6rem"></div><div class="sk" style="height:4rem"></div><div class="sk" style="height:12rem"></div></main>${navbar('profile')}</div>`;
  watchNetwork();
  let alive = true, pending = 0;
  api.history().then(h => {
    if (!alive) return;
    pending = h.filter(d => d.sync === 'PENDING').length;
    const ls = lastSync();
    root.innerHTML = `<div class="shell">${offlineBar()}${topbar()}<main class="pf">
      <div class="hhead"><h1>Profil</h1></div>
      <section class="pf-id"><span class="pf-av" aria-hidden="true">${u.first.charAt(0)}</span><div><strong>${u.first}</strong><span>Producteur${u.org ? ' · ' + u.org : ''}</span></div></section>
      <button class="pf-sync" data-act="sync"><span class="ri">${pic('refresh')}</span><span class="rt"><b>Synchronisation</b><small>${ls ? 'Dernière : ' + when(ls) : 'Rien à envoyer'}</small></span>
        <span class="pf-st ${pending ? 'wait' : 'ok'}">${pending ? `En attente (${pending})` : 'À jour'}</span>${chev}</button>
      <div class="pf-list">${row('lang', 'globe', 'Langue', 'Français')}${row('settings', 'sliders', 'Paramètres', 'Audio, taille du texte')}${row('help', 'help', 'Aide', 'Photo, réseau, audio')}${row('replay', 'replay', 'Revoir la présentation', '')}${canInstall() ? row('install', 'phone', 'Installer l\'application', 'Plein écran sur votre téléphone') : ''}</div>
      <button class="pf-out" data-act="logout">${pic('logout')}Se déconnecter</button>
      <p class="pf-ver">PEST AI · version 0.1 (démonstration)</p></main>${navbar('profile')}</div>`;
    watchNetwork();
  });
  const unbind = bindNav(root, 'profile', el => {
    const a = el.dataset.act;
    if (a === 'lang') go('lang'); else if (a === 'settings') go('settings'); else if (a === 'help') go('help'); else if (a === 'sync') go('sync');
    else if (a === 'replay') go('welcome');
    else if (a === 'install') install();
    else if (a === 'logout') confirmLogout();
    else if (a === 'cancel') root.querySelector('.pf-bg')?.remove();
    else if (a === 'confirm') { ctx.user = null; ctx.parcel = null; go('login'); }
    else return false;
    return true;
  });
  function confirmLogout() {
    const warn = pending ? `<p class="pf-warn">${pic('warn')}<span>${pending} élément${pending > 1 ? 's sont' : ' est'} en attente d'envoi. ${pending > 1 ? 'Ils partiront' : 'Il partira'} à votre prochaine connexion avec du réseau.</span></p>` : '';
    root.insertAdjacentHTML('beforeend', `<div class="pf-bg"><div class="pf-sheet" role="dialog" aria-modal="true" aria-label="Se déconnecter"><h2>Se déconnecter ?</h2>${warn}
      <button class="pf-btn danger" data-act="confirm">Se déconnecter</button><button class="pf-btn" data-act="cancel">Annuler</button></div></div>`);
    root.querySelector('.pf-sheet .pf-btn').focus();
  }
  return () => { alive = false; unbind(); };
}

/* ---------- P-24 Langue ---------- */
export function mountLang(root) {
  const L = [['fr', 'Français', true], ['wo', 'Wolof', false], ['ff', 'Pulaar', false]];
  const s = sub(root, { title: 'Langue', lead: 'Langue de l\'application et de Fary.' });
  s.draw(`<div class="pf-list">${L.map(([k, n, on]) => `<div class="pf-lang ${on ? 'on' : ''}" ${on ? 'aria-current="true"' : 'aria-disabled="true"'}><b>${n}</b>${on ? `<span class="ck">${pic('check')}</span>` : '<small>À venir</small>'}</div>`).join('')}</div>
    <p class="pf-note">Le wolof et le pulaar seront ajoutés avec les voix de Fary.</p>`);
  return s.unbind;
}

/* ---------- P-25 Paramètres ---------- */
export function mountSettings(root) {
  const seg = (k, opts, cur) => `<div class="pf-seg" role="group">${opts.map(([v, l]) => `<button data-act="set" data-k="${k}" data-v="${v}" aria-pressed="${v === cur}">${l}</button>`).join('')}</div>`;
  const s = sub(root, {
    title: 'Paramètres',
    act: (el, draw) => { if (el.dataset.act !== 'set') return false; setPref(el.dataset.k, el.dataset.v); if (el.dataset.k === 'fs') applyFontSize(); view(); return true; }
  });
  const view = () => s.draw(`<section class="pf-card"><h2>${pic('sound')}Audio</h2><p>Vitesse de lecture de Fary</p>${seg('rate', [['1', 'Normal'], ['0.8', 'Lent']], getPref('rate', '1'))}</section>
    <section class="pf-card"><h2>${pic('textsize')}Taille du texte</h2><p>Pour lire plus facilement</p>${seg('fs', [['s', 'Petit'], ['m', 'Normal'], ['l', 'Grand']], getPref('fs', 'm'))}</section>
    <section class="pf-card"><h2>${pic('info')}À propos</h2><ul class="pf-about"><li><span>Application</span><b>PEST AI 0.1</b></li><li><span>Météo</span><b>Open-Meteo</b></li><li><span>Position</span><b>Gardée sur ce téléphone</b></li></ul></section>`);
  view();
  return s.unbind;
}

/* ---------- P-26 Aide ---------- */
const HELP = [
  ['camera', 'Comment prendre une bonne photo ?', 'Photographiez une seule feuille touchée, de près, en pleine lumière. Tenez bien le téléphone. Évitez l\'ombre et le flou.'],
  ['cloud', 'Que veut dire « hors connexion » ?', 'Votre téléphone n\'a pas de réseau. L\'application marche quand même : vos photos restent sur le téléphone.'],
  ['clock', 'Que veut dire « en attente d\'envoi » ?', 'Vos données sont gardées sur le téléphone. Elles partiront toutes seules dès que le réseau revient.'],
  ['phone', 'Comment installer l\'application ?', 'Ouvrez le menu de votre navigateur, puis touchez « Installer l\'application » ou « Ajouter à l\'écran d\'accueil ». L\'icône PEST AI apparaît sur votre écran.'],
  ['sound', 'Comment écouter le conseil ?', 'Ouvrez un résultat, puis touchez « Voir quoi faire ». Touchez le grand bouton jaune : Fary lit le conseil.']
];
export function mountHelp(root) {
  const say = i => { if (!('speechSynthesis' in window)) { toast('Audio indisponible sur ce téléphone.'); return; } const u = new SpeechSynthesisUtterance(HELP[i][1] + '. ' + HELP[i][2]); u.lang = 'fr-FR'; speechSynthesis.cancel(); speechSynthesis.speak(u); };
  const s = sub(root, { title: 'Aide', lead: 'Les réponses aux questions les plus courantes.', act: el => { if (el.dataset.act === 'say') { say(Number(el.dataset.i)); return true; } return false; } });
  s.draw(`<div class="pf-help">${HELP.map(([ic, q, a], i) => `<details><summary><span class="ri">${pic(ic)}</span><b>${q}</b></summary><p>${a}</p><button class="pf-say" data-act="say" data-i="${i}">${pic('sound')}Écouter</button></details>`).join('')}</div>
    <a class="wa" href="${waLink('Bonjour PEST AI, j\'ai besoin d\'aide avec l\'application.')}" target="_blank" rel="noopener noreferrer" aria-label="Une question ? Contactez-nous sur WhatsApp au +221 70 666 94 38"><img src="/assets/contact-whatsapp.webp" alt="Une question ? Contactez-nous. WhatsApp : +221 70 666 94 38" loading="lazy"></a>`);
  return () => { s.unbind(); if ('speechSynthesis' in window) speechSynthesis.cancel(); };
}

/* ---------- P-28 Synchronisation ---------- */
export function mountSync(root) {
  let items = [], busy = false, done = 0;
  const view = draw => {
    const pend = items.filter(d => d.sync === 'PENDING'), ls = lastSync();
    const ok = !pend.length, off = !navigator.onLine;
    draw(`<section class="pf-status ${ok ? 'ok' : 'wait'}"><span class="ico">${pic(ok ? 'check' : 'clock')}</span><div><strong>${done ? 'Tout est envoyé' : ok ? 'Tout est à jour' : `${pend.length} élément${pend.length > 1 ? 's' : ''} en attente`}</strong>
        <span>${ls ? 'Dernière synchronisation : ' + when(ls) : 'Pas encore de synchronisation'}</span></div></section>
      ${pend.length ? `<ul class="pf-queue">${pend.map(d => `<li><span class="qi">${pic('camera')}</span><span><b>Photo à analyser</b><small>${when(d.captured_at)} · En attente d'envoi</small></span></li>`).join('')}</ul>` : ''}
      ${off ? `<p class="pf-note">${pic('cloud')}Pas de réseau. L'envoi se fera automatiquement au retour du réseau.</p>` : ''}
      <button class="pf-btn main" data-act="push" ${busy || off || ok ? 'disabled' : ''}>${busy ? 'Envoi en cours…' : 'Synchroniser'}</button>
      <p class="pf-note">L'envoi est automatique. Ce bouton ne sert qu'en secours.</p>`);
  };
  const s = sub(root, { title: 'Synchronisation', lead: 'Vos données sont-elles à jour ?', act: async (el, draw) => {
    if (el.dataset.act !== 'push') return false;
    busy = true; view(draw);
    const n = await api.syncPending(); items = await api.history(); busy = false; done = n; view(draw); return true;
  } });
  api.history().then(h => { items = h; view(s.draw); });
  window.addEventListener('online', () => api.history().then(h => { items = h; view(s.draw); }), { once: true });
  return s.unbind;
}
