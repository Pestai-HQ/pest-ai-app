import { go, ctx } from '../router.js';
import { toast } from '../components/navbar.js';
import { ic } from '../components/icons.js';

const WORD = ['', 'faible', 'moyenne', 'élevée'];
const EXPLAIN = ['', 'Résultat incertain. Refaites une photo plus nette avant d\'agir.', 'Résultat à confirmer. Une deuxième photo peut aider.', 'Résultat fiable.'];

export function mountResult(root) {
  const r = ctx.result, img = ctx.photo || r.photo, queued = !r.problem;
  const sync = r.sync === 'SYNCED' ? `<span class="tag">${ic('check')}Envoyé</span>` : `<span class="tag wait">${ic('clock')}En attente d'envoi</span>`;
  const meter = `<div class="meter"><span class="bars" aria-hidden="true">${[1, 2, 3].map(i => `<i class="${i <= r.confidence ? (r.confidence === 1 ? 'w' : 'f') : ''}"></i>`).join('')}</span><strong>Confiance ${WORD[r.confidence]}</strong></div>`;
  const body = queued
    ? `<h1>Analyse en attente</h1><div class="info">${ic('clock')}<p>La photo est enregistrée sur le téléphone. L'analyse démarre dès que le réseau revient.</p></div>`
    : `<h1>${r.problem}</h1>${meter}
       <div class="${r.confidence === 1 ? 'warnbox' : 'info'}">${ic(r.confidence === 1 ? 'warn' : 'check')}<p>${EXPLAIN[r.confidence]}</p></div>
       <h2>Ce qui est visible</h2><ul class="sym">${r.symptoms.map(s => `<li>${s}</li>`).join('')}</ul>
       <p class="note">Résultat de l'analyse PEST AI. À confirmer avec un agronome.</p>`;
  const low = !queued && r.confidence === 1;
  const actions = queued
    ? '<button class="btn main" id="home">Retour à l\'accueil</button>'
    : low ? '<button class="btn main" id="redo">Refaire une photo</button><button class="btn out" id="advice">Voir quoi faire</button>'
          : '<button class="btn main" id="advice">Voir quoi faire</button><button class="btn out" id="redo">Refaire une photo</button>';
  root.innerHTML = `<div class="res">
    <div class="heroimg">${img ? `<img src="${img}" alt="Photo analysée">` : ''}<button class="pill-btn" id="back">← Accueil</button>${sync}</div>
    <section class="sheet">${body}</section>
    <footer class="actions">${actions}</footer></div>`;
  const $ = s => root.querySelector(s);
  $('#back').onclick = () => go('home');
  if ($('#home')) $('#home').onclick = () => go('home');
  if ($('#redo')) $('#redo').onclick = () => go('capture');
  if ($('#advice')) $('#advice').onclick = () => toast('Le conseil arrive bientôt.');
}
