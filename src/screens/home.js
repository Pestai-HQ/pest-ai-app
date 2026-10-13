import { api } from '../api/mock.js';
import { go, ctx } from '../router.js';
import { qrSvg } from '../components/qr.js';
import { pic } from '../components/pictos.js';
import { navbar, icon, toast, brandTop, richPill, offlineBar, watchNetwork } from '../components/navbar.js';
import { bindNav } from '../components/nav.js';
import { getWeather } from '../api/weather.js';
import { WMO, spray } from '../components/weather.js';
import { lastPosition } from '../api/geo.js';
import { verdict } from '../components/verdict.js';
import { waLink } from '../components/contact.js';

const css = href => { if (!document.querySelector(`link[href="${href}"]`)) document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="${href}">`); };
const chev = `<span class="chv" aria-hidden="true">${pic('chevron')}</span>`;
const level = n => ['', 'faible', 'moyenne', 'élevée'][n];
const relDate = iso => { const d = Math.round((Date.now() - new Date(iso)) / 864e5); return d <= 0 ? 'Aujourd\'hui' : d === 1 ? 'Hier' : `Il y a ${d} jours`; };
const season = c => {
  const total = Math.max(1, Math.round((new Date(c.end) - new Date(c.start)) / 864e5));
  const day = Math.min(total, Math.max(1, Math.round((Date.now() - new Date(c.start)) / 864e5)));
  return { total, day };
};

// Conseil du jour : pratiques générales, un nouveau chaque jour (contenu à valider par les agronomes).
const TIPS = [
  'Arrosez le matin, au pied des plants. Évitez de mouiller les feuilles.',
  'Retirez les feuilles mortes ou très abîmées pour que l\'air circule.',
  'Regardez vos plants chaque semaine : une photo vaut mieux qu\'un doute.',
  'Gardez de l\'espace entre les plants pour limiter les maladies.',
  'Lavez vos mains et nettoyez vos outils quand vous changez de parcelle.',
  'Notez ce que vous faites sur la parcelle : l\'historique aide à mieux décider.',
  'Évitez de traiter quand il y a du vent ou de la pluie.',
  'Prenez vos photos de près, en pleine lumière, sur une seule feuille.',
  'Après la récolte, enlevez les restes de culture de la parcelle.',
  'Changez de culture d\'une campagne à l\'autre quand c\'est possible.'
];
const tipOfDay = () => TIPS[Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 864e5) % TIPS.length];

// Bandeau de vigilance, déduit du dernier diagnostic.
function alertOf(l) {
  const old = l && (Date.now() - new Date(l.captured_at)) > 7 * 864e5;
  if (!l || old) return { cls: 'mid', ic: 'camera', b: 'Pas de diagnostic récent :', t: 'prenez une photo cette semaine', act: 'diagnose' };
  if (!l.problem) return { cls: 'mid', ic: 'clock', b: 'Analyse en attente :', t: 'elle démarre avec le réseau', act: 'open' };
  if (l.status === 'ANOMALY') return { cls: 'bad', ic: 'warn', b: 'Problème détecté :', t: l.problem, act: 'advice' };
  if (l.status === 'UNSURE') return { cls: 'mid', ic: 'eye', b: 'Résultat incertain :', t: 'refaites la photo', act: 'diagnose' };
  return { cls: 'ok', ic: 'sprout', b: 'Tout va bien :', t: 'vos plants sont en bonne santé', act: 'open' };
}

function skeleton() {
  return `<div class="shell">${offlineBar()}${brandTop()}<main class="home h3" aria-busy="true" aria-label="Chargement"><div class="sk" style="height:2.6rem;width:70%"></div><div class="sk" style="height:15rem"></div><div class="sk" style="height:6.5rem"></div><div class="sk" style="height:5rem"></div></main>${navbar('home')}</div>`;
}

function view(d) {
  const l = d.last, p = d.parcel, s = season(d.campaign), al = alertOf(l), queued = l && !l.problem;
  const v = l && l.problem ? verdict(l) : null;
  const lastCard = !l ? '' : `<section class="lc" aria-label="Dernier diagnostic"><button class="lc-main" data-act="open">
      <span class="lc-th">${l.photo ? `<img src="${l.photo}" alt="Photo du dernier diagnostic">` : pic(v ? v[2] : 'clock')}</span>
      <span class="lc-tx"><small>Dernier diagnostic · ${relDate(l.captured_at)}</small><strong>${queued ? 'Analyse en attente' : l.problem}</strong>
        <span class="lc-chip ${l.sync === 'SYNCED' ? '' : 'wait'}">${icon('clock')}${l.sync === 'SYNCED' ? 'En validation par un agronome' : 'En attente d\'envoi'}</span>
        ${queued ? '' : `<span class="lc-conf"><span class="bars" aria-hidden="true">${[1, 2, 3].map(i => `<i class="${i <= l.confidence ? 'f' : ''}"></i>`).join('')}</span>Confiance ${level(l.confidence)}</span>`}</span>${chev}</button>
      ${queued ? '' : '<button class="lc-link" data-act="advice">Voir quoi faire</button>'}</section>`;
  const faryLine = l && l.problem && l.status !== 'UNSURE' ? 'Le conseil de votre dernier diagnostic' : 'Faites un diagnostic pour recevoir un conseil';
  return `<div class="shell">${offlineBar()}${brandTop()}
  <main class="home h3">
    <div class="greet"><h1><span class="gi">${pic('sprout')}</span>Bonjour, ${d.first}</h1>${richPill()}</div>

    <section class="pc" aria-label="Parcelle active">
      <div class="pc-main">
        <button class="pc-qr" data-act="qr" aria-label="Afficher le QR code de la parcelle ${p.name}"><span class="pc-badge">Ma parcelle</span><span class="qrw">${qrSvg(p.agroid)}</span><span class="pc-id">${p.agroid}</span></button>
        <div class="pc-info"><p class="pc-name">${p.name}</p><h2>${p.crop}</h2><p class="pc-loc">${pic('pin')}${p.location} · ${p.area}</p>
          <button class="pc-row" data-act="parcel">${pic('sprout')}<span><b>Jour ${s.day}</b> sur ${s.total}<small>${d.campaign.label}</small></span>${chev}</button>
          <button class="pc-row" id="wx" data-act="weather">${pic('cloud')}<span><b>Météo</b><small>Voir les prévisions</small></span>${chev}</button></div>
      </div>
      <button class="pc-alert ${al.cls}" data-act="${al.act}">${pic(al.ic)}<span><b>${al.b}</b> ${al.t}</span>${chev}</button>
    </section>

    <button class="yc" data-act="diagnose"><span class="yc-ic">${pic('camera')}</span>
      <span class="yc-tx"><strong>Diagnostiquer ma culture</strong><small>1 photo = 1 diagnostic</small>
        <span class="yc-steps"><span>Photo</span>${pic('chevron')}<span>Résultat</span>${pic('chevron')}<span>Conseil audio</span></span></span>${chev}</button>

    <button class="gc" data-act="fary"><span class="gc-av"><img src="/assets/fary.png" alt=""></span>
      <span class="gc-tx"><strong>Écouter Fary</strong><small>${faryLine}</small></span>${chev}</button>

    <div class="g4">
      <button data-act="parcels"><span class="gi4">${pic('parcels')}</span>Mes parcelles</button>
      <button data-act="history"><span class="gi4">${pic('sprout')}</span>Mes diagnostics</button>
      <button data-act="weather"><span class="gi4">${pic('sun')}</span>Météo</button>
      <button data-act="help"><span class="gi4">${pic('help')}</span>Aide</button>
    </div>

    ${lastCard}
    <section class="dtip" aria-label="Conseil du jour"><span class="tip-ic">${pic('bulb')}</span><div><strong>Conseil du jour</strong><p>${tipOfDay()}</p></div>
      <button class="tip-say" data-act="say" aria-label="Écouter le conseil du jour">${pic('sound')}</button></section>
    <a class="wa" href="${waLink('Bonjour PEST AI, j\'ai une question sur l\'application.')}" target="_blank" rel="noopener noreferrer" aria-label="Une question ? Contactez-nous sur WhatsApp au +221 70 666 94 38">
      <img src="/assets/contact-whatsapp.webp" alt="Une question ? Contactez-nous. WhatsApp : +221 70 666 94 38" loading="lazy"></a>
  </main>${navbar('home')}</div>`;
}

export function mountHome(root) {
  ['shell', 'home', 'qr', 'home2', 'home3'].forEach(n => css(`/styles/${n}.css`));
  root.innerHTML = skeleton(); watchNetwork();
  let alive = true, data;
  api.home(ctx.user, ctx.parcel && ctx.parcel.id).then(d => {
    if (!alive) return;
    data = d; ctx.parcel = d.parcel;
    root.innerHTML = view(d); watchNetwork();
    const at = lastPosition() || { lat: d.parcel.lat, lon: d.parcel.lon };
    getWeather(at.lat, at.lon).then(w => {
      const el = alive && root.querySelector('#wx'); if (!el || !w) return;
      const { now, days } = w.data, [label, ic] = WMO(now.code), sp = spray(now, days[0].rain, now.code);
      el.innerHTML = `${pic(ic)}<span><b>${now.temp}° · ${label}</b><small class="sp ${sp.cls}">Pulvérisation : ${sp.word}</small></span>${chev}`;
    });
  });
  const unbind = bindNav(root, 'home', el => {
    if (!data) return true;
    const a = el.dataset.act, l = data.last;
    if (a === 'copy') { navigator.clipboard.writeText(data.parcel.agroid).then(() => toast('AgroID copié.'), () => toast('Copie impossible sur cet appareil.')); return true; }
    if (a === 'diagnose') { go('capture'); return true; }
    if (a === 'qr') { go('qr', { qrParcel: data.parcel, qrBack: 'home' }); return true; }
    if (a === 'weather') { go('weather'); return true; }
    if (a === 'parcel') { go('parcel', { viewId: data.parcel.id, campIdx: 0 }); return true; }
    if (a === 'parcels') { go('parcels'); return true; }
    if (a === 'history') { go('history'); return true; }
    if (a === 'help') { go('help'); return true; }
    if (a === 'open' && l) { go('result', { result: l, photo: null, back: 'home', detailParcel: null }); return true; }
    if (a === 'advice' && l && l.problem) { go('advice', { result: l, photo: null, back: 'home', detailParcel: null }); return true; }
    if (a === 'fary') { if (l && l.problem && l.status !== 'UNSURE') go('advice', { result: l, photo: null, back: 'home', detailParcel: null }); else go('capture'); return true; }
    if (a === 'say') {
      if (!('speechSynthesis' in window)) { toast('Audio indisponible sur ce téléphone.'); return true; }
      const u = new SpeechSynthesisUtterance('Conseil du jour. ' + tipOfDay()); u.lang = 'fr-FR'; speechSynthesis.cancel(); speechSynthesis.speak(u); return true;
    }
    return false;
  });
  return () => { alive = false; unbind(); if ('speechSynthesis' in window) speechSynthesis.cancel(); };
}
