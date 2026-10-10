import { api } from '../api/mock.js';

// Anneaux concentriques = vue aérienne d'un pivot d'irrigation. Le point jaune reprend celui du logo.
const rings = Array.from({ length: 12 }, (_, i) => {
  const r = 480 - i * 40;
  return `<circle cx="250" cy="96" r="${r}" fill="${i % 2 ? '#1d5232' : '#184429'}" stroke="rgba(255,255,255,.07)"/>`;
}).join('');
const pivot = `<svg viewBox="0 0 390 380" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${rings}
  <g class="arm"><line x1="250" y1="96" x2="760" y2="96" stroke="#FDBC07" stroke-width="2" stroke-linecap="round"/></g>
  <circle cx="250" cy="96" r="12" fill="#FDBC07"/></svg>`;

const warn = '<svg viewBox="0 0 24 24" fill="none" stroke="#0B1929" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/></svg>';
const check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';

export function mountLogin(root, { onSuccess } = {}) {
  root.innerHTML = `<div class="login">
    <section class="hero">${pivot}
      <div class="tile"><img src="/assets/logo-mark.png" alt="PEST AI"></div>
      <div class="hero-text"><h1>Connexion</h1><p>Entrez le numéro et le code remis par PEST AI.</p></div>
    </section>
    <form class="form" novalidate>
      <div class="field"><label for="phone">Numéro de téléphone</label>
        <div class="control"><span class="pre">+221</span><input id="phone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="77 000 00 00" aria-describedby="err"></div></div>
      <div class="field"><label for="code">Code personnel</label>
        <div class="control"><input id="code" name="code" type="password" inputmode="numeric" autocomplete="one-time-code" placeholder="••••" aria-describedby="err">
          <button type="button" class="toggle" id="toggle" aria-controls="code">Afficher</button></div></div>
      <div class="msg" id="err" role="alert" hidden>${warn}<span id="err-text"></span></div>
      <button class="go" id="go" type="submit">Se connecter</button>
      <p class="help">Besoin d'aide ? <button type="button" id="help">Contacter PEST AI</button></p>
    </form></div>`;

  const $ = s => root.querySelector(s);
  const phone = $('#phone'), code = $('#code'), btn = $('#go'), err = $('#err');

  $('#toggle').addEventListener('click', e => {
    const show = code.type === 'password';
    code.type = show ? 'text' : 'password'; e.currentTarget.textContent = show ? 'Masquer' : 'Afficher';
  });
  const bad = (el, text) => {
    $('#err-text').textContent = text; err.hidden = false;
    root.querySelectorAll('.control').forEach(c => { c.dataset.bad = 'false'; });
    if (el) { el.closest('.control').dataset.bad = 'true'; el.focus(); }
  };
  const busy = on => {
    btn.disabled = on;
    btn.innerHTML = on ? '<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span>Connexion…</span>' : 'Se connecter';
  };
  [phone, code].forEach(el => el.addEventListener('input', () => { err.hidden = true; el.closest('.control').dataset.bad = 'false'; }));

  $('form').addEventListener('submit', async e => {
    e.preventDefault();
    const p = phone.value.replace(/\D/g, ''), c = code.value.trim();
    if (p.length < 9) return bad(phone, 'Entrez votre numéro à 9 chiffres.');
    if (c.length < 4) return bad(code, 'Entrez votre code personnel.');
    if (!navigator.onLine) return bad(null, 'Une connexion est nécessaire pour vous connecter.');
    busy(true);
    try {
      const user = await api.login(p, c);
      btn.innerHTML = `${check}<span>Connexion réussie</span>`; btn.dataset.ok = 'true';
      if (onSuccess) setTimeout(() => onSuccess(user), 700);
    } catch (_) {
      busy(false); bad(code, 'Numéro ou code incorrect. Vérifiez puis réessayez.');
    }
  });
}
