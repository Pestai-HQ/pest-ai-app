// Photo : réduction (stockable hors connexion) et contrôle rapide de qualité (lumière, netteté).
const load = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
function draw(src, w, h, max, q) {
  const k = Math.min(1, max / Math.max(w, h)), c = document.createElement('canvas');
  c.width = Math.round(w * k); c.height = Math.round(h * k);
  c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', q);
}
export const fromVideo = (v, max = 1024) => draw(v, v.videoWidth, v.videoHeight, max, 0.82);
export async function fromFile(file, max = 1024) {
  const url = URL.createObjectURL(file);
  try { const i = await load(url); return draw(i, i.width, i.height, max, 0.82); } finally { URL.revokeObjectURL(url); }
}
export async function thumb(dataUrl, max = 480) { const i = await load(dataUrl); return draw(i, i.width, i.height, max, 0.62); }

// Contrôle rapide (indicatif, côté téléphone) : luminosité moyenne et netteté (variation entre pixels voisins).
export async function quality(dataUrl) {
  const i = await load(dataUrl), W = 96, H = 72, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(i, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data, g = new Float32Array(W * H);
  let sum = 0;
  for (let p = 0; p < W * H; p++) { g[p] = 0.299 * d[p * 4] + 0.587 * d[p * 4 + 1] + 0.114 * d[p * 4 + 2]; sum += g[p]; }
  let e = 0;
  for (let y = 0; y < H - 1; y++) for (let xx = 0; xx < W - 1; xx++) { const p = y * W + xx; e += Math.abs(g[p] - g[p + 1]) + Math.abs(g[p] - g[p + W]); }
  const mean = sum / (W * H), edge = e / (W * H);
  return { dark: mean < 60, bright: mean > 225, blur: edge < 1.8 };
}
