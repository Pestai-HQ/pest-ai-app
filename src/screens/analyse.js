import { go, ctx } from '../router.js';
import { api } from '../api/mock.js';
import { thumb } from '../components/photo.js';

export function mountAnalyse(root) {
  const online = navigator.onLine;
  const steps = online ? ['Lecture de la photo', 'Repérage des symptômes', 'Rédaction du résultat'] : ['Photo enregistrée sur le téléphone', 'Analyse dès le retour du réseau'];
  root.innerHTML = `<div class="an">
    <div class="scan"><img src="${ctx.photo}" alt=""><div class="beam"></div><i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i></div>
    <h1 role="status">${online ? 'Analyse en cours…' : 'Enregistrement…'}</h1>
    <ol class="steps">${steps.map(s => `<li><span class="dot"></span>${s}</li>`).join('')}</ol></div>`;
  const li = [...root.querySelectorAll('.steps li')], timers = []; let alive = true;
  const mark = i => li.forEach((el, k) => { el.className = k < i ? 'done' : k === i ? 'on' : ''; });
  mark(0);
  if (online) { timers.push(setTimeout(() => mark(1), 1200), setTimeout(() => mark(2), 2400)); }
  (async () => {
    const small = await thumb(ctx.photo);
    const result = await api.diagnose(small, ctx.parcel, ctx.source || 'CAMERA');
    if (!alive) return;
    mark(steps.length);
    timers.push(setTimeout(() => go('result', { result, back: 'home' }), 500));
  })();
  return () => { alive = false; timers.forEach(clearTimeout); };
}
