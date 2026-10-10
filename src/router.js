// Mini routeur : chaque écran est un module qui se monte dans #app et peut renvoyer une fonction de nettoyage.
export const ctx = { user: null, parcel: null, photo: null, result: null, from: 'home' };
const routes = {};
let root, cleanup;
export const setRoot = r => { root = r; };
export const register = (name, mount) => { routes[name] = mount; };
export function go(name, params) {
  if (cleanup) { cleanup(); cleanup = null; }
  Object.assign(ctx, params || {});
  window.scrollTo(0, 0);
  cleanup = routes[name](root, ctx) || null;
}
