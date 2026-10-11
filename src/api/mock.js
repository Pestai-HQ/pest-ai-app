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

export const api = {
  // Démo : tout numéro à 9 chiffres et tout code de 4 chiffres ou plus est accepté, sauf le code 0000 (simule une erreur).
  async login(phone, code) {
    await wait(1100);
    if (code === '0000') throw new Error('invalid_credentials');
    return { id: 'demo-producer', first: 'Moussa', role: 'PRODUCER' };
  },
  async home(user) {
    await wait(650);
    const h = await api.history();
    return {
      first: user.first,
      parcel: { id: 'demo-parcel-1', name: 'Parcelle Niayes 1', crop: 'Tomate', agroid: 'AGR-SN-000123', area: '1,2 ha' },
      campaign: { label: 'Contre-saison 2026', start: daysFromNow(-40), end: daysFromNow(70) },
      last: h[0]
    };
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
