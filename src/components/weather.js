import { pic } from './pictos.js';

// Codes météo (WMO) → texte et pictogramme.
export const WMO = c => c === 0 ? ['Ciel dégagé', 'sun'] : c === 1 ? ['Plutôt dégagé', 'sun'] : c === 2 ? ['Partiellement nuageux', 'partly'] : c === 3 ? ['Nuageux', 'cloud']
  : (c === 45 || c === 48) ? ['Brouillard', 'cloud'] : (c >= 51 && c <= 67) ? [c <= 57 ? 'Bruine' : 'Pluie', 'rain'] : (c >= 80 && c <= 82) ? ['Averses', 'rain']
  : (c >= 95) ? ['Orage', 'storm'] : ['Variable', 'cloud'];

// Conditions de pulvérisation : indicateur simple selon le vent et le risque de pluie (à valider avec les agronomes).
export function spray(now, rain, code) {
  if (now.wind > 20 || rain >= 60 || code >= 95) return { cls: 'bad', word: 'À éviter' };
  if (now.wind > 12 || rain >= 40) return { cls: 'mid', word: 'Moyennes' };
  return { cls: 'ok', word: 'Bonnes' };
}

export const ago = at => { const m = Math.round((Date.now() - at) / 60000); return m < 60 ? `il y a ${Math.max(1, m)} min` : m < 1440 ? `il y a ${Math.round(m / 60)} h` : `il y a ${Math.round(m / 1440)} j`; };

// Petite barre de l'accueil : un toucher ouvre la page Météo.
export function weatherBar(w) {
  if (!w) return `<span class="wxb-ico">${pic('cloud')}</span><span class="wxb-main"><strong>Météo</strong><span>Voir les prévisions</span></span><span class="wxb-chev">${pic('chevron')}</span>`;
  const { now, days } = w.data, [label, ic] = WMO(now.code), sp = spray(now, days[0].rain, now.code);
  return `<span class="wxb-ico">${pic(ic)}</span>
    <span class="wxb-main"><strong>${now.temp}° · ${label}</strong><span class="wxb-sp ${sp.cls}">${pic('spray')}Pulvérisation : ${sp.word}</span></span>
    <span class="wxb-chev">${pic('chevron')}</span>`;
}
