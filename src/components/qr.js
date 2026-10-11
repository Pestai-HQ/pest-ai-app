// QR code de la parcelle : il ne contient que le code AgroID (aucune donnée personnelle).
import { qrMatrix } from '../lib/qr.js';

// SVG net à toutes les tailles ; marge blanche de 2 cases autour du code.
export function qrSvg(text, label = 'QR code de la parcelle') {
  const m = qrMatrix(text, 'Q'), n = m.length, q = 2, W = n + q * 2;
  let d = '';
  m.forEach((row, y) => { let x = 0; while (x < n) { if (!row[x]) { x++; continue; } let e = x; while (e < n && row[e]) e++; d += `M${x + q} ${y + q}h${e - x}v1h-${e - x}z`; x = e; } });
  return `<svg viewBox="0 0 ${W} ${W}" shape-rendering="crispEdges" role="img" aria-label="${label}"><rect width="${W}" height="${W}" fill="#fff"/><path d="${d}" fill="#0B1929"/></svg>`;
}

// Image PNG (code + AgroID en dessous) pour l'enregistrer ou l'imprimer.
export function qrPng(text, name) {
  const m = qrMatrix(text, 'H'), n = m.length, quiet = 4, px = Math.floor(900 / (n + quiet * 2)), side = px * (n + quiet * 2), pad = 60;
  const c = document.createElement('canvas'); c.width = side + pad * 2; c.height = side + pad * 2 + 150;
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#0B1929';
  m.forEach((row, r) => row.forEach((on, k) => { if (on) x.fillRect(pad + (k + quiet) * px, pad + (r + quiet) * px, px, px); }));
  x.textAlign = 'center'; x.font = '700 64px sans-serif'; x.fillText(text, c.width / 2, side + pad + 70);
  x.font = '400 40px sans-serif'; x.fillStyle = '#4F5F56'; x.fillText(name, c.width / 2, side + pad + 130);
  return c.toDataURL('image/png');
}
