import { go, ctx } from '../router.js';
import { pic } from '../components/pictos.js';
import { navbar, offlineBar, watchNetwork } from '../components/navbar.js';
import { bindNav } from '../components/nav.js';
import { WMO, spray, ago } from '../components/weather.js';
import { getWeather } from '../api/weather.js';
import { lastPosition, locate, permission, placeName } from '../api/geo.js';

const css = href => { if (!document.querySelector(`link[href="${href}"]`)) document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="${href}">`); };
const SRC = 'pestai.wx.source';
const dayName = (iso, i) => i === 0 ? 'Aujourd\'hui' : i === 1 ? 'Demain' : new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long' }).replace(/^./, m => m.toUpperCase());
const GEO_MSG = { denied: 'La position est bloquée. Autorisez-la dans les réglages du navigateur pour avoir la météo de l\'endroit où vous êtes.', timeout: 'La position n\'a pas pu être trouvée. Réessayez en extérieur.', unavailable: 'La position n\'est pas disponible pour le moment.', unsupported: 'Ce téléphone ne permet pas la géolocalisation.' };

export function mountWeather(root) {
  ['shell', 'home', 'history', 'weather'].forEach(n => css(`/styles/${n}.css`));
  const parcel = ctx.parcel || { lat: 14.85, lon: -16.95, location: 'Ma parcelle' };
  let alive = true, w = null, place = '', busy = false, msg = '', perm = 'unknown', pos = lastPosition();
  let source = localStorage.getItem(SRC) || (pos ? 'me' : 'parcel');
  const coords = () => (source === 'me' && pos ? pos : { lat: parcel.lat, lon: parcel.lon });

  const view = () => {
    const needPos = source === 'me' && !pos;
    let body;
    if (needPos) {
      body = `<div class="gcard">${pic('pin')}<div><strong>Utiliser ma position</strong><p>Pour la météo de l'endroit où vous êtes. Votre position reste sur votre téléphone.</p>
        ${msg ? `<p class="gmsg" role="alert">${msg}</p>` : ''}<button class="btn main" data-act="locate">${busy ? 'Recherche…' : 'Autoriser la position'}</button></div></div>`;
    } else if (!w) {
      body = `<div class="gcard">${pic('cloud')}<div><strong>Météo indisponible</strong><p>Reconnectez-vous pour voir la météo.</p></div></div>`;
    } else {
      const { now, hours, days } = w.data, [label, ic] = WMO(now.code), sp = spray(now, days[0].rain, now.code);
      body = `<section class="wp-now"><span class="wp-ico">${pic(ic)}</span><div><strong>${now.temp}°</strong><span>${label}</span></div>
          <ul><li>${pic('wind')}<span>Vent ${now.wind} km/h</span></li><li>${pic('drop')}<span>Humidité ${now.humidity} %</span></li></ul></section>
        <section class="spray ${sp.cls}" aria-label="Conditions de pulvérisation">${pic('spray')}<div><span>Conditions de pulvérisation</span><strong>${sp.word}</strong></div><small>Vent ${now.wind} km/h · pluie ${days[0].rain} % aujourd'hui</small>
          <p>Traitez quand le vent est faible et qu'il ne pleut pas. Indicatif.</p></section>
        <section><h2 class="wp-h">Prochaines heures</h2><ul class="wp-hours">${hours.map((h, i) => `<li><b>${i === 0 ? 'Maint.' : h.h + ' h'}</b><span class="wd">${pic(WMO(h.code)[1])}</span><span class="wt">${h.temp}°</span><span class="wr">${h.rain} %</span></li>`).join('')}</ul></section>
        <section><h2 class="wp-h">7 prochains jours</h2><ul class="wp-days">${days.map((d, i) => `<li><span class="dn">${dayName(d.date, i)}</span><span class="wd">${pic(WMO(d.code)[1])}</span><span class="wr">${pic('drop')}${d.rain} %</span><span class="wt">${d.tmax}°<small>${d.tmin}°</small></span></li>`).join('')}</ul></section>
        ${w.fresh ? '' : `<p class="wx-old">Météo reçue ${ago(w.at)}. Elle sera mise à jour avec le réseau.</p>`}
        <p class="wp-src">Données météo : Open-Meteo</p>`;
    }
    root.innerHTML = `<div class="shell">${offlineBar()}<header class="bar"><button class="ghost dark" id="back" data-act="back">← Accueil</button></header>
      <main class="wxp"><div class="hhead"><h1>Météo</h1><p class="wp-place">${pic('pin')}${place || (needPos ? 'Position non autorisée' : '…')}</p></div>
        <div class="seg2" role="group" aria-label="Lieu de la météo"><button data-act="src" data-v="me" aria-pressed="${source === 'me'}">Ma position</button><button data-act="src" data-v="parcel" aria-pressed="${source === 'parcel'}">Ma parcelle</button></div>
        ${msg && !needPos ? `<p class="gmsg" role="alert">${msg}</p>` : ''}
        ${source === 'me' && pos ? `<button class="link" data-act="relocate">${busy ? 'Recherche…' : 'Actualiser ma position'}</button>` : ''}
        ${body}</main>${navbar('home')}</div>`;
    watchNetwork();
  };

  const load = async () => {
    const c = coords();
    w = await getWeather(c.lat, c.lon);
    place = source === 'me' && pos ? await placeName(c) : parcel.location;
    if (alive) view();
  };
  const ask = async () => {
    busy = true; msg = ''; view();
    try { pos = await locate(); source = 'me'; localStorage.setItem(SRC, 'me'); busy = false; await load(); }
    catch (e) { busy = false; msg = GEO_MSG[e.code] || GEO_MSG.unavailable; if (e.code === 'denied') { source = 'parcel'; } if (alive) { view(); if (source === 'parcel') load(); } }
  };

  permission().then(p => { perm = p; });
  view();
  if (source === 'me' && !pos) { /* attend le geste de l'utilisateur pour demander l'autorisation */ } else load();

  const unbind = bindNav(root, 'weather', el => {
    const a = el.dataset.act;
    if (a === 'back') { go('home'); return true; }
    if (a === 'src') {
      source = el.dataset.v; localStorage.setItem(SRC, source); msg = '';
      if (source === 'me' && !pos) { view(); return true; }
      w = null; place = ''; view(); load(); return true;
    }
    if (a === 'locate' || a === 'relocate') { ask(); return true; }
    return false;
  });
  return () => { alive = false; unbind(); };
}
