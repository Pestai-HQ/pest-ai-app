// Illustrations de l'accueil et de la présentation (dessinées, aux couleurs du logo).
import { fieldDisc } from './field.js';
import { qrSvg } from './qr.js';
import { pic } from './pictos.js';

// Feuille décorative (jaune ou verte), posée dans les coins des écrans.
export const leaf = (color, rot = 0, size = 64) => `<svg class="au-leaf" width="${size}" height="${size}" viewBox="0 0 50 50" style="transform:rotate(${rot}deg)" aria-hidden="true"><path d="M2 42C2 16 20 3 46 3c0 26-14 42-44 39z" fill="${color}"/><path d="M6 40C18 28 30 18 42 8" stroke="rgba(255,255,255,.55)" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`;

// Lancement : un champ à pivot vu du ciel, grand, rogné par le coin.
export const welcomeArt = () => `<svg class="au-wart" viewBox="0 0 390 420" preserveAspectRatio="xMaxYMin slice" aria-hidden="true">${fieldDisc({ cx: 292, cy: 190, r: 150, gap: '#12351F', spin: true, dot: 10 })}</svg>`;

// 1/4 AgroID : un paysage de parcelles, le QR et l'AgroID.
export const artAgroid = () => `<div class="au-art a1"><svg viewBox="0 0 340 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <rect width="340" height="250" fill="#CFE8D4"/>
  <g stroke="#CFE8D4" stroke-width="4"><rect x="0" y="0" width="120" height="90" fill="#4DBB7C"/><rect x="120" y="0" width="110" height="70" fill="#86D0A3"/><rect x="230" y="0" width="110" height="100" fill="#10A452"/>
  <rect x="0" y="90" width="90" height="80" fill="#0B7F3F"/><rect x="90" y="70" width="140" height="70" fill="#E6DAAE"/><rect x="230" y="100" width="110" height="80" fill="#4DBB7C"/>
  <rect x="0" y="170" width="140" height="80" fill="#10A452"/><rect x="90" y="140" width="140" height="110" fill="#86D0A3"/><rect x="230" y="180" width="110" height="70" fill="#0B7F3F"/></g>
  <g fill="none" stroke="rgba(11,58,30,.18)" stroke-width="1.2"><path d="M0 24h120M0 44h120M0 64h120M230 20h110M230 40h110M230 60h110M230 80h110"/><path d="M20 90v80M40 90v80M60 90v80"/></g>
  <g>${fieldDisc({ cx: 185, cy: 108, r: 48, gap: '#CFE8D4', dot: 6 })}</g></svg>
  <div class="a1-card"><span class="a1-qr">${qrSvg('SN-TH-00194')}</span><div><small>AgroID</small><b>SN-TH-00194</b></div></div></div>`;

// 2/4 Diagnostic : une feuille tachée, le cadre de scan et le résultat.
export const artDiag = () => `<div class="au-art a2"><svg viewBox="0 0 340 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4DBB7C"/><stop offset="1" stop-color="#0B7F3F"/></linearGradient></defs>
  <rect width="340" height="250" fill="#DDEFE2"/>
  <g transform="translate(22 12) rotate(-12 150 110)"><path d="M10 120C20 40 110 4 270 14c4 100-70 196-206 168-30-8-52-30-54-62z" fill="url(#lg)"/>
  <path d="M18 136C90 110 170 70 250 26" stroke="rgba(255,255,255,.55)" stroke-width="3" fill="none" stroke-linecap="round"/>
  <g stroke="rgba(255,255,255,.35)" stroke-width="2" fill="none" stroke-linecap="round"><path d="M70 118l16-34M110 100l20-38M150 80l22-38M190 60l22-32M90 126l-8 34M140 108l-6 38M190 86l-4 38"/></g>
  <g fill="#8A5A2B"><ellipse cx="120" cy="120" rx="15" ry="11"/><ellipse cx="190" cy="96" rx="11" ry="8"/><ellipse cx="86" cy="150" rx="9" ry="7"/><ellipse cx="170" cy="140" rx="7" ry="5"/></g>
  <g fill="#E1B84F" opacity=".75"><ellipse cx="120" cy="120" rx="21" ry="16" opacity=".35"/><ellipse cx="190" cy="96" rx="16" ry="12" opacity=".35"/></g></g>
  <g fill="none" stroke="#FDBC07" stroke-width="5" stroke-linecap="round"><path d="M60 52V32h20M280 52V32h-20M60 196v20h20M280 196v20h-20"/></g></svg>
  <div class="a2-chip">${pic('fungus')}<div><b>Mildiou de la tomate</b><small>Assez sûr</small></div></div></div>`;

// 3/4 Fary : l'assistant vocal qui lit le conseil.
export const artFary = () => `<div class="au-art a3"><svg class="a3-w" viewBox="0 0 60 120" aria-hidden="true"><path d="M14 40q16 20 0 40"/><path d="M26 28q26 32 0 64"/><path d="M38 16q36 44 0 88"/></svg>
  <img src="/assets/fary.png" alt="Fary, l'assistant vocal"><div class="a3-bubble"><span>${pic('sound')}</span><p>Coupez les feuilles très touchées.</p></div></div>`;

// 4/4 Prêt : le téléphone avec Fary, la sauvegarde et le scan.
export const artReady = () => `<div class="au-art a4"><div class="a4-ring"></div>
  <div class="a4-phone"><div class="a4-screen"><img src="/assets/fary.png" alt=""><i></i><i></i></div></div>
  <span class="a4-b b1">${pic('cloudup')}</span><span class="a4-b b2">${pic('scan')}</span></div>`;
