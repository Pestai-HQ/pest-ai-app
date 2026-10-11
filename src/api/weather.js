// Météo de la parcelle : prévisions Open-Meteo (gratuit, sans clé) à partir des coordonnées GPS de la parcelle.
// Hors connexion : la dernière météo reçue est gardée sur le téléphone et affichée avec son ancienneté.
const KEY = 'pestai.weather.v1', FRESH = 30 * 60e3;
const url = (lat, lon) => `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=4&timezone=auto`;

function normalize(j) {
  const c = j.current, d = j.daily;
  return {
    now: { temp: Math.round(c.temperature_2m), code: c.weather_code, wind: Math.round(c.wind_speed_10m), humidity: Math.round(c.relative_humidity_2m) },
    days: d.time.map((t, i) => ({ date: t, code: d.weather_code[i], tmax: Math.round(d.temperature_2m_max[i]), tmin: Math.round(d.temperature_2m_min[i]), rain: d.precipitation_probability_max[i] == null ? 0 : d.precipitation_probability_max[i] }))
  };
}

// Renvoie { data, at, fresh } ou null (aucune donnée, jamais reçue).
export async function getWeather(lat, lon) {
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
