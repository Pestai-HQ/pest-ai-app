import { api } from '../api/mock.js';
import { go, ctx } from '../router.js';
import { qrSvg } from '../components/qr.js';
import { navbar, icon, toast, topbar, offlineBar, watchNetwork } from '../components/navbar.js';
import { bindNav } from '../components/nav.js';
import { pic } from '../components/pictos.js';
import { getWeather } from '../api/weather.js';
import { weatherBar } from '../components/weather.js';
import { lastPosition } from '../api/geo.js';

const css = href => { if (!document.querySelector(`link[href="${href}"]`)) document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="${href}">`); };
const leaf = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15z"/><path d="M5 19c3-5 6-8 10-10"/></svg>';

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const today = () => cap(new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }));
const relDate = iso => { const d = Math.round((Date.now() - new Date(iso)) / 864e5); return d <= 0 ? 'Aujourd\'hui' : d === 1 ? 'Hier' : `Il y a ${d} jours`; };
const level = n => ['', 'faible', 'moyenne', 'élevée'][n];
const season = c => {
  const total = Math.max(1, Math.round((new Date(c.end) - new Date(c.start)) / 864e5));
  const day = Math.min(total, Math.max(1, Math.round((Date.now() - new Date(c.start)) / 864e5)));
  return { total, day, pct: Math.round(day / total * 100) };
};

function skeleton() {
  return `<div class="shell">${offlineBar()}${topbar()}
  <main class="home" aria-busy="true" aria-label="Chargement"><div class="sk" style="height:3.2rem;width:62%"></div><div class="sk" style="height:12.5rem"></div><div class="sk" style="height:4rem"></div><div class="sk" style="height:10rem"></div></main>${navbar('home')}</div>`;
}

function view(d) {
  const l = d.last, p = d.parcel, s = season(d.campaign), queued = l && !l.problem;
  let last;
  if (!l) last = '<div class="head"><h3>Dernier diagnostic</h3></div><p class="empty-last">Aucun diagnostic pour cette parcelle. Photographiez une feuille touchée pour commencer.</p>';
  else {
    const badge = `<span class="badge" ${l.sync === 'SYNCED' ? '' : 'data-wait="true"'}>${icon(l.sync === 'SYNCED' ? 'check' : 'clock')}${l.sync === 'SYNCED' ? 'Envoyé' : 'En attente d\'envoi'}</span>`;
    const thumb = `<div class="thumb">${l.photo ? `<img src="${l.photo}" alt="Photo du dernier diagnostic">` : leaf}</div>`;
    last = `<div class="head"><h3>Dernier diagnostic</h3>${badge}</div>
      <div class="row">${thumb}<div><strong>${queued ? 'Analyse en attente' : l.problem}</strong><div class="sub">${relDate(l.captured_at)}</div></div></div>` +
      (queued ? '' : `<div class="conf"><span class="bars" aria-hidden="true">${[1, 2, 3].map(i => `<i class="${i <= l.confidence ? 'f' : ''}"></i>`).join('')}</span>Confiance ${level(l.confidence)}</div>`) +
      `<button class="more" data-act="open">Voir le résultat</button>`;
  }
  return `<div class="shell">${offlineBar()}${topbar()}
  <main class="home">
    <div class="hello"><h1>Bonjour, ${d.first}</h1><p class="date">${today()}</p></div>
    <button class="wxbar" id="wx" data-act="weather" aria-label="Voir la météo détaillée">${weatherBar(null)}</button>
    <section class="parcel" aria-label="Parcelle active">
      <div class="ptop"><div class="pleft"><p class="label">Parcelle active</p><h2>${p.name}</h2><p class="meta">${p.crop} · ${p.area}</p></div>
        <button class="qrtile" data-act="qr" aria-label="Afficher le QR code de la parcelle ${p.name}"><span class="qrbox">${qrSvg(p.agroid)}</span><span>Mon QR code</span></button></div>
      <button class="chip" data-act="copy" data-code="${p.agroid}" aria-label="Copier l'AgroID ${p.agroid}">${p.agroid}${icon('copy')}</button>
      <div class="progress"><div class="row"><span>${d.campaign.label}</span><span>Jour ${s.day} sur ${s.total}</span></div>
        <div class="track" role="progressbar" aria-label="Avancement de la campagne" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.pct}"><i style="width:${s.pct}%"></i></div></div>
    </section>
    <section class="dcard" aria-label="Faire un diagnostic">
      <ol class="journey">
        <li><span class="jp">${pic('camera')}</span><span>Prenez une photo</span></li><li class="jc" aria-hidden="true">${pic('chevron')}</li>
        <li><span class="jp">${pic('sprout')}</span><span>Lisez le résultat</span></li><li class="jc" aria-hidden="true">${pic('chevron')}</li>
        <li><span class="jp jf"><img src="/assets/fary.png" alt=""></span><span>Écoutez le conseil</span></li>
      </ol>
      <button class="cta" data-act="diagnose">${icon('camera')}Diagnostiquer</button>
    </section>
    <section class="last" aria-label="Dernier diagnostic">${last}</section>
    <a class="wa" href="https://wa.me/221706669438?text=${encodeURIComponent('Bonjour PEST AI, j\'ai une question sur l\'application.')}" target="_blank" rel="noopener noreferrer" aria-label="Une question ? Contactez-nous sur WhatsApp au +221 70 666 94 38">
      <img src="/assets/contact-whatsapp.webp" alt="Une question ? Contactez-nous. WhatsApp : +221 70 666 94 38" loading="lazy"></a>
  </main>${navbar('home')}</div>`;
}

export function mountHome(root) {
  css('/styles/shell.css'); css('/styles/home.css'); css('/styles/qr.css'); css('/styles/home2.css');
  root.innerHTML = skeleton(); watchNetwork();
  let alive = true, data;
  api.home(ctx.user, ctx.parcel && ctx.parcel.id).then(d => {
    if (!alive) return;
    data = d; ctx.parcel = d.parcel;
    root.innerHTML = view(d); watchNetwork();
    const at = lastPosition() || { lat: d.parcel.lat, lon: d.parcel.lon };
    getWeather(at.lat, at.lon).then(w => { const el = alive && root.querySelector('#wx'); if (el && w) el.innerHTML = weatherBar(w); });
  });
  const unbind = bindNav(root, 'home', el => {
    if (!data) return true;
    if (el.dataset.act === 'copy') { navigator.clipboard.writeText(el.dataset.code).then(() => toast('AgroID copié.'), () => toast('Copie impossible sur cet appareil.')); return true; }
    if (el.dataset.act === 'diagnose') { go('capture'); return true; }
    if (el.dataset.act === 'weather') { go('weather'); return true; }
    if (el.dataset.act === 'qr') { go('qr', { qrParcel: data.parcel, qrBack: 'home' }); return true; }
    if (el.dataset.act === 'open') { go('result', { result: data.last, photo: null, back: 'home', detailParcel: null }); return true; }
    return false;
  });
  return () => { alive = false; unbind(); };
}
