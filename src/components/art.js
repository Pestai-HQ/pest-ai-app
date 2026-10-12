// Visuels de la présentation : de vraies « cartes » de l'application, en verre sur fond sombre.
import { fieldDisc } from './field.js';
import { qrSvg } from './qr.js';
import { pic } from './pictos.js';

// Ouverture : le champ à pivot, qui tourne très lentement.
export const heroArt = () => `<div class="ob-hero" aria-hidden="true"><svg viewBox="0 0 320 320">${fieldDisc({ cx: 160, cy: 160, r: 150, gap: '#0E2A1A', dot: 12 })}</svg></div>`;

// 1 · AgroID : la carte d'identité de la parcelle avec son QR code.
export const cardAgroid = () => `<div class="gl gl-id">
  <div class="gl-head"><span class="tile sm"><img src="/assets/logo-mark.png" alt=""></span><div><small>ID PARCELLE</small><b>SN-TH-00194</b></div><span class="gl-ok">${pic('check')}Enrôlée</span></div>
  <div class="gl-qr"><i></i><i></i><i></i><i></i><span>${qrSvg('SN-TH-00194')}</span></div>
  <div class="gl-foot"><span>Tomate · 1,2 ha</span><span>Niayes, Thiès</span></div></div>`;

// 2 · Diagnostic : une feuille, le cadre de scan et le résultat.
export const cardDiag = () => `<div class="gl gl-diag">
  <div class="gl-leaf"><svg viewBox="0 0 280 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4DBB7C"/><stop offset="1" stop-color="#0B7F3F"/></linearGradient></defs>
    <rect width="280" height="150" fill="rgba(255,255,255,.06)"/>
    <g transform="translate(14 -6) rotate(-10 130 80)"><path d="M6 100C14 36 90 4 232 12c4 84-60 150-174 128-26-6-46-24-52-40z" fill="url(#lg)"/>
    <path d="M14 112C80 92 150 60 216 22" stroke="rgba(255,255,255,.5)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <g fill="#8A5A2B"><ellipse cx="100" cy="96" rx="13" ry="9"/><ellipse cx="160" cy="76" rx="9" ry="7"/><ellipse cx="72" cy="120" rx="7" ry="5"/></g></g>
    <g fill="none" stroke="#FDBC07" stroke-width="4" stroke-linecap="round"><path d="M34 34V18h16M246 34V18h-16M34 118v16h16M246 118v16h-16"/></g></svg></div>
  <div class="gl-res"><span class="gl-ic">${pic('fungus')}</span><div><b>Mildiou de la tomate</b><small>Problème détecté</small></div></div>
  <div class="gl-meter"><i class="f"></i><i class="f"></i><i></i><span>Assez sûr</span></div></div>`;

// 3 · Fary : l'assistant qui lit le conseil.
export const cardFary = () => `<div class="gl gl-fary">
  <div class="gf-av"><img src="/assets/fary.png" alt="Fary, l'assistant vocal"></div>
  <div class="gf-bub"><span>${pic('sound')}</span><p>Coupez les feuilles très touchées.</p></div>
  <div class="gf-eq" aria-hidden="true">${'<i></i>'.repeat(22)}</div></div>`;
