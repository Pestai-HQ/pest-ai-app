import { api } from '../api/mock.js';
import { pic } from '../components/pictos.js';
import { waLink } from '../components/contact.js';

const check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
const warn = '<svg viewBox="0 0 24 24" fill="none" stroke="#0B1929" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/></svg>';

export function mountLogin(root, { onSuccess } = {}) {
  root.innerHTML = `<div class="lg">
    <header class="lg-top"><div class="lg-brand"><span class="tile"><img src="/assets/logo-mark.png" alt=""></span><span>PEST AI</span></div>
      <h1>Bon retour</h1><p>Connectez-vous pour continuer.</p></header>
    <form class="lg-sheet" novalidate>
      <div class="lg-f"><label for="phone">Numéro de téléphone</label><div class="lg-ctl">${pic('phone')}<span class="pre" aria-hidden="true">+221</span><input id="phone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="77 000 00 00" aria-describedby="err"></div></div>
      <div class="lg-f"><label for="code">Code personnel</label><div class="lg-ctl">${pic('lock')}<input id="code" name="code" type="password" inputmode="numeric" autocomplete="one-time-code" placeholder="••••" aria-describedby="err"><button type="button" class="lg-tg" id="toggle" aria-controls="code">Afficher</button></div>
        <a class="lg-forgot" href="${waLink('Bonjour PEST AI, j\'ai oublié mon code personnel.')}" target="_blank" rel="noopener noreferrer">Code oublié ?</a></div>
      <div class="msg" id="err" role="alert" hidden>${warn}<span id="err-text"></span></div>
      <button class="lg-btn" id="go" type="submit">Se connecter</button>
      <p class="lg-help">Pas encore d'accès ? <a href="${waLink('Bonjour PEST AI, je souhaite obtenir mon accès à l\'application.')}" target="_blank" rel="noopener noreferrer">Contactez-nous</a></p>
    </form></div>`;

  const $ = s => root.querySelector(s);
  const phone = $('#phone'), code = $('#code'), btn = $('#go'), err = $('#err');
  $('#toggle').addEventListener('click', e => { const show = code.type === 'password'; code.type = show ? 'text' : 'password'; e.currentTarget.textContent = show ? 'Masquer' : 'Afficher'; });
  const bad = (el, text) => {
    $('#err-text').textContent = text; err.hidden = false;
    root.querySelectorAll('.lg-ctl').forEach(c => { c.dataset.bad = 'false'; });
    if (el) { el.closest('.lg-ctl').dataset.bad = 'true'; el.focus(); }
  };
  const busy = on => {
    btn.disabled = on;
    btn.innerHTML = on ? '<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span>Connexion…</span>' : 'Se connecter';
  };
  [phone, code].forEach(el => el.addEventListener('input', () => { err.hidden = true; el.closest('.lg-ctl').dataset.bad = 'false'; }));

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
