import { go, ctx } from '../router.js';
import { fromVideo, fromFile } from '../components/photo.js';
import { ic } from '../components/icons.js';

export function mountCapture(root) {
  root.innerHTML = `<div class="cap">
    <video id="vid" playsinline muted autoplay></video><div class="shade"></div>
    <header class="cap-top"><button class="ghost" id="cancel">Annuler</button><span class="where">${ctx.parcel.name}</span></header>
    <div class="frame" aria-hidden="true"><i></i><i></i><i></i><i></i><span class="tip">Cadrez une feuille touchée</span></div>
    <div class="cap-bottom">
      <ul class="checks"><li>${ic('sun')}Lumière</li><li>${ic('focus')}Netteté</li><li>${ic('leaf')}Une feuille</li></ul>
      <button class="shutter" id="shutter" aria-label="Prendre la photo" disabled><span></span></button>
      <span class="lbl">Prendre la photo</span>
    </div>
    <div class="nocam" id="nocam" hidden role="alert"><div>${ic('camera')}<h2>Caméra indisponible</h2><p id="nocam-msg"></p>
      <button class="btn main" id="fallback">Ouvrir l'appareil photo du téléphone</button></div></div>
    <input id="file" type="file" accept="image/*" capture="environment" hidden>
    <div class="flash" id="flash"></div></div>`;
  const $ = s => root.querySelector(s);
  let stream, alive = true;
  const stop = () => { alive = false; if (stream) stream.getTracks().forEach(t => t.stop()); };
  const noCam = kind => {
    $('#nocam').hidden = false; $('#shutter').disabled = true;
    $('#nocam-msg').textContent = kind === 'denied'
      ? 'L\'accès à la caméra est refusé. Autorisez-le dans le navigateur, ou utilisez l\'appareil photo du téléphone.'
      : 'La caméra n\'est pas disponible ici. Utilisez l\'appareil photo du téléphone.';
  };
  (async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return noCam('none');
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false });
      if (!alive) return stop();
      const v = $('#vid'); v.srcObject = stream; await v.play(); $('#shutter').disabled = false;
    } catch (e) { noCam(e && e.name === 'NotAllowedError' ? 'denied' : 'error'); }
  })();
  $('#cancel').onclick = () => go('home');
  $('#shutter').onclick = () => {
    const v = $('#vid'); if (!v.videoWidth) return;
    $('#flash').classList.add('on'); if (navigator.vibrate) navigator.vibrate(15);
    ctx.photo = fromVideo(v); go('verify');
  };
  $('#fallback').onclick = () => $('#file').click();
  $('#file').onchange = async e => { const f = e.target.files[0]; if (!f) return; ctx.photo = await fromFile(f); go('verify'); };
  return stop;
}
