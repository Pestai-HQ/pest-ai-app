import { api } from '../api/mock.js';
import { go, ctx } from '../router.js';
import { pic } from '../components/pictos.js';
import { navbar, topbar, offlineBar, watchNetwork } from '../components/navbar.js';
import { bindNav } from '../components/nav.js';

const css = href => { if (!document.querySelector(`link[href="${href}"]`)) document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="${href}">`); };
const CAT = { FUNGUS: 'fungus', INSECT: 'insect', NUTRIENT: 'bag' };

// Verdict de chaque diagnostic : classe de couleur, mot et pictogramme (la couleur ne porte jamais le sens seule).
const verdict = d => !d.problem ? ['wait', 'En attente', 'clock']
  : d.status === 'HEALTHY' ? ['ok', 'En bonne santé', 'sprout']
  : d.status === 'UNSURE' ? ['unsure', 'Pas sûr', 'eye']
  : ['bad', 'Problème', CAT[d.category] || 'warn'];

const dayDiff = iso => Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(iso).setHours(0, 0, 0, 0)) / 864e5);
const groupOf = iso => { const d = dayDiff(iso); return d <= 0 ? 'Aujourd\'hui' : d === 1 ? 'Hier' : d <= 7 ? 'Cette semaine' : 'Plus ancien'; };
const stamp = iso => { const d = dayDiff(iso), dt = new Date(iso); return d <= 1 ? dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); };

function card(d) {
  const [cls, word, ic] = verdict(d);
  const thumb = d.photo ? `<img src="${d.photo}" alt="">` : `<span class="hp">${pic(ic)}</span>`;
  return `<button class="hcard" data-act="open" data-id="${d.id}" aria-label="${d.problem || 'Analyse en attente'}, ${word}, ${groupOf(d.captured_at)}">
    <span class="hthumb">${thumb}</span>
    <span class="hbody"><span class="vp ${cls}">${pic(ic)}${word}</span><strong>${d.problem || 'Analyse en attente'}</strong><span class="hwhen">${stamp(d.captured_at)}</span></span>
    <span class="chev" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></span></button>`;
}

function view(list) {
  if (!list.length) return `<main class="hist empty-state"><img src="/assets/fary.png" alt="Fary"><h1>Aucun diagnostic</h1><p>Prenez une photo d'une feuille pour commencer.</p><button class="cta" data-tab="diagnostic">Diagnostiquer</button></main>`;
  const groups = {};
  list.forEach(d => { (groups[groupOf(d.captured_at)] = groups[groupOf(d.captured_at)] || []).push(d); });
  const problems = list.filter(d => d.status === 'ANOMALY').length;
  return `<main class="hist"><div class="hhead"><h1>Historique</h1><p>${list.length} diagnostic${list.length > 1 ? 's' : ''}${problems ? ` · ${problems} problème${problems > 1 ? 's' : ''}` : ''}</p></div>
    ${['Aujourd\'hui', 'Hier', 'Cette semaine', 'Plus ancien'].filter(g => groups[g]).map(g => `<section><h2 class="gh">${g}</h2><div class="glist">${groups[g].map(card).join('')}</div></section>`).join('')}</main>`;
}

export function mountHistory(root) {
  css('/styles/shell.css'); css('/styles/home.css'); css('/styles/history.css');
  const shell = body => `<div class="shell">${offlineBar()}${topbar()}${body}${navbar('history')}</div>`;
  root.innerHTML = shell('<main class="hist" aria-busy="true" aria-label="Chargement"><div class="sk" style="height:3rem;width:55%"></div><div class="sk" style="height:6.5rem"></div><div class="sk" style="height:6.5rem"></div></main>');
  watchNetwork();
  let alive = true, items = [];
  api.history().then(l => { if (!alive) return; items = l; root.innerHTML = shell(view(l)); watchNetwork(); });
  const unbind = bindNav(root, 'history', el => {
    if (el.dataset.act === 'open') { const d = items.find(x => x.id === el.dataset.id); if (d) go('result', { result: d, photo: null, back: 'history', detailParcel: null }); return true; }
    return false;
  });
  return () => { alive = false; unbind(); };
}
