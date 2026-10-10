// COUCHE DONNÉES FICTIVE. Remplacée par l'API /api/v1/ quand le back-end sera prêt (voir pest-ai-docs/docs/api-contract.md).
const wait = ms => new Promise(r => setTimeout(r, ms));
const daysAgo = n => new Date(Date.now() - n * 864e5).toISOString();
export const api = {
  // Démo : tout numéro à 9 chiffres et tout code de 4 chiffres ou plus est accepté, sauf le code 0000 (simule une erreur).
  async login(phone, code) {
    await wait(1100);
    if (code === '0000') throw new Error('invalid_credentials');
    return { id: 'demo-producer', first: 'Moussa', role: 'PRODUCER' };
  },
  // Données de l'Accueil : parcelle active + dernier diagnostic (null = aucun diagnostic).
  async home(user) {
    await wait(650);
    return {
      first: user.first,
      parcel: { name: 'Parcelle Niayes 1', crop: 'Tomate', campaign: 'Contre-saison 2026', agroid: 'AGR-SN-000123' },
      last: { id: 'demo-diag-1', problem: 'Mildiou de la tomate', confidence: 2, captured_at: daysAgo(1), sync: 'SYNCED' }
    };
  }
};
