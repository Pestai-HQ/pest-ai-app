import { pic } from './pictos.js';

// Codes météo (WMO) → texte et pictogramme.
const WMO = c => c === 0 ? ['Ciel dégagé', 'sun'] : c === 1 ? ['Plutôt dégagé', 'sun'] : c === 2 ? ['Partiellement nuageux', 'partly'] : c === 3 ? ['Nuageux', 'cloud']
  : (c === 45 || c === 48) ? ['Brouillard', 'cloud'] : (c >= 51 && c <= 67) ? [c <= 57 ? 'Bruine' : 'Pluie', 'rain'] : (c >= 80 && c <= 82) ? ['Averses', 'rain']
  : (c >= 95) ? ['Orage', 'storm'] : ['Variable', 'cloud'];

// Conditions de pulvérisation : indicateur simple selon le vent et le risque de pluie (à valider avec les agronomes).
export function spray(now, rain, code) {
  if (now.wind > 20 || rain >= 60 || code >= 95) return { cls: 'bad', word: 'À éviter' };
  if (now.wind > 12 || rain >= 40) return { cls: 'mid', word: 'Moyennes' };
  return { cls: 'ok', word: 'Bonnes' };
}

const dayName = (iso, i) => i === 0 ? 'Auj.' : new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '').replace(/^./, m => m.toUpperCase());
const ago = at => { const m = Math.round((Date.now() - at) / 60000); return m < 60 ? `il y a ${Math.max(1, m)} min` : m < 1440 ? `il y a ${Math.round(m / 60)} h` : `il y a ${Math.round(m / 1440)} j`; };

export const weatherPlaceholder = () => '<div class="sk" style="height:10.5rem"></div>';

export function weatherView(w, place) {
  if (!w) return `<div class="wx-off">${pic('cloud')}<div><strong>Météo indisponible</strong><span>Reconnectez-vous pour voir la météo de votre parcelle.</span></div></div>`;
  const { now, days } = w.data, [label, ic] = WMO(now.code), today = days[0], sp = spray(now, today.rain, now.code);
  return `<div class="wx-top"><span class="wx-ico">${pic(ic)}</span>
      <div class="wx-now"><strong>${now.temp}°</strong><span>${label}</span><span class="wx-place">${pic('pin')}${place}</span></div>
      <ul class="wx-meta"><li>${pic('wind')}<span>${now.wind} km/h</span></li><li>${pic('drop')}<span>${now.humidity} %</span></li></ul></div>
    <ul class="wx-days">${days.map((d, i) => `<li><b>${dayName(d.date, i)}</b><span class="wd">${pic(WMO(d.code)[1])}</span><span class="wt">${d.tmax}°<small>${d.tmin}°</small></span><span class="wr">${d.rain} %</span></li>`).join('')}</ul>
    <div class="spray ${sp.cls}">${pic('spray')}<div><span>Conditions de pulvérisation</span><strong>${sp.word}</strong></div><small>Vent ${now.wind} km/h · pluie ${today.rain} %</small></div>
    ${w.fresh ? '' : `<p class="wx-old">Météo reçue ${ago(w.at)}. Elle sera mise à jour avec le réseau.</p>`}`;
}
