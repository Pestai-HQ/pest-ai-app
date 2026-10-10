// Lecteur audio par étapes. Chaque phrase est lue séparément : on peut mettre en pause, reprendre, rejouer, ralentir,
// et l'écran sait quelle étape est en cours de lecture. Aujourd'hui : voix du téléphone (français).
// Plus tard : les fichiers audio du serveur (français, wolof, pulaar) remplaceront speak() sans changer l'écran.
export function createVoice({ lines, lang = 'fr-FR', onState, onStep }) {
  const tts = 'speechSynthesis' in window;
  let i = 0, rate = 1, token = 0, state = 'idle', timer;
  const emit = s => { state = s; onState && onState(s, i); };
  const voice = () => (speechSynthesis.getVoices() || []).find(v => v.lang && v.lang.toLowerCase().startsWith('fr'));
  function run(from) {
    if (!tts) return emit('off');
    clearTimeout(timer); speechSynthesis.cancel();
    const t = ++token; i = from; emit('playing');
    const next = () => {
      if (t !== token) return;
      if (i >= lines.length) { i = 0; onStep && onStep(null, 0); return emit('done'); }
      const l = lines[i], u = new SpeechSynthesisUtterance(l.text), v = voice();
      u.lang = lang; u.rate = rate; if (v) u.voice = v;
      u.onend = () => { if (t === token) { i++; next(); } };
      u.onerror = () => { if (t === token) emit('error'); };
      onStep && onStep(l.step, i);
      speechSynthesis.speak(u);
    };
    timer = setTimeout(next, 60);   // petit délai après cancel(), nécessaire sur certains navigateurs mobiles
  }
  return {
    play: () => run(state === 'paused' ? i : 0),
    pause: () => { token++; clearTimeout(timer); if (tts) speechSynthesis.cancel(); emit('paused'); },
    replay: () => run(0),
    setRate: r => { rate = r; if (state === 'playing') run(i); },
    stop: () => { token++; clearTimeout(timer); if (tts) speechSynthesis.cancel(); },
    get state() { return state; }, total: lines.length
  };
}
