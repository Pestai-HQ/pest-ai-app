// COUCHE DONNÉES FICTIVE. Remplacée par l'API /api/v1/ quand le back-end sera prêt (voir pest-ai-docs/docs/api-contract.md).
const wait = ms => new Promise(r => setTimeout(r, ms));
export const api = {
  // Démo : tout numéro à 9 chiffres et tout code de 4 chiffres ou plus est accepté, sauf le code 0000 (simule une erreur).
  async login(phone, code) {
    await wait(1100);
    if (code === '0000') throw new Error('invalid_credentials');
    return { id: 'demo-producer', first: 'Moussa', role: 'PRODUCER' };
  }
};
