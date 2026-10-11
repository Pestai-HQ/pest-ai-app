import { api } from '../api/mock.js';
import { go, ctx } from '../router.js';
import { pic } from '../components/pictos.js';
import { verdictOfStatus } from '../components/verdict.js';
import { qrSvg } from '../components/qr.js';
import { navbar, icon, toast, offlineBar, watchNetwork } from '../components/navbar.js';
import { bindNav } from '../components/nav.js';

const css = href => { if (!document.querySelector(`link[href="${href}"]`)) document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="${href}">`); };
const dShort = iso => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
const dLong = iso => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
const ICON = { DIAGNOSIS: 'camera', OBSERVATION: 'note', TREATMENT: 'hoe' };
const progress = c => {
  const total = Math.max(1, Math.round((new Date(c.planned_end) - new Date(c.planned_start)) / 864e5));
  const day = Math.min(total, Math.max(1, Math.round((Date.now() - new Date(c.planned_start)) / 864e5)));
  return { total, day, pct: Math.round(day / total * 100) };
};

function campaign(c) {
  const open = c.status === 'OPEN', pr = open ? progress(c) : null, crop = c.crop + (c.variety ? ` · ${c.variety}` : '');
  const body = open
    ? `<div class="cprog"><div class="row"><span>Jour ${pr.day} sur ${pr.total}</span><span class="mut">${dShort(c.planned_start)} → ${dShort(c.planned_end)} (prévu)</span></div>
        <div class="track" role="progressbar" aria-label="Avancement de la campagne" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pr.pct}"><i style="width:${pr.pct}%"></i></div></div>`
    : `<p class="cdates mut">Du ${dShort(c.opened_at)} au ${dShort(c.closed_at)}</p>
       ${c.yield ? `<div class="yield">${pic('sprout')}<div><span>Récolte</span><strong>${c.yield.qty} ${c.yield.unit}</strong></div><span class="ydate">${dLong(c.yield.date)}</span></div>` : ''}
       ${c.summary ? `<div class="bilan"><strong>Bilan</strong><p>${c.summary}</p></div>` : ''}`;
  return `<div class="camp"><div class="camp-head"><div><h2>${crop}</h2><p class="mut">${c.season}</p></div><span class="st ${open ? 'open' : 'closed'}">${open ? 'En cours' : 'Terminée'}</span></div>${body}</div>
    <div class="stats"><div><strong>${c.counts.diagnoses}</strong><span>Diagnostic${c.counts.diagnoses > 1 ? 's' : ''}</span></div><div><strong>${c.counts.observations}</strong><span>Observation${c.counts.observations > 1 ? 's' : ''}</span></div><div><strong>${c.counts.recommendations}</strong><span>Conseil${c.counts.recommendations > 1 ? 's' : ''}</span></div></div>
    <h2 class="sec">Activité</h2>${c.events.length ? `<ol class="tl">${c.events.map((e, k) => event(e, k)).join('')}</ol>` : '<p class="mut">Aucune activité pour cette campagne.</p>'}`;
}

function event(e, k) {
  const v = e.type === 'DIAGNOSIS' ? verdictOfStatus(e.status, e.status !== 'WAIT') : null;
  const inner = `<span class="evi">${pic(ICON[e.type])}</span><span class="evb"><strong>${e.title}</strong><span>${e.sub} · ${dShort(e.at)}</span></span>${v ? `<span class="vp ${v[0]}">${pic(v[2])}${v[1]}</span>` : ''}`;
  return e.diag ? `<li><button class="ev" data-act="event" data-k="${k}">${inner}</button></li>` : `<li><div class="ev">${inner}</div></li>`;
}

export function mountParcel(root) {
  ['shell', 'home', 'qr', 'history', 'parcels'].forEach(n => css(`/styles/${n}.css`));
  root.innerHTML = `<div class="shell">${offlineBar()}<header class="bar"><button class="ghost dark" id="back" data-act="back">← Parcelles</button></header>
    <main class="fiche" aria-busy="true"><div class="sk" style="height:11rem"></div><div class="sk" style="height:4rem"></div><div class="sk" style="height:8rem"></div></main>${navbar('parcels')}</div>`;
  watchNetwork();
  let alive = true, data, sel = ctx.campIdx || 0;
  const draw = () => {
    const { parcel: p, campaigns } = data, cur = campaigns.find(c => c.status === 'OPEN'), c = campaigns[sel];
    root.innerHTML = `<div class="shell">${offlineBar()}<header class="bar"><button class="ghost dark" id="back" data-act="back">← Parcelles</button></header>
    <main class="fiche">
      <section class="parcel fp" aria-label="Identité de la parcelle">
        <div class="ptop"><div class="pleft"><p class="label">Parcelle</p><h1>${p.name}</h1><p class="meta">${pic('pin')}${p.location} · ${p.area}</p></div>
          <button class="qrtile" data-act="qr" aria-label="Afficher le QR code de la parcelle ${p.name}"><span class="qrbox">${qrSvg(p.agroid)}</span><span>Mon QR code</span></button></div>
        <button class="chip" data-act="copy" aria-label="Copier l'AgroID ${p.agroid}">${p.agroid}${icon('copy')}</button>
      </section>
      ${cur ? `<button class="cta" data-act="diagnose">${icon('camera')}Diagnostiquer cette parcelle</button>` : ''}
      <div class="csel" role="tablist" aria-label="Campagnes">${campaigns.map((x, i) => `<button role="tab" aria-selected="${i === sel}" data-act="camp" data-i="${i}">${x.season}${x.status === 'OPEN' ? '<small>En cours</small>' : ''}</button>`).join('')}</div>
      <div class="cbody" role="tabpanel">${campaign(c)}</div>
    </main>${navbar('parcels')}</div>`;
    watchNetwork();
  };
  api.parcel(ctx.viewId).then(d => { if (!alive) return; data = d; draw(); });
  const unbind = bindNav(root, 'parcels', el => {
    if (el.dataset.act === 'back') { go('parcels'); return true; }
    if (!data) return true;
    const a = el.dataset.act, p = data.parcel;
    if (a === 'camp') { sel = Number(el.dataset.i); ctx.campIdx = sel; draw(); return true; }
    if (a === 'copy') { navigator.clipboard.writeText(p.agroid).then(() => toast('AgroID copié.'), () => toast('Copie impossible sur cet appareil.')); return true; }
    if (a === 'qr') { go('qr', { qrParcel: p, qrBack: 'parcel' }); return true; }
    if (a === 'diagnose') { const cur = data.campaigns.find(c => c.status === 'OPEN'); go('capture', { parcel: { ...p, crop: cur.crop } }); return true; }
    if (a === 'event') { const e = data.campaigns[sel].events[Number(el.dataset.k)]; go('result', { result: e.diag, photo: null, back: 'parcel', detailParcel: { ...p, crop: data.campaigns[sel].crop } }); return true; }
    return false;
  });
  return () => { alive = false; unbind(); };
}
