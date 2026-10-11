import { go, ctx } from '../router.js';
import { pic } from '../components/pictos.js';
import { faryPlayer, bindFary } from '../components/fary.js';

const SURE = ['', 'Pas sûr', 'Assez sûr', 'Très sûr'];
const CAT = { FUNGUS: ['fungus', 'C\'est un champignon.'], INSECT: ['insect', 'C\'est un insecte.'], NUTRIENT: ['bag', 'Il manque de la nourriture à la plante.'] };
const when = iso => new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export function mountResult(root) {
  const r = ctx.result, p = ctx.detailParcel || ctx.parcel || {}, img = ctx.photo || r.photo, queued = !r.problem;
  const st = r.status || 'ANOMALY';
  const sync = r.sync === 'SYNCED' ? `<span class="tag">${pic('check')}Envoyé</span>` : `<span class="tag wait">${pic('clock')}En attente d'envoi</span>`;
  const ref = String(r.id || '').replace(/-/g, '').slice(0, 6).toUpperCase();

  let verdict, spoken, mainLabel, mainId;
  if (queued) {
    verdict = `<div class="verdict unsure"><span class="vpic">${pic('clock')}</span><div><p class="vtop">Photo enregistrée</p><h1>Analyse en attente</h1><p class="vsub">L'analyse démarre dès que le réseau revient.</p></div></div>`;
    mainLabel = 'Retour à l\'accueil'; mainId = 'home';
  } else if (st === 'HEALTHY') {
    verdict = `<div class="verdict ok"><span class="vpic">${pic('sprout')}</span><div><p class="vtop">Bonne nouvelle</p><h1>Plante en bonne santé</h1><p class="vsub">Aucun problème vu sur la photo.</p></div></div>`;
    spoken = 'Bonne nouvelle. Votre plante est en bonne santé. Aucun problème vu sur la photo.';
    mainLabel = 'Voir les conseils'; mainId = 'advice';
  } else if (st === 'UNSURE') {
    verdict = `<div class="verdict unsure"><span class="vpic">${pic('eye')}</span><div><p class="vtop">Attention</p><h1>Nous ne sommes pas sûrs</h1><p class="vsub">Refaites la photo, plus près de la feuille.</p></div></div>`;
    spoken = 'Attention. Nous ne sommes pas sûrs. Refaites la photo, plus près de la feuille.';
    mainLabel = 'Refaire la photo'; mainId = 'redo';
  } else {
    const [ic, txt] = CAT[r.category] || ['warn', ''];
    verdict = `<div class="verdict bad"><span class="vpic">${pic(ic)}</span><div><p class="vtop">Problème détecté</p><h1>${r.problem}</h1><p class="vsub">${txt}</p></div></div>`;
    spoken = `Problème détecté. ${r.problem}. ${txt}`;
    mainLabel = 'Voir quoi faire'; mainId = 'advice';
  }
  const sure = queued || st === 'UNSURE' ? '' : `<div class="meter"><span class="bars" aria-hidden="true">${[1, 2, 3].map(i => `<i class="${i <= r.confidence ? 'f' : ''}"></i>`).join('')}</span><span>Certitude : <strong>${SURE[r.confidence]}</strong></span></div>`;
  const seen = queued ? '' : `<h2>Ce que nous avons vu</h2><ul class="sym">${r.symptoms.map(s => `<li>${s}</li>`).join('')}</ul>`;
  const details = `<details class="more"><summary>Détails du diagnostic</summary>
    <dl class="facts"><div><dt>Parcelle</dt><dd>${p.name || '—'}</dd></div><div><dt>AgroID</dt><dd class="num">${p.agroid || '—'}</dd></div>
    <div><dt>Culture</dt><dd>${p.crop || '—'}</dd></div><div><dt>Date</dt><dd>${when(r.captured_at)}</dd></div></dl>
    ${queued ? '' : '<p class="mut">Validation par un agronome : en attente. Elle ne bloque pas votre conseil.</p>'}
    <p class="ref">Réf. ${ref}${r.source === 'GALLERY' ? ' · Photo de la galerie' : ''}</p></details>`;
  root.innerHTML = `<div class="res">
    <div class="heroimg">${img ? `<img src="${img}" alt="Photo analysée">` : ''}<button class="pill-btn" id="back">← ${ctx.back === 'history' ? 'Historique' : ctx.back === 'parcel' ? 'Parcelle' : 'Accueil'}</button>${sync}</div>
    <section class="sheet">${verdict}${sure}${spoken ? faryPlayer() : ''}${seen}${details}
      ${queued ? '' : `<button class="link" id="redo2">Refaire une photo</button>`}
      <p class="note">Résultat de l'analyse PEST AI. À confirmer avec un agronome.</p></section>
    <footer class="actions single"><button class="btn main" id="main">${mainLabel}</button></footer></div>`;
  const $ = s => root.querySelector(s);
  $('#back').onclick = () => go(ctx.back === 'history' ? 'history' : ctx.back === 'parcel' ? 'parcel' : 'home');
  $('#main').onclick = () => go(mainId === 'redo' ? 'capture' : mainId);
  if ($('#redo2')) $('#redo2').onclick = () => go('capture');
  return spoken ? bindFary(root, spoken) : null;
}
