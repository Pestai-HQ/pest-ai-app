// COUCHE DONNÉES FICTIVE. Remplacée par l'API /api/v1/ quand le back-end sera prêt (voir pest-ai-docs/docs/api-contract.md).
const wait = ms => new Promise(r => setTimeout(r, ms));
const daysFromNow = n => new Date(Date.now() + n * 864e5).toISOString();
const KEY = 'pestai.history.v2', CNT = 'pestai.count.v2';
const uuid = () => crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (_) { return []; } };
const write = h => { try { localStorage.setItem(KEY, JSON.stringify(h.slice(0, 20))); } catch (_) { /* stockage plein */ } };

// Trois résultats possibles, en rotation, pour voir les trois niveaux de confiance pendant les essais.
const VARIANTS = [
  { problem: 'Mildiou de la tomate', confidence: 2, symptoms: ['Taches brunes sur les feuilles', 'Bords des feuilles qui sèchent'], steps: ['Retirez les feuilles très touchées.', 'Évitez d\'arroser sur les feuilles.', 'Espacez les rangs pour aérer les plants.'] },
  { problem: 'Mildiou possible', confidence: 1, symptoms: ['Quelques taches sombres', 'Photo peu lisible'], steps: ['Refaites une photo plus nette.'] },
  { problem: 'Mineuse de la tomate', confidence: 3, symptoms: ['Galeries blanches dans les feuilles', 'Petits trous sur les fruits'], steps: ['Retirez les feuilles minées.', 'Surveillez les plants voisins.'] }
];
const next = () => { const n = Number(localStorage.getItem(CNT) || 0); localStorage.setItem(CNT, n + 1); return VARIANTS[n % VARIANTS.length]; };

export const api = {
  // Démo : tout numéro à 9 chiffres et tout code de 4 chiffres ou plus est accepté, sauf le code 0000 (simule une erreur).
  async login(phone, code) {
    await wait(1100);
    if (code === '0000') throw new Error('invalid_credentials');
    return { id: 'demo-producer', first: 'Moussa', role: 'PRODUCER' };
  },
  async home(user) {
    await wait(650);
    const h = read();
    return {
      first: user.first,
      parcel: { id: 'demo-parcel-1', name: 'Parcelle Niayes 1', crop: 'Tomate', agroid: 'AGR-SN-000123', area: '1,2 ha' },
      campaign: { label: 'Contre-saison 2026', start: daysFromNow(-40), end: daysFromNow(70) },
      last: h[0] || { id: 'demo-diag-1', problem: 'Mildiou de la tomate', confidence: 2, captured_at: daysFromNow(-1), sync: 'SYNCED', symptoms: VARIANTS[0].symptoms, steps: VARIANTS[0].steps, photo: null }
    };
  },
  // Une demande = une parcelle + une seule photo. L'id est créé sur le téléphone (renvoi sans doublon après coupure).
  // Hors connexion : la photo est gardée et l'analyse est différée (décision D-03 proposée).
  async diagnose(photo, parcel) {
    const online = navigator.onLine;
    await wait(online ? 3600 : 1200);
    const base = { id: uuid(), parcel_id: parcel.id, captured_at: new Date().toISOString(), photo };
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
