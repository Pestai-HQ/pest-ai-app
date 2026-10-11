// Navigation commune : les onglets de la barre du bas. Les écrans non encore construits affichent un message bref.
import { go } from '../router.js';
import { toast } from './navbar.js';
const TARGET = { home: 'home', parcels: 'parcels', diagnostic: 'capture', history: 'history' };
export function bindNav(root, current, extra) {
  root.onclick = e => {
    const el = e.target.closest('[data-tab],[data-act]');
    if (!el) return;
    if (extra && extra(el)) return;
    const t = el.dataset.tab;
    if (!t || t === current) return;
    if (TARGET[t]) go(TARGET[t]); else toast('Cet écran arrive bientôt.');
  };
  return () => { root.onclick = null; };
}
