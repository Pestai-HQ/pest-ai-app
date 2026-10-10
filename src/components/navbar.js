// Éléments communs : barre de navigation (5 onglets), indicateur de synchro, bandeau hors connexion, message bref.
const P = {
  home: '<path d="M3 11l9-8 9 8v9H3z"/>',
  parcels: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="4"/>',
  history: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 5-6 8-6s7 1 8 6"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 012-2h9"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
};
export const icon = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${P[n]}</svg>`;

const TABS = [['home', 'Accueil', 'home'], ['parcels', 'Parcelles', 'parcels'], ['diagnostic', 'Diagnostic', 'camera'], ['history', 'Historique', 'history'], ['profile', 'Profil', 'profile']];
export function navbar(active) {
  return '<nav class="tabs" aria-label="Navigation principale">' + TABS.map(([id, label, ic]) => {
    const cur = id === active ? ' aria-current="page"' : '';
    return id === 'diagnostic'
      ? `<button class="main" data-tab="${id}"${cur}><span class="disc">${icon(ic)}</span>${label}</button>`
      : `<button data-tab="${id}"${cur}><span class="ico">${icon(ic)}</span>${label}</button>`;
  }).join('') + '</nav>';
}

let timer;
export function toast(text) {
  let el = document.querySelector('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.textContent = text; el.classList.add('on');
  clearTimeout(timer); timer = setTimeout(() => el.classList.remove('on'), 2200);
}

// Indicateur de synchro et bandeau : mis à jour automatiquement quand le réseau change.
export const topbar = () => `<header class="top"><div class="brand"><img src="/assets/logo-mark.png" alt=""><span>PEST AI</span></div><span class="pill" id="pill" data-state="ok">À jour</span></header>`;
export const offlineBar = () => '<div class="offline" id="offline" role="status" hidden>Hors connexion : vos données restent sur le téléphone.</div>';
let watching = false;
export function watchNetwork() {
  const apply = () => {
    const off = !navigator.onLine, pill = document.getElementById('pill'), bar = document.getElementById('offline');
    if (pill) { pill.dataset.state = off ? 'wait' : 'ok'; pill.textContent = off ? 'Hors connexion' : 'À jour'; }
    if (bar) bar.hidden = !off;
  };
  if (!watching) { addEventListener('online', apply); addEventListener('offline', apply); watching = true; }
  apply();
}
