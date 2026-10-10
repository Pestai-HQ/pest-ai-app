import { go, ctx } from '../router.js';
import { ic } from '../components/icons.js';
import { faryPlayer, bindFary } from '../components/fary.js';

const WORD = ['', 'faible', 'moyenne', 'élevée'];
const EXPLAIN = ['', 'Résultat incertain. Refaites une photo plus nette avant d\'agir.', 'Résultat à confirmer. Une deuxième photo peut aider.', 'Résultat fiable.'];
const when = iso => new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export function mountResult(root) {
  const r = ctx.result, p = ctx.parcel || {}, img = ctx.photo || r.photo, queued = !r.problem, low = !queued && r.confidence === 1;
  const sync = r.sync === 'SYNCED' ? `<span class="tag">${ic('check')}Envoyé</span>` : `<span class="tag wait">${ic('clock')}En attente d'envoi</span>`;
  const ref = String(r.id || '').replace(/-/g, '').slice(0, 6).toUpperCase();
  const meter = `<div class="meter"><span class="bars" aria-hidden="true">${[1, 2, 3].map(i => `<i class="${i <= r.confidence ? (r.confidence === 1 ? 'w' : 'f') : ''}"></i>`).join('')}</span><strong>Confiance ${WORD[r.confidence]}</strong></div>`;
  const details = `<h2>Détails du diagnostic</h2>
    <dl class="facts">
      <div><dt>Parcelle</dt><dd>${p.name || '—'}</dd></div><div><dt>AgroID</dt><dd class="num">${p.agroid || '—'}</dd></div>
      <div><dt>Culture</dt><dd>${p.crop || '—'}</dd></div><div><dt>Date</dt><dd>${when(r.captured_at)}</dd></div>
    </dl>
    ${queued ? '' : `<div class="valid"><span class="mk">${ic('clock')}</span><div><strong>Validation agronome : en attente</strong><span>Un agronome peut confirmer ce résultat. Il ne bloque pas votre conseil.</span></div></div>`}
    <p class="ref">Réf. ${ref}${r.source === 'GALLERY' ? ' · Photo importée de la galerie' : ''}</p>`;
  const body = queued
    ? `<h1>Analyse en attente</h1><div class="info">${ic('clock')}<p>La photo est enregistrée sur le téléphone. L'analyse démarre dès que le réseau revient.</p></div>${details}`
    : `<p class="kicker">Problème détecté</p><h1>${r.problem}</h1>${meter}
       <div class="${low ? 'warnbox' : 'info'}">${ic(low ? 'warn' : 'check')}<p>${EXPLAIN[r.confidence]}</p></div>
       <h2>Ce qui est visible</h2><ul class="sym">${r.symptoms.map(s => `<li>${s}</li>`).join('')}</ul>
       ${details}
       <div class="more-actions">${faryPlayer()}
         <button class="link" id="${low ? 'advice' : 'redo'}">${low ? 'Voir quoi faire' : 'Refaire une photo'}</button></div>
       <p class="note">Résultat de l'analyse PEST AI. À confirmer avec un agronome.</p>`;
  const main = queued ? '<button class="btn main" id="home">Retour à l\'accueil</button>'
    : low ? '<button class="btn main" id="redo2">Refaire une photo</button>' : '<button class="btn main" id="advice2">Voir quoi faire</button>';
  root.innerHTML = `<div class="res">
    <div class="heroimg">${img ? `<img src="${img}" alt="Photo analysée">` : ''}<button class="pill-btn" id="back">← Accueil</button>${sync}</div>
    <section class="sheet">${body}</section>
    <footer class="actions single">${main}</footer></div>`;
  const $ = s => root.querySelector(s), on = (s, f) => { const el = $(s); if (el) el.onclick = f; };
  on('#back', () => go('home')); on('#home', () => go('home'));
  on('#redo', () => go('capture')); on('#redo2', () => go('capture'));
  on('#advice', () => go('advice')); on('#advice2', () => go('advice'));
  const stopAudio = queued ? () => {} : bindFary(root, `${r.problem}. Confiance ${WORD[r.confidence]}. ${r.symptoms.join('. ')}. Résultat à confirmer avec un agronome.`);
  return stopAudio;
}
