import { api } from '../api/mock.js';
import { navbar, icon, toast, syncPill, offlineBar, watchNetwork } from '../components/navbar.js';

const css = href => { if (!document.querySelector(`link[href="${href}"]`)) document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="${href}">`); };

// Même langage visuel que la connexion : anneaux de pivot, point jaune du logo.
const rings = Array.from({ length: 9 }, (_, i) => `<circle cx="300" cy="40" r="${340 - i * 40}" fill="${i % 2 ? '#1d5232' : '#184429'}" stroke="rgba(255,255,255,.07)"/>`).join('');
const pivot = `<svg viewBox="0 0 360 220" preserveAspectRatio="xMaxYMin slice" aria-hidden="true">${rings}<circle cx="300" cy="40" r="10" fill="#FDBC07"/></svg>`;
const leaf = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15z"/><path d="M5 19c3-5 6-8 10-10"/></svg>';

const relDate = iso => {
  const d = Math.floor((Date.now() - new Date(iso)) / 864e5);
  return d <= 0 ? 'Aujourd\'hui' : d === 1 ? 'Hier' : `Il y a ${d} jours`;
};
const level = n => ['', 'faible', 'moyenne', 'élevée'][n];

function skeleton() {
  return `<div class="shell">${offlineBar()}<header class="top"><div class="mark"><img src="/assets/logo-mark.png" alt="PEST AI"></div>${syncPill()}</header>
  <main class="home" aria-busy="true"><div class="sk" style="height:76px;width:60%"></div><div class="sk" style="height:190px"></div><div class="sk" style="height:64px"></div><div class="sk" style="height:150px"></div></main>${navbar('home')}</div>`;
}

function view(d) {
  const l = d.last, p = d.parcel;
  const last = l
    ? `<div class="row"><div class="thumb">${leaf}</div><div><strong>${l.problem}</strong><div class="sub">${relDate(l.captured_at)} · ${l.sync === 'SYNCED' ? 'Envoyé' : 'En attente d\'envoi'}</div></div></div>
       <div class="conf"><span class="bars" aria-hidden="true">${[1, 2, 3].map(i => `<i class="${i <= l.confidence ? 'f' : ''}"></i>`).join('')}</span>Confiance ${level(l.confidence)}</div>
       <button class="more" data-act="advice">Voir quoi faire</button>`
    : '<p class="empty-last">Aucun diagnostic pour l\'instant. Photographiez une feuille touchée pour commencer.</p>';
  return `<div class="shell">${offlineBar()}<header class="top"><div class="mark"><img src="/assets/logo-mark.png" alt="PEST AI"></div>${syncPill()}</header>
  <main class="home">
    <h1>Bonjour,<b>${d.first}</b></h1>
    <section class="parcel" aria-label="Parcelle active">${pivot}<div class="body"><p class="label">Parcelle active</p><h2>${p.name}</h2><p class="meta">${p.crop} · ${p.campaign}</p><span class="chip">${p.agroid}</span></div></section>
    <button class="cta" data-act="diagnose">${icon('camera')}Diagnostiquer</button>
    <section class="last" aria-label="Dernier diagnostic"><h3>Dernier diagnostic</h3>${last}</section>
  </main>${navbar('home')}</div>`;
}

export async function mountHome(root, { user }) {
  css('/styles/shell.css'); css('/styles/home.css');
  root.innerHTML = skeleton(); watchNetwork();
  const data = await api.home(user);
  root.innerHTML = view(data); watchNetwork();
  root.onclick = e => {
    const el = e.target.closest('[data-tab],[data-act]');
    if (!el) return;
    if (el.dataset.tab === 'home') return;
    toast('Cet écran arrive bientôt.');   // Les autres écrans sont construits un par un.
  };
}
