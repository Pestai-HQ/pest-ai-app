// COUCHE DONNÉES FICTIVE. Remplacée par l'API /api/v1/ quand le back-end sera prêt (voir pest-ai-docs/docs/api-contract.md).
const wait = ms => new Promise(r => setTimeout(r, ms));
const daysFromNow = n => new Date(Date.now() + n * 864e5).toISOString();
const KEY = 'pestai.history.v2', CNT = 'pestai.count.v2';
const uuid = () => crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (_) { return []; } };
const write = h => { try { localStorage.setItem(KEY, JSON.stringify(h.slice(0, 20))); } catch (_) { /* stockage plein */ } };

// Quatre résultats possibles, en rotation, pour voir tous les cas pendant les essais.
// DÉMONSTRATION : le contenu réel (produits, conseils) viendra de PEST AI OS et sera validé par les agronomes (décision D-29).
// Les doses ne sont jamais affichées : « lisez l'étiquette ».
const VARIANTS = [
  { status: 'ANOMALY', category: 'FUNGUS', problem: 'Mildiou de la tomate', confidence: 2,
    symptoms: ['Taches brunes sur les feuilles', 'Bords des feuilles qui sèchent'],
    steps: [{ icon: 'scissors', text: 'Coupez les feuilles très touchées.' }, { icon: 'dropoff', text: 'Arrosez au pied, pas sur les feuilles.' }, { icon: 'spacing', text: 'Espacez les plants pour laisser passer l\'air.' }],
    products: [{ icon: 'spray', name: 'Produit à base de cuivre', use: 'Contre les champignons, comme le mildiou.' }],
    follow: { days: 3, text: 'Refaites une photo dans 3 jours.' } },
  { status: 'HEALTHY', category: 'NONE', problem: 'Plante en bonne santé', confidence: 3,
    symptoms: ['Feuilles vertes et fermes', 'Aucune tache visible'],
    steps: [{ icon: 'drop', text: 'Arrosez le matin, au pied.' }, { icon: 'scissors', text: 'Retirez les feuilles mortes.' }, { icon: 'spacing', text: 'Gardez de l\'espace entre les plants.' }, { icon: 'eye', text: 'Regardez vos plants chaque semaine.' }],
    products: [], follow: { days: 7, text: 'Refaites une photo dans 7 jours.' } },
  { status: 'ANOMALY', category: 'INSECT', problem: 'Mineuse de la tomate', confidence: 3,
    symptoms: ['Galeries blanches dans les feuilles', 'Petits trous sur les fruits'],
    steps: [{ icon: 'scissors', text: 'Coupez les feuilles avec des galeries blanches.' }, { icon: 'eye', text: 'Regardez aussi les plants voisins.' }],
    products: [{ icon: 'trap', name: 'Piège à papillons', use: 'Attrape les papillons adultes.' }, { icon: 'spray', name: 'Huile de neem', use: 'Contre les petites larves.' }],
    follow: { days: 3, text: 'Refaites une photo dans 3 jours.' } },
  { status: 'UNSURE', category: 'NONE', problem: 'Résultat incertain', confidence: 1,
    symptoms: ['Photo peu lisible'],
    steps: [{ icon: 'camera', text: 'Refaites la photo, plus près de la feuille.' }],
    products: [], follow: null }
];
const next = () => { const n = Number(localStorage.getItem(CNT) || 0); localStorage.setItem(CNT, n + 1); return VARIANTS[n % VARIANTS.length]; };

// Exemples affichés tant qu'aucun vrai diagnostic n'a été fait (démonstration).
const seed = () => [
  { id: 'demo-1', ...VARIANTS[0], captured_at: daysFromNow(-1), sync: 'SYNCED', photo: null, parcel_id: 'demo-parcel-1' },
  { id: 'demo-2', ...VARIANTS[1], captured_at: daysFromNow(-6), sync: 'SYNCED', photo: null, parcel_id: 'demo-parcel-1' },
  { id: 'demo-3', ...VARIANTS[2], captured_at: daysFromNow(-13), sync: 'SYNCED', photo: null, parcel_id: 'demo-parcel-1' }
];

// ---- Parcelles, campagnes, activité (démonstration) ----
// Modèle aligné sur le schéma de base : Parcel (localisation, superficie), AgroID (code), Campaign (saison, dates, statut, bilan), Crop (culture, variété),
// CropYield (récolte), Observation, Treatment. Le schéma n'a pas de champ « nom » de parcelle : le nom affiché ici est provisoire.
const day = n => daysFromNow(n);
const PARCELS = [
  { id: 'demo-parcel-1', name: 'Parcelle Niayes 1', location: 'Niayes, Thiès', agroid: 'SN-TH-00194', lat: 14.85, lon: -16.95, area_ha: 1.2, declared_area_ha: 1.2, status: 'ACTIVE', issued_at: day(-870) },
  { id: 'demo-parcel-2', name: 'Parcelle Niayes 2', location: 'Niayes, Thiès', agroid: 'SN-TH-00195', lat: 14.86, lon: -16.96, area_ha: 0.8, declared_area_ha: 0.9, status: 'ACTIVE', issued_at: day(-300) }
];
const CAMPAIGNS = {
  'demo-parcel-1': [
    { id: 'c1-2026', season: 'Contre-saison 2026', crop: 'Tomate', variety: 'Mongal', status: 'OPEN', planned_start: day(-40), planned_end: day(70), opened_at: day(-40) },
    { id: 'c1-2025c', season: 'Contre-saison 2025', crop: 'Oignon', variety: '', status: 'CLOSED', planned_start: day(-340), planned_end: day(-240), opened_at: day(-338), closed_at: day(-236),
      yield: { qty: 26, unit: 't', date: day(-240) }, summary: 'Récolte conforme aux attentes. Peu de maladies pendant la campagne.' },
    { id: 'c1-2025h', season: 'Hivernage 2025', crop: 'Maïs', variety: '', status: 'CLOSED', planned_start: day(-470), planned_end: day(-370), opened_at: day(-468), closed_at: day(-366),
      yield: { qty: 3.4, unit: 't', date: day(-370) }, summary: 'Bonnes pluies. Rendement en hausse sur la campagne précédente.' },
    { id: 'c1-2024', season: 'Hivernage 2024', crop: 'Maïs', variety: '', status: 'CLOSED', planned_start: day(-830), planned_end: day(-730), opened_at: day(-828), closed_at: day(-726),
      yield: { qty: 3.0, unit: 't', date: day(-730) }, summary: 'Pluies en retard au début, récolte correcte.' }
  ],
  'demo-parcel-2': [
    { id: 'c2-2026', season: 'Contre-saison 2026', crop: 'Oignon', variety: '', status: 'OPEN', planned_start: day(-25), planned_end: day(95), opened_at: day(-25) }
  ]
};
// Activité passée (hors diagnostics du téléphone) : observations et pratiques agronomiques.
const PAST = {
  'c1-2026': [
    { type: 'OBSERVATION', at: day(-12), title: 'Feuilles jaunies au bord nord', sub: 'Observation' },
    { type: 'TREATMENT', at: day(-20), title: 'Désherbage manuel', sub: 'Pratique agronomique' }
  ],
  'c1-2025c': [
    { type: 'DIAGNOSIS', at: day(-300), title: 'Plante en bonne santé', sub: 'Diagnostic', status: 'HEALTHY' },
    { type: 'OBSERVATION', at: day(-290), title: 'Bonne levée des plants', sub: 'Observation' },
    { type: 'TREATMENT', at: day(-310), title: 'Irrigation goutte à goutte', sub: 'Pratique agronomique' }
  ],
  'c1-2025h': [
    { type: 'OBSERVATION', at: day(-440), title: 'Semis après les premières pluies', sub: 'Observation' }
  ],
  'c1-2024': [
    { type: 'OBSERVATION', at: day(-800), title: 'Semis tardif, pluies en retard', sub: 'Observation' }
  ],
  'c2-2026': [
    { type: 'OBSERVATION', at: day(-15), title: 'Plants réguliers, bonne reprise', sub: 'Observation' }
  ]
};
const parcelCard = p => ({ ...p, area: String(p.area_ha).replace('.', ',') + ' ha' });

export const api = {
  // Démo : tout numéro à 9 chiffres et tout code de 4 chiffres ou plus est accepté, sauf le code 0000 (simule une erreur).
  async login(phone, code) {
    await wait(1100);
    if (code === '0000') throw new Error('invalid_credentials');
    return { id: 'demo-producer', first: 'Moussa', role: 'PRODUCER' };
  },
  async home(user, activeId) {
    await wait(650);
    const h = await api.history();
    const p = PARCELS.find(x => x.id === activeId) || PARCELS[0];
    const c = CAMPAIGNS[p.id][0];
    return {
      first: user.first,
      parcel: { ...parcelCard(p), crop: c.crop },
      campaign: { label: c.season, start: c.planned_start, end: c.planned_end },
      last: h.find(d => d.parcel_id === p.id) || null
    };
  },
  // Onglet Parcelles : liste avec résumé (culture en cours, dernier diagnostic).
  async parcels() {
    await wait(450);
    const h = await api.history();
    return PARCELS.map(p => {
      const cs = CAMPAIGNS[p.id], cur = cs.find(c => c.status === 'OPEN') || cs[0];
      return { ...parcelCard(p), crop: cur.crop, season: cur.season, campaignStatus: cur.status, campaigns: cs.length, last: h.find(d => d.parcel_id === p.id) || null };
    });
  },
  // Fiche parcelle : identité, campagnes, et pour chaque campagne son activité (diagnostics, observations, pratiques).
  async parcel(id) {
    await wait(450);
    const p = PARCELS.find(x => x.id === id) || PARCELS[0], h = await api.history();
    const campaigns = CAMPAIGNS[p.id].map(c => {
      const diags = c.status === 'OPEN' ? h.filter(d => d.parcel_id === p.id).map(d => ({ type: 'DIAGNOSIS', at: d.captured_at, title: d.problem || 'Analyse en attente', sub: 'Diagnostic', status: d.problem ? d.status : 'WAIT', diag: d })) : [];
      const events = [...diags, ...(PAST[c.id] || [])].sort((a, b) => new Date(b.at) - new Date(a.at));
      const count = t => events.filter(e => e.type === t).length;
      return { ...c, events, counts: { diagnoses: count('DIAGNOSIS'), observations: count('OBSERVATION'), recommendations: diags.filter(e => e.diag && e.diag.steps && e.diag.steps.length && e.status !== 'UNSURE').length + (c.status === 'OPEN' ? 0 : count('DIAGNOSIS')) } };
    });
    return { parcel: parcelCard(p), campaigns };
  },
  // Historique : les diagnostics du téléphone, du plus récent au plus ancien.
  async history() { const h = read(); return h.length ? h : seed(); },
  // Une demande = une parcelle + une seule photo. L'id est créé sur le téléphone (renvoi sans doublon après coupure).
  // Hors connexion : la photo est gardée et l'analyse est différée (décision D-03 proposée).
  async diagnose(photo, parcel, source = 'CAMERA') {
    const online = navigator.onLine;
    await wait(online ? 3600 : 1200);
    const base = { id: uuid(), parcel_id: parcel.id, captured_at: new Date().toISOString(), photo, source };
    const item = online ? { ...base, ...next(), sync: 'SYNCED' } : { ...base, problem: null, confidence: 0, symptoms: [], steps: [], sync: 'PENDING' };
    write([item, ...read()]);
    return item;
  },
  // Retour du réseau : les analyses différées se terminent (simulation).
  async syncPending() {
    const h = read(); let n = 0;
    h.forEach(i => { if (i.sync === 'PENDING') { Object.assign(i, next(), { sync: 'SYNCED' }); n++; } });
    if (n) write(h);
    return n;
  }
};
