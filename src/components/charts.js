// Petits graphiques SVG sans bibliothèque : anneau (cycles), jauge (indicateur), courbe (rendements).
const G = '#10A452', Y = '#FDBC07', TRACK = '#DCE8E0';

// Anneau : un arc par campagne (vert = terminée, jaune = en cours), le nombre total au centre.
export function donut(cycles) {
  const n = cycles.length, r = 36, C = 2 * Math.PI * r, gap = n > 1 ? 5 : 0, len = C / n - gap;
  const arcs = cycles.map((c, i) => `<circle cx="48" cy="48" r="${r}" fill="none" stroke="${c === 'OPEN' ? Y : G}" stroke-width="12" stroke-linecap="butt" stroke-dasharray="${len.toFixed(1)} ${(C - len).toFixed(1)}" stroke-dashoffset="${(-i * C / n).toFixed(1)}" transform="rotate(-90 48 48)"/>`).join('');
  return `<svg viewBox="0 0 96 96" role="img" aria-label="${n} cycles de culture"><circle cx="48" cy="48" r="${r}" fill="none" stroke="${TRACK}" stroke-width="12"/>${arcs}
    <text x="48" y="50" text-anchor="middle" font-size="26" font-weight="700" fill="#12351F">${n}</text><text x="48" y="64" text-anchor="middle" font-size="10" font-weight="600" fill="#4F5F56">${n > 1 ? 'cycles' : 'cycle'}</text></svg>`;
}

// Jauge en demi-cercle de 0 à 100 : l'échelle est dégradée (vert → jaune), un repère blanc marque la valeur.
export function gauge(value) {
  const R = 56, f = Math.max(0, Math.min(100, value)) / 100, a = Math.PI * (1 - f);
  const x = 70 + R * Math.cos(a), y = 68 - R * Math.sin(a), arc = 'M14 68A56 56 0 0 1 126 68';
  return `<svg viewBox="0 0 140 80" role="img" aria-label="Indicateur ${value} sur 100"><defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="${G}"/><stop offset=".55" stop-color="#8CC63F"/><stop offset="1" stop-color="${Y}"/></linearGradient></defs>
    <path d="${arc}" fill="none" stroke="url(#gg)" stroke-width="12" stroke-linecap="round"/>
    <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="#fff" stroke="#12351F" stroke-width="3"/></svg>`;
}

// Courbe avec aire dégradée ; le dernier point est marqué.
export function spark(values, w = 150, h = 56) {
  if (values.length < 2) return '';
  const min = Math.min(...values), max = Math.max(...values), span = max - min || 1, pad = 6;
  const pts = values.map((v, i) => [pad + i * (w - pad * 2) / (values.length - 1), h - pad - (v - min) / span * (h - pad * 2)]);
  const line = pts.map(p => p.map(n => n.toFixed(1)).join(',')).join(' '), last = pts[pts.length - 1];
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Évolution du rendement"><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${G}" stop-opacity=".28"/><stop offset="1" stop-color="${G}" stop-opacity="0"/></linearGradient></defs>
    <polygon points="${pad},${h} ${line} ${w - pad},${h}" fill="url(#sg)"/><polyline points="${line}" fill="none" stroke="${G}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="4" fill="${G}"/></svg>`;
}
