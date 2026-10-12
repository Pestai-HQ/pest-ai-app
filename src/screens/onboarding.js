import { go } from '../router.js';
import { pic } from '../components/pictos.js';
import { leaf, artAgroid, artDiag, artFary, artReady } from '../components/art.js';

// Quatre pages, qui ne parlent que de ce que l'application fait déjà.
const SLIDES = [
  { kick: '1/4 · AgroID', title: 'Chaque parcelle a son identité', text: 'Avec l\'AgroID, retrouvez vos parcelles et gardez l\'historique de chaque campagne.', art: artAgroid },
  { kick: '2/4 · Diagnostic', title: 'Une photo, un résultat', text: 'Prenez une photo d\'une feuille. Vous voyez le problème détecté et les conseils pour agir.', art: artDiag },
  { kick: '3/4 · Fary', title: 'Fary vous parle', text: 'Fary lit le conseil à voix haute, étape par étape.', art: artFary },
  { kick: '4/4 · Prêt', title: 'Une application pensée pour vous', text: 'Simple et rapide. Sans réseau, vos photos restent sur le téléphone, puis partent dès que le réseau revient.', art: artReady }
];
const finish = () => { try { localStorage.setItem('pestai.onboarded', '1'); } catch (_) { /* ignoré */ } go('login'); };

export function mountOnboarding(root) {
  let i = 0;
  root.innerHTML = `<div class="au au-ob">
    <div class="au-obtop"><button class="au-skip" id="skip">Passer</button></div>
    <div class="au-track" id="track"><div class="au-slides" id="slides">${SLIDES.map((s, k) => `<section class="au-slide" aria-roledescription="page" aria-label="${k + 1} sur ${SLIDES.length}">
      <div class="au-artwrap">${s.art()}</div><p class="au-kick">${s.kick}</p><h1>${s.title}</h1><p class="au-text">${s.text}</p></section>`).join('')}</div></div>
    <div class="au-decor" aria-hidden="true">${leaf('#FDBC07', -20, 74)}${leaf('#10A452', 12, 56)}</div>
    <div class="au-obfoot"><div class="au-dots" role="group" aria-label="Pages">${SLIDES.map((_, k) => `<button data-k="${k}" aria-label="Page ${k + 1}"><i></i></button>`).join('')}</div>
      <button class="au-btn" id="next"></button></div></div>`;
  const $ = s => root.querySelector(s), slides = $('#slides'), next = $('#next');
  const show = n => {
    i = Math.max(0, Math.min(SLIDES.length - 1, n));
    slides.style.transform = `translateX(-${i * 100}%)`;
    root.querySelectorAll('.au-dots button').forEach((b, k) => { b.classList.toggle('on', k === i); if (k === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    root.querySelectorAll('.au-slide').forEach((s, k) => { s.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
    next.innerHTML = `${i === SLIDES.length - 1 ? 'Commencer' : 'Suivant'}${pic('arrow')}`;
  };
  next.onclick = () => (i === SLIDES.length - 1 ? finish() : show(i + 1));
  $('#skip').onclick = finish;
  root.querySelectorAll('.au-dots button').forEach(b => { b.onclick = () => show(Number(b.dataset.k)); });
  // Glisser le doigt pour changer de page.
  let x0 = null;
  $('#track').addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  $('#track').addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (dx < -50) show(i + 1); else if (dx > 50) show(i - 1); });
  show(0);
}
