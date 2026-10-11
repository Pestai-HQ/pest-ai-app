import { go, ctx } from '../router.js';
import { toast } from '../components/navbar.js';
import { ic } from '../components/icons.js';
import { qrSvg, qrPng } from '../components/qr.js';

export function mountQr(root) {
  const p = ctx.qrParcel || ctx.parcel, fromParcel = ctx.qrBack === 'parcel';
  root.innerHTML = `<div class="qrs">
    <header class="bar"><button class="ghost dark" id="back">← ${fromParcel ? 'Parcelle' : 'Accueil'}</button></header>
    <main class="qr-main">
      <div><p class="kicker">Ma parcelle</p><h1>Mon QR code</h1><p class="lead">Montrez ce code à votre agent. Il ouvre votre parcelle.</p></div>
      <div class="qr-card"><div class="qr-big">${qrSvg(p.agroid, 'QR code de la parcelle ' + p.name)}</div><p class="qr-name">${p.name}</p><p class="qr-id">${p.agroid}</p></div>
      <div class="qr-tip">${ic('sun')}<p>Montez la luminosité de l'écran pour que l'agent puisse le scanner.</p></div>
      <div class="qr-actions"><button class="btn out" id="copy">Copier l'AgroID</button><button class="btn out" id="save">Enregistrer l'image</button></div>
    </main></div>`;
  const $ = s => root.querySelector(s);
  $('#back').onclick = () => go(fromParcel ? 'parcel' : 'home');
  $('#copy').onclick = () => navigator.clipboard.writeText(p.agroid).then(() => toast('AgroID copié.'), () => toast('Copie impossible sur cet appareil.'));
  $('#save').onclick = () => {
    const a = document.createElement('a'); a.href = qrPng(p.agroid, p.name); a.download = `AgroID-${p.agroid}.png`;
    document.body.appendChild(a); a.click(); a.remove(); toast('Image enregistrée.');
  };
  // L'écran reste allumé tant que le code est affiché (l'agent doit pouvoir le scanner).
  let lock = null;
  if (navigator.wakeLock) navigator.wakeLock.request('screen').then(l => { lock = l; }).catch(() => {});
  return () => { if (lock) lock.release().catch(() => {}); };
}
