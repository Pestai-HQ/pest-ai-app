import { go, ctx } from '../router.js';
import { ic } from '../components/icons.js';
import { pic } from '../components/pictos.js';
import { createVoice } from '../components/voice.js';

const waves = '<svg class="waves" viewBox="0 0 40 80" aria-hidden="true"><path d="M8 28q10 12 0 24"/><path d="M16 20q16 20 0 40"/><path d="M24 12q22 28 0 56"/></svg>';
const LABEL = { idle: ['play', 'Écouter le conseil'], playing: ['pause', 'Pause'], paused: ['play', 'Reprendre'], done: ['replay', 'Réécouter'], error: ['play', 'Réessayer'], off: ['play', 'Audio indisponible'] };

export function mountAdvice(root) {
  const r = ctx.result, st = r.status || 'ANOMALY', healthy = st === 'HEALTHY', unsure = st === 'UNSURE';
  const steps = r.steps && r.steps.length ? r.steps : [{ icon: 'camera', text: 'Refaites la photo, plus près de la feuille.' }];
  const prods = r.products || [], follow = r.follow;
  const title = healthy ? 'Garder la plante en bonne santé' : unsure ? 'Refaire la photo' : r.problem;
  const intro = healthy ? 'Votre plante est en bonne santé. Voici comment la garder ainsi.' : unsure ? 'Nous ne sommes pas sûrs. Voici ce qu\'il faut faire.' : `Voici ce qu'il faut faire pour ${r.problem}.`;

  // Lignes lues par Fary ; chacune peut allumer un bloc de l'écran (data-t).
  const lines = [{ text: intro, step: null }];
  steps.forEach((s, k) => lines.push({ text: `Étape ${k + 1}. ${s.text}`, step: 's' + k }));
  if (prods.length) {
    lines.push({ text: 'Produits possibles.', step: null });
    prods.forEach((p, k) => lines.push({ text: `${p.name}. ${p.use}`, step: 'p' + k }));
    lines.push({ text: 'Protégez-vous. Mettez des gants et un masque. Lisez l\'étiquette du produit.', step: 'safe' });
  }
  if (follow) lines.push({ text: follow.text, step: 'next' });
  lines.push({ text: 'Ce conseil est à confirmer avec un agronome.', step: null });

  const stepsHtml = steps.map((s, k) => `<li data-t="s${k}"><span class="num">${k + 1}</span><span class="pic">${pic(s.icon)}</span><p>${s.text}</p></li>`).join('');
  const prodHtml = prods.length ? `
    <h2 class="sec">Produits possibles <span class="demo">Démonstration</span></h2>
    <ul class="prods">${prods.map((p, k) => `<li data-t="p${k}"><span class="pic y">${pic(p.icon)}</span><div><strong>${p.name}</strong><span>${p.use}</span></div></li>`).join('')}</ul>
    <p class="rule">${pic('warn')}<span>Dose et délai avant la récolte : lisez l'étiquette ou demandez à un agronome.</span></p>
    <div class="safe" data-t="safe"><h2 class="sec">Protégez-vous</h2>
      <ul><li>${pic('gloves')}<span>Gants</span></li><li>${pic('mask')}<span>Masque</span></li><li>${pic('wash')}<span>Lavez-vous les mains</span></li></ul></div>` : '';
  const nextHtml = follow ? `<div class="next" data-t="next"><span class="pic">${pic('clock')}</span><p>${follow.text}</p></div>` : '';

  root.innerHTML = `<div class="adv">
    <header class="bar"><button class="ghost dark" id="back">← Résultat</button></header>
    <main class="adv-main">
      <div><p class="kicker">${healthy ? 'Conseils' : 'Quoi faire'}</p><h1>${title}</h1></div>
      <section class="player" id="player" data-state="idle" aria-label="Lecteur audio Fary">
        <div class="stage"><img src="/assets/fary.png" alt="Fary">${waves}</div>
        <button class="bigplay" id="play"><span id="pi">${ic('play')}</span><span id="pl">Écouter le conseil</span></button>
        <div class="prog" role="progressbar" aria-label="Progression" aria-valuemin="0" aria-valuemax="${lines.length}" aria-valuenow="0"><i id="bar"></i></div>
        <div class="opts"><div class="seg" role="group" aria-label="Vitesse de lecture"><button id="r1" aria-pressed="true">Normal</button><button id="r2" aria-pressed="false">Lent</button></div>
          <button class="rep" id="replay">${ic('replay')}Rejouer</button></div>
        <p class="lang">Langue : Français</p><p class="pmsg" id="pmsg" role="status"></p>
      </section>
      <h2 class="sec">${healthy ? 'Pour que ça continue' : unsure ? 'À faire' : 'Quoi faire maintenant'}</h2>
      <ol class="todo">${stepsHtml}</ol>
      ${prodHtml}${nextHtml}
      <p class="note">Résultat de l'analyse PEST AI, à confirmer avec un agronome.</p>
    </main>
    <footer class="actions single">${unsure ? '<button class="btn main" id="redo">Refaire la photo</button>' : '<button class="btn main" id="done">Terminé</button>'}</footer></div>`;
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const player = $('#player');
  const setBar = n => { $('#bar').style.width = Math.round(n / lines.length * 100) + '%'; $('.prog').setAttribute('aria-valuenow', n); };
  const voice = createVoice({
    lines,
    onState: s => {
      player.dataset.state = s;
      const [icon, label] = LABEL[s] || LABEL.idle;
      $('#pi').innerHTML = ic(icon); $('#pl').textContent = label;
      $('#pmsg').textContent = s === 'off' ? 'Ce téléphone ne peut pas lire le texte à voix haute. Lisez les étapes à l\'écran.' : s === 'error' ? 'La lecture a échoué. Réessayez.' : '';
      if (s === 'done') { $$('[data-t]').forEach(el => el.classList.remove('now')); setBar(lines.length); }
    },
    onStep: (step, idx) => {
      $$('[data-t]').forEach(el => el.classList.toggle('now', step !== null && el.dataset.t === step));
      setBar(idx + 1);
      const el = step ? $(`[data-t="${step}"]`) : null;
      if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  });
  if (localStorage.getItem('pestai.rate') === '0.8') { voice.setRate(0.8); $('#r2').setAttribute('aria-pressed', 'true'); $('#r1').setAttribute('aria-pressed', 'false'); }
  $('#play').onclick = () => (voice.state === 'playing' ? voice.pause() : voice.play());
  $('#replay').onclick = () => { setBar(0); voice.replay(); };
  const rate = (v, on, off) => { voice.setRate(v); $(on).setAttribute('aria-pressed', 'true'); $(off).setAttribute('aria-pressed', 'false'); };
  $('#r1').onclick = () => rate(1, '#r1', '#r2'); $('#r2').onclick = () => rate(0.8, '#r2', '#r1');
  $('#back').onclick = () => go('result');
  if ($('#done')) $('#done').onclick = () => go('home');
  if ($('#redo')) $('#redo').onclick = () => go('capture');
  return () => voice.stop();
}
