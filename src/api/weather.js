// Météo : prévisions Open-Meteo (gratuit, sans clé) selon des coordonnées (position réelle ou parcelle).
// Hors connexion : la dernière météo reçue est gardée sur le téléphone et affichée avec son ancienneté.
const KEY = 'pestai.weather.v2', FRESH = 30 * 60e3, r2 = n => Math.round(n * 100) / 100;
const url = (lat, lon) => `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=7&timezone=auto`;

function normalize(j) {
  const c = j.current, d = j.daily, h = j.hourly, cur = String(c.time).slice(0, 13) + ':00';
  const from = Math.max(0, h.time.findIndex(t => t >= cur));
  return {
    now: { temp: Math.round(c.temperature_2m), code: c.weather_code, wind: Math.round(c.wind_speed_10m), humidity: Math.round(c.relative_humidity_2m) },
    hours: h.time.slice(from, from + 12).map((t, i) => ({ h: Number(t.slice(11, 13)), temp: Math.round(h.temperature_2m[from + i]), code: h.weather_code[from + i], rain: h.precipitation_probability[from + i] || 0 })),
    days: d.time.map((t, i) => ({ date: t, code: d.weather_code[i], tmax: Math.round(d.temperature_2m_max[i]), tmin: Math.round(d.temperature_2m_min[i]), rain: d.precipitation_probability_max[i] == null ? 0 : d.precipitation_probability_max[i] }))
  };
}

// Renvoie { data, at, fresh } ou null (aucune météo jamais reçue pour ce lieu).
export async function getWeather(lat, lon) {
  lat = r2(lat); lon = r2(lon);
  const key = `${KEY}:${lat},${lon}`; let cached = null;
  try { cached = JSON.parse(localStorage.getItem(key)); } catch (_) { /* ignoré */ }
  if (cached && Date.now() - cached.t < FRESH) return { data: cached.data, at: cached.t, fresh: true };
  try {
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 7000);
    const r = await fetch(url(lat, lon), { signal: ctl.signal }); clearTimeout(to);
    if (!r.ok) throw new Error('http');
    const data = normalize(await r.json()), at = Date.now();
    try { localStorage.setItem(key, JSON.stringify({ t: at, data })); } catch (_) { /* stockage plein */ }
    return { data, at, fresh: true };
  } catch (_) {
    return cached ? { data: cached.data, at: cached.t, fresh: false } : null;
  }
}
