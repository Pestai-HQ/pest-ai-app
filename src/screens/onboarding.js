import { go } from '../router.js';
import { pic } from '../components/pictos.js';
import { heroArt, cardAgroid, cardDiag, cardFary } from '../components/art.js';

// Quatre pages, qui ne parlent que de ce que l'application fait déjà.
const SLIDES = [
  { brand: true, title: 'Votre agriculture, mieux accompagnée.', text: 'Suivez vos parcelles, diagnostiquez vos cultures et recevez des conseils.', art: heroArt, cta: 'Découvrir' },
  { kick: 'AgroID', title: 'Chaque parcelle a son identité', text: 'Retrouvez vos parcelles et gardez l\'historique de chaque campagne.', art: cardAgroid, cta: 'Suivant' },
  { kick: 'Diagnostic', title: 'Une photo, un résultat', text: 'Photographiez une feuille : vous voyez le problème et les conseils pour agir.', art: cardDiag, cta: 'Suivant' },
  { kick: 'Fary', title: 'Fary vous parle', text: 'Fary lit le conseil à voix haute, étape par étape.', art: cardFary, cta: 'Commencer' }
];
const finish = () => { try { localStorage.setItem('pestai.onboarded', '1'); } catch (_) { /* ignoré */ } go('login'); };

export function mountOnboarding(root) {
  let i = 0;
  root.innerHTML = `<div class="ob"><div class="ob-bg" aria-hidden="true"></div>
    <header class="ob-top"><div class="ob-seg" role="group" aria-label="Pages">${SLIDES.map((_, k) => `<button data-k="${k}" aria-label="Page ${k + 1} sur ${SLIDES.length}"><i></i></button>`).join('')}</div><button class="ob-skip" id="skip">Passer</button></header>
    <main class="ob-stage" id="stage" aria-live="polite"></main>
    <footer class="ob-foot"><button class="ob-cta" id="next"><span id="nl"></span><i>${pic('arrow')}</i></button></footer></div>`;
  const $ = s => root.querySelector(s), stage = $('#stage');
  const show = n => {
    i = Math.max(0, Math.min(SLIDES.length - 1, n));
    const s = SLIDES[i];
    stage.innerHTML = `<div class="ob-slide">${s.brand ? '<div class="ob-brand"><span class="tile"><img src="/assets/logo-mark.png" alt=""></span><span>PEST AI</span></div>' : ''}
      <div class="ob-visual">${s.art()}</div>
      <div class="ob-copy">${s.kick ? `<p class="ob-kick">${s.kick}</p>` : ''}<h1>${s.title}</h1><p class="ob-text">${s.text}</p></div></div>`;
    root.querySelectorAll('.ob-seg button').forEach((b, k) => { b.classList.toggle('done', k < i); b.classList.toggle('on', k === i); if (k === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    $('#nl').textContent = s.cta;
  };
  $('#next').onclick = () => (i === SLIDES.length - 1 ? finish() : show(i + 1));
  $('#skip').onclick = finish;
  root.querySelectorAll('.ob-seg button').forEach(b => { b.onclick = () => show(Number(b.dataset.k)); });
  let x0 = null;
  stage.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (dx < -50) show(i + 1); else if (dx > 50) show(i - 1); });
  show(0);
}
