// Position réelle de l'utilisateur : API de géolocalisation du navigateur (gratuite, intégrée au téléphone, exige https et l'accord de l'utilisateur).
// Le nom du lieu s'obtient par géocodage inverse (BigDataCloud, sans clé). Les coordonnées envoyées à ces services sont arrondies (~1 km).
const POS = 'pestai.pos.v1', PLACE = 'pestai.place.v1';
const r2 = n => Math.round(n * 100) / 100;
const read = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (_) { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) { /* stockage plein */ } };

export const lastPosition = () => read(POS);

// État de l'autorisation : 'granted' | 'prompt' | 'denied' | 'unknown'.
export async function permission() {
  if (!navigator.geolocation) return 'unsupported';
  try { return (await navigator.permissions.query({ name: 'geolocation' })).state; } catch (_) { return 'unknown'; }
}

// Demande la position (affiche la demande d'autorisation du téléphone la première fois).
export function locate() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(Object.assign(new Error('unsupported'), { code: 'unsupported' }));
    navigator.geolocation.getCurrentPosition(p => {
      const pos = { lat: r2(p.coords.latitude), lon: r2(p.coords.longitude), acc: Math.round(p.coords.accuracy), t: Date.now() };
      write(POS, pos); resolve(pos);
    }, e => reject(Object.assign(new Error('geo'), { code: e.code === 1 ? 'denied' : e.code === 3 ? 'timeout' : 'unavailable' })),
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
  });
}

const coordText = ({ lat, lon }) => `${Math.abs(lat).toFixed(2).replace('.', ',')}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2).replace('.', ',')}° ${lon >= 0 ? 'E' : 'O'}`;

// Nom du lieu (ville ou village, région). En cas d'échec : les coordonnées.
export async function placeName({ lat, lon }) {
  const key = `${PLACE}:${r2(lat)},${r2(lon)}`, hit = read(key);
  if (hit) return hit;
  try {
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 6000);
    const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${r2(lat)}&longitude=${r2(lon)}&localityLanguage=fr`, { signal: ctl.signal });
    clearTimeout(to); if (!r.ok) throw new Error('http');
    const j = await r.json(), name = [j.locality || j.city, j.principalSubdivision].filter(Boolean).join(', ');
    if (name) { write(key, name); return name; }
  } catch (_) { /* repli ci-dessous */ }
  return coordText({ lat, lon });
}
