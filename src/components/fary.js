// Fary, l'assistant vocal de PEST AI. Le lecteur est branché sur une source audio unique :
// aujourd'hui la voix du téléphone (français) ; demain les fichiers audio du serveur (français, wolof, pulaar) sans changer l'interface.
import { ic } from './icons.js';

export const faryPlayer = () => `<button class="fary" id="fary" data-state="idle" aria-live="polite">
  <span class="fary-av"><img src="/assets/fary.png" alt=""></span>
  <span class="fary-txt"><strong id="fary-title">Écouter avec Fary</strong><small id="fary-sub">Français</small></span>
  <span class="fary-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
  <span class="fary-ico" aria-hidden="true">${ic('sound')}</span></button>`;

// Branche le lecteur : un toucher lit, un second toucher arrête. Retourne une fonction d'arrêt.
export function bindFary(root, text) {
  const el = root.querySelector('#fary'), title = root.querySelector('#fary-title'), sub = root.querySelector('#fary-sub');
  const tts = 'speechSynthesis' in window;
  const set = (state, t, s) => { el.dataset.state = state; title.textContent = t; if (s) sub.textContent = s; };
  const stop = () => { if (tts) speechSynthesis.cancel(); set('idle', 'Écouter avec Fary', 'Français'); };
  el.onclick = () => {
    if (!tts) { set('off', 'Audio indisponible', 'Lisez le résultat à l\'écran'); return; }
    if (el.dataset.state === 'playing') return stop();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fr-FR'; u.onend = u.onerror = () => set('idle', 'Écouter avec Fary', 'Français');
    speechSynthesis.cancel(); speechSynthesis.speak(u);
    set('playing', 'Fary lit le résultat', 'Toucher pour arrêter');
  };
  return () => { if (tts) speechSynthesis.cancel(); };
}
