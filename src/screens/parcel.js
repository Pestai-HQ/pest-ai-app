import { api } from '../api/mock.js';
import { go, ctx } from '../router.js';
import { pic } from '../components/pictos.js';
import { verdictOfStatus } from '../components/verdict.js';
import { qrSvg } from '../components/qr.js';
import { donut, gauge, spark } from '../components/charts.js';
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
       ${c.yield ? `<div class="yield">${pic('sprout')}<div><span>Récolte</span><strong>${String(c.yield.qty).replace('.', ',')} ${c.yield.unit}</strong></div><span class="ydate">${dLong(c.yield.date)}</span></div>` : ''}
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

const fnum = n => String(Math.round(n * 10) / 10).replace('.', ',');
const perHa = (c, p) => (c.yield && c.yield.unit === 't' ? c.yield.qty / p.area_ha : null);
const RISK = 18;   // DÉMONSTRATION : l'indicateur de risque n'est pas défini dans les documents (à définir avec les agronomes).
const riskWord = v => (v < 34 ? 'Faible risque' : v < 67 ? 'Risque modéré' : 'Risque élevé');

function overview(p, user) {
  const cur = null;
  const it = (ic, label, val) => `<div><span class="ovi">${pic(ic)}</span><span><dt>${label}</dt><dd>${val}</dd></span></div>`;
  return `<dl class="ov">${it('pin', 'Localisation', p.location)}${it('area', 'Superficie', p.area)}${it('sprout', 'Culture en cours', p.currentCrop || '—')}${it('user', 'Producteur', user || '—')}</dl>`;
}

function timeline(p, campaigns, sel) {
  const asc = campaigns.map((c, i) => ({ c, i })).reverse();
  return `<div class="tlh" role="tablist" aria-label="Historique des campagnes">
    <span class="tn"><b>${new Date(p.issued_at).getFullYear()}</b><span class="dotrow"><i class="dot"></i></span><small>Inscription</small></span>
    ${asc.map(({ c, i }) => `<button class="tn" role="tab" aria-selected="${i === sel}" data-act="camp" data-i="${i}" aria-label="${c.season}, ${c.crop}"><b>${new Date(c.opened_at).getFullYear()}</b><span class="dotrow"><i class="dot"></i></span><small>${c.crop}</small></button>`).join('')}</div>`;
}

function kpis(p, campaigns, sel) {
  const withY = campaigns.filter(c => c.yield), ref = campaigns[sel].yield ? campaigns[sel] : withY[0];
  let yc;
  if (!ref) yc = '<p class="ks">Rendement</p><p class="mut">Aucune récolte enregistrée.</p>';
  else {
    const series = withY.filter(c => c.crop === ref.crop).map(c => perHa(c, p)).reverse();
    yc = `<p class="ks">Rendement</p><div class="ky"><div><span class="ylab">${campaigns[sel].yield ? '' : 'Dernière récolte · '}${ref.crop} ${new Date(ref.closed_at).getFullYear()}</span><strong>${fnum(perHa(ref, p))} <small>t/ha</small></strong></div>${spark(series)}</div>${series.length < 2 ? '<p class="mut" style="margin:.5rem 0 0;font-size:.88rem">Une seule récolte enregistrée pour cette culture.</p>' : ''}`;
  }
  const closed = campaigns.filter(c => c.status === 'CLOSED').length, open = campaigns.length - closed;
  const cyc = [...campaigns].reverse().map(c => c.status);
  return `<div class="kpis"><div class="kpi wide">${yc}</div>
    <div class="kpi"><p class="ks">Cycles</p><div class="donutbox">${donut(cyc)}</div><p class="gnum">${closed} terminé${closed > 1 ? 's' : ''}${open ? ` · ${open} en cours` : ''}</p></div>
    <div class="kpi"><p class="ks">Risque</p><div class="gaugebox">${gauge(RISK)}</div><p class="gword">${riskWord(RISK)}</p><p class="gnum">${RISK}/100 <span class="demo">Démo</span></p></div></div>`;
}

export function mountParcel(root) {
  ['shell', 'home', 'qr', 'history', 'parcels'].forEach(n => css(`/styles/${n}.css`));
  root.innerHTML = `<div class="shell">${offlineBar()}<header class="bar"><button class="ghost dark" id="back" data-act="back">← Parcelles</button></header>
    <main class="fiche" aria-busy="true"><div class="sk" style="height:11rem"></div><div class="sk" style="height:4rem"></div><div class="sk" style="height:8rem"></div></main>${navbar('parcels')}</div>`;
  watchNetwork();
  let alive = true, data, sel = ctx.campIdx || 0;
  const draw = () => {
    const { parcel: p, campaigns } = data, cur = campaigns.find(c => c.status === 'OPEN'), c = campaigns[sel];
    p.currentCrop = cur ? cur.crop : campaigns[0].crop;
    root.innerHTML = `<div class="shell">${offlineBar()}<header class="bar"><button class="ghost dark" id="back" data-act="back">← Parcelles</button></header>
    <main class="fiche">
      <div class="ptitle"><p class="kicker">Identité numérique</p><h1>${p.name}</h1></div>
      <section class="idcard" aria-label="Identité de la parcelle">
        <div class="idtop"><div class="idl"><span class="idmark"><img src="/assets/logo-mark.png" alt=""></span><div><p class="idlab">ID PARCELLE</p><p class="idcode">${p.agroid}</p><span class="okb">${pic('check')}Enrôlée · ${new Date(p.issued_at).getFullYear()}</span></div></div>
          <button class="idscan" data-act="qr" aria-label="Afficher le QR code de la parcelle ${p.name}"><i></i><i></i><i></i><i></i><span class="qrinner">${qrSvg(p.agroid)}</span></button></div>
        <div class="idfoot"><button class="link" data-act="copy" aria-label="Copier l'AgroID ${p.agroid}">${icon('copy')}Copier l'AgroID</button><button class="link" data-act="qr">Agrandir le QR</button></div>
      </section>
      ${cur ? `<button class="cta" data-act="diagnose">${icon('camera')}Diagnostiquer cette parcelle</button>` : ''}
      <section class="card2"><h2 class="ks">Aperçu de la parcelle</h2>${overview(p, ctx.user && ctx.user.first)}</section>
      <section class="card2"><h2 class="ks">Historique</h2>${timeline(p, campaigns, sel)}</section>
      ${kpis(p, campaigns, sel)}
      <div class="cbody" role="tabpanel"><h2 class="ks" style="margin:0">Campagne sélectionnée</h2>${campaign(c)}</div>
      <div class="trust">${pic('shield')}<div><strong>Données sécurisées et traçables</strong><span>Chaque ajout est daté et conservé dans l'historique de la parcelle.</span></div></div>
    </main>${navbar('parcels')}</div>`;
    watchNetwork();
    const on = root.querySelector('.tn[aria-selected="true"]'); if (on && on.scrollIntoView) on.scrollIntoView({ inline: 'center', block: 'nearest' });
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
