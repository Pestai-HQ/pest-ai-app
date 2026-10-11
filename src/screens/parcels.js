import { api } from '../api/mock.js';
import { go, ctx } from '../router.js';
import { pic } from '../components/pictos.js';
import { verdict } from '../components/verdict.js';
import { navbar, topbar, offlineBar, watchNetwork } from '../components/navbar.js';
import { bindNav } from '../components/nav.js';

const css = href => { if (!document.querySelector(`link[href="${href}"]`)) document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="${href}">`); };
const fmt = n => String(Math.round(n * 10) / 10).replace('.', ',');

function card(p, activeId) {
  const open = p.campaignStatus === 'OPEN', v = p.last ? verdict(p.last) : null;
  return `<button class="pcard" data-act="open" data-id="${p.id}" aria-label="${p.name}, ${p.crop}, ${p.area}">
    <span class="pc-top"><span><strong class="pc-name">${p.name}</strong><span class="pc-loc">${pic('pin')}${p.location}</span></span>
      ${p.id === activeId ? '<span class="act">Active</span>' : ''}</span>
    <span class="pc-mid"><span class="fact">${pic('sprout')}${p.crop}</span><span class="fact">${p.area}</span><span class="st ${open ? 'open' : 'closed'}">${open ? 'Campagne en cours' : 'Campagne terminée'}</span></span>
    <span class="pc-foot"><span class="chip s">${p.agroid}</span>${v ? `<span class="vp ${v[0]}">${pic(v[2])}${v[1]}</span>` : '<span class="mut">Aucun diagnostic</span>'}</span></button>`;
}

export function mountParcels(root) {
  ['shell', 'home', 'history', 'parcels'].forEach(n => css(`/styles/${n}.css`));
  const shell = body => `<div class="shell">${offlineBar()}${topbar()}${body}${navbar('parcels')}</div>`;
  root.innerHTML = shell('<main class="plist" aria-busy="true" aria-label="Chargement"><div class="sk" style="height:3rem;width:55%"></div><div class="sk" style="height:9.5rem"></div><div class="sk" style="height:9.5rem"></div></main>');
  watchNetwork();
  let alive = true;
  api.parcels().then(list => {
    if (!alive) return;
    const total = list.reduce((a, p) => a + p.area_ha, 0), activeId = ctx.parcel && ctx.parcel.id;
    root.innerHTML = shell(`<main class="plist"><div class="hhead"><h1>Mes parcelles</h1><p>${list.length} parcelle${list.length > 1 ? 's' : ''} · ${fmt(total)} ha</p></div>
      <div class="glist">${list.map(p => card(p, activeId)).join('')}</div></main>`);
    watchNetwork();
  });
  const unbind = bindNav(root, 'parcels', el => {
    if (el.dataset.act === 'open') { go('parcel', { viewId: el.dataset.id, campIdx: 0 }); return true; }
    return false;
  });
  return () => { alive = false; unbind(); };
}
