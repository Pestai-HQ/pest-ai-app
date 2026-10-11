// Verdict d'un diagnostic : classe de couleur, mot et pictogramme (la couleur ne porte jamais le sens seule).
const CAT = { FUNGUS: 'fungus', INSECT: 'insect', NUTRIENT: 'bag' };
export const verdict = d => !d.problem ? ['wait', 'En attente', 'clock']
  : d.status === 'HEALTHY' ? ['ok', 'En bonne santé', 'sprout']
  : d.status === 'UNSURE' ? ['unsure', 'Pas sûr', 'eye']
  : ['bad', 'Problème', CAT[d.category] || 'warn'];
export const verdictOfStatus = (status, hasProblem = true) => verdict({ problem: hasProblem ? 'x' : null, status });
