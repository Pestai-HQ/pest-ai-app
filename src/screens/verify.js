import { go, ctx } from '../router.js';
import { quality } from '../components/photo.js';
import { ic } from '../components/icons.js';

const row = (ok, good, bad) => `<li class="${ok ? 'ok' : 'no'}"><span class="mk">${ic(ok ? 'check' : 'warn')}</span>${ok ? good : bad}</li>`;

export function mountVerify(root) {
  root.innerHTML = `<div class="vf">
    <header class="bar"><button class="ghost dark" id="cancel">← Annuler</button></header>
    <main class="vf-main"><h1>Vérifier la photo</h1>
      <div class="shot"><img src="${ctx.photo}" alt="Photo à analyser"></div>
      <ul class="qlist" id="q" aria-live="polite"><li class="ok"><span class="mk">${ic('clock')}</span>Contrôle de la photo…</li></ul>
      <p class="qmsg" id="qmsg"></p></main>
    <footer class="actions"><button class="btn main" id="go">Analyser</button><button class="btn out" id="redo">Refaire la photo</button></footer></div>`;
  const $ = s => root.querySelector(s);
  $('#cancel').onclick = () => go('home');
  $('#redo').onclick = () => go('capture');
  $('#go').onclick = () => go('analyse');
  quality(ctx.photo).then(q => {
    $('#q').innerHTML = row(!q.dark && !q.bright, 'Lumière correcte', q.dark ? 'Photo trop sombre' : 'Photo trop claire') + row(!q.blur, 'Photo nette', 'Photo peut-être floue');
    $('#qmsg').textContent = (q.dark || q.bright || q.blur) ? 'Vous pouvez analyser quand même, ou refaire la photo pour un résultat plus sûr.' : 'La photo est prête.';
  }).catch(() => { $('#q').innerHTML = ''; });
}
