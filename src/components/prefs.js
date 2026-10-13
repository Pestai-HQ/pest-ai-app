// Préférences de l'utilisateur, gardées sur le téléphone.
const FS = { s: '87.5%', m: '93.75%', l: '106.25%' };
export const getPref = (k, d) => { try { return localStorage.getItem('pestai.' + k) || d; } catch (_) { return d; } };
export const setPref = (k, v) => { try { localStorage.setItem('pestai.' + k, v); } catch (_) { /* ignoré */ } };
export const applyFontSize = () => { document.documentElement.style.fontSize = FS[getPref('fs', 'm')] || FS.m; };
