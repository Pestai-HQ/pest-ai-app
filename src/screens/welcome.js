import { go } from '../router.js';
import { pic } from '../components/pictos.js';
import { welcomeArt } from '../components/art.js';

export function mountWelcome(root) {
  root.innerHTML = `<div class="au au-welcome">
    <div class="au-wtop">${welcomeArt()}
      <div class="au-brand"><span class="au-tile"><img src="/assets/logo-mark.png" alt=""></span><span>PEST AI</span></div>
      <button class="au-skip light" id="skip">Passer</button></div>
    <div class="au-wbody"><h1>Votre agriculture, mieux accompagnée.</h1>
      <p>Des outils simples pour suivre vos parcelles, diagnostiquer vos cultures et recevoir des conseils.</p>
      <div class="au-wfoot"><span class="au-dots" aria-hidden="true"><i class="on"></i><i></i><i></i><i></i></span>
        <button class="au-go" id="start" aria-label="Commencer la présentation">${pic('arrow')}</button></div></div></div>`;
  root.querySelector('#start').onclick = () => go('onboarding');
  root.querySelector('#skip').onclick = () => { try { localStorage.setItem('pestai.onboarded', '1'); } catch (_) { /* ignoré */ } go('login'); };
}
