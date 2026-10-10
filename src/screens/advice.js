import { go, ctx } from '../router.js';
import { ic } from '../components/icons.js';
import { createVoice } from '../components/voice.js';

const WORD = ['', 'faible', 'moyenne', 'élevée'];
const waves = '<svg class="waves" viewBox="0 0 40 80" aria-hidden="true"><path d="M8 28q10 12 0 24"/><path d="M16 20q16 20 0 40"/><path d="M24 12q22 28 0 56"/></svg>';
const LABEL = { idle: ['play', 'Écouter le conseil'], playing: ['pause', 'Pause'], paused: ['play', 'Reprendre'], done: ['replay', 'Réécouter'], error: ['play', 'Réessayer'], off: ['play', 'Audio indisponible'] };

export function mountAdvice(root) {
  const r = ctx.result, low = r.confidence === 1, steps = r.steps && r.steps.length ? r.steps : ['Refaites une photo plus nette.'];
  const lines = [{ text: `Voici ce qu'il faut faire pour ${r.problem}.`, step: null }]
    .concat(steps.map((t, k) => ({ text: `Étape ${k + 1}. ${t}`, step: k })))
    .concat([{ text: 'Ce conseil est à confirmer avec un agronome.', step: null }]);
  root.innerHTML = `<div class="adv">
    <header class="bar"><button class="ghost dark" id="back">← Résultat</button></header>
    <main class="adv-main">
      <div><p class="kicker">Quoi faire</p><h1>${r.problem}</h1></div>
      <section class="player" id="player" data-state="idle" aria-label="Lecteur audio Fary">
        <div class="stage"><img src="/assets/fary.png" alt="Fary">${waves}</div>
        <button class="bigplay" id="play"><span id="pi">${ic('play')}</span><span id="pl">Écouter le conseil</span></button>
        <div class="prog" role="progressbar" aria-label="Progression" aria-valuemin="0" aria-valuemax="${steps.length}" aria-valuenow="0"><i id="bar"></i></div>
        <div class="opts"><div class="seg" role="group" aria-label="Vitesse de lecture"><button id="r1" aria-pressed="true">Normal</button><button id="r2" aria-pressed="false">Lent</button></div>
          <button class="rep" id="replay">${ic('replay')}Rejouer</button></div>
        <p class="lang">Langue : Français</p><p class="pmsg" id="pmsg" role="status"></p>
      </section>
      ${low ? `<div class="warnbox">${ic('warn')}<p>Résultat incertain. Refaites une photo plus nette avant d'agir.</p></div>` : ''}
      <h2>${steps.length > 1 ? 'Les étapes' : 'L\'étape'}</h2>
      <ol class="todo" id="todo">${steps.map((t, k) => `<li data-i="${k}"><span class="n">${k + 1}</span><p>${t}</p></li>`).join('')}</ol>
      <p class="note">Confiance ${WORD[r.confidence]}. Résultat de l'analyse PEST AI, à confirmer avec un agronome.</p>
    </main>
    <footer class="actions single">${low ? '<button class="btn main" id="redo">Refaire une photo</button>' : '<button class="btn main" id="done">Terminé</button>'}</footer></div>`;
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const player = $('#player');
  const voice = createVoice({
    lines,
    onState: (s, idx) => {
      player.dataset.state = s;
      const [icon, label] = LABEL[s] || LABEL.idle;
      $('#pi').innerHTML = ic(icon); $('#pl').textContent = label;
      $('#pmsg').textContent = s === 'off' ? 'Ce téléphone ne peut pas lire le texte à voix haute. Lisez les étapes à l\'écran.' : s === 'error' ? 'La lecture a échoué. Réessayez.' : '';
      if (s === 'done') { $$('#todo li').forEach(li => li.classList.remove('now')); setBar(steps.length); }
    },
    onStep: step => {
      $$('#todo li').forEach(li => li.classList.toggle('now', step !== null && Number(li.dataset.i) === step));
      if (step !== null) { setBar(step + 1); const li = $(`#todo li[data-i="${step}"]`); if (li && li.scrollIntoView) li.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
    }
  });
  function setBar(n) { $('#bar').style.width = Math.round(n / steps.length * 100) + '%'; $('.prog').setAttribute('aria-valuenow', n); }
  $('#play').onclick = () => (voice.state === 'playing' ? voice.pause() : voice.play());
  $('#replay').onclick = () => { setBar(0); voice.replay(); };
  const rate = (v, on, off) => { voice.setRate(v); $(on).setAttribute('aria-pressed', 'true'); $(off).setAttribute('aria-pressed', 'false'); };
  $('#r1').onclick = () => rate(1, '#r1', '#r2'); $('#r2').onclick = () => rate(0.8, '#r2', '#r1');
  $('#back').onclick = () => go('result');
  if ($('#done')) $('#done').onclick = () => go('home');
  if ($('#redo')) $('#redo').onclick = () => go('capture');
  return () => voice.stop();
}
