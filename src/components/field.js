// Illustration commune : vue aérienne d'un champ à pivot (secteurs de cultures). Utilisée sur la connexion et l'accueil.
const FILLS = ['#0B7F3F', '#10A452', '#4DBB7C', '#0B7F3F', '#86D0A3', '#10A452', '#FDBC07', '#4DBB7C'];
export function fieldDisc({ cx, cy, r, gap = '#fff', spin = false, dot = 9 }) {
  const n = FILLS.length, pt = (a, rad) => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  const sectors = FILLS.map((f, i) => {
    const a0 = (i / n) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
    const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r);
    return `<path d="M${cx} ${cy}L${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}Z" fill="${f}" stroke="${gap}" stroke-width="2.5" stroke-linejoin="round"/>`;
  }).join('');
  const tracks = [0.34, 0.67].map(k => `<circle cx="${cx}" cy="${cy}" r="${r * k}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1.5"/>`).join('');
  const body = `${sectors}${tracks}`;
  return `${spin ? `<g class="spin" style="transform-origin:${cx}px ${cy}px">${body}</g>` : body}<circle cx="${cx}" cy="${cy}" r="${dot + 4}" fill="#fff"/><circle cx="${cx}" cy="${cy}" r="${dot}" fill="#FDBC07"/>`;
}
