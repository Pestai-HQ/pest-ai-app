// Pictogrammes d'action et de catégorie : ils portent le sens avant le texte (utilisateurs peu lecteurs).
const P = {
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z"/>',
  dropoff: '<path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z"/><path d="M3 3l18 18"/>',
  spacing: '<path d="M3 12h6M15 12h6M6 9l-3 3 3 3M18 9l3 3-3 3"/><path d="M12 5v14"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  sprout: '<path d="M12 21v-9"/><path d="M12 12C12 8 9 6 5 6c0 4 3 6 7 6z"/><path d="M12 15c0-3 2-5 6-5 0 3-2 5-6 5z"/>',
  spray: '<rect x="5" y="10" width="9" height="11" rx="2"/><path d="M7 10V6h5v4M12 6h4l2-2M19 7h2M19 10h2"/>',
  trap: '<path d="M3 19L12 5l9 14z"/><path d="M8.5 15h7M12 5V3"/>',
  bag: '<path d="M8 3h8l1 4c2 2 3 5 3 8 0 3-2 6-8 6s-8-3-8-6c0-3 1-6 3-8z"/><path d="M12 11v6M9 14h6"/>',
  fungus: '<path d="M3 12a9 8 0 0118 0z"/><path d="M9 12v6a3 3 0 006 0v-6"/><circle cx="8" cy="9" r=".9"/><circle cx="14" cy="8" r=".9"/>',
  insect: '<ellipse cx="12" cy="14" rx="4" ry="6"/><path d="M12 8V6M9 5l-2-2M15 5l2-2M8 12H4M16 12h4M8 16H5M16 16h3M9 19l-2 2M15 19l2 2"/>',
  gloves: '<path d="M7 12V6a1.5 1.5 0 013 0v5M10 11V4a1.5 1.5 0 013 0v7M13 11V5a1.5 1.5 0 013 0v8M16 13V9a1.5 1.5 0 013 0v6c0 4-3 6-6 6s-6-2-6-6v-2a1.5 1.5 0 013 0z"/>',
  mask: '<path d="M4 9c0-1 1-2 2-2h12c1 0 2 1 2 2v3c0 4-4 7-8 7s-8-3-8-7z"/><path d="M2 10h2M20 10h2M8 12h8M8 15h8"/>',
  wash: '<path d="M7 15a3 3 0 006 0c0-2-3-5-3-5s-3 3-3 5z"/><path d="M14 9a2.5 2.5 0 005 0c0-1.5-2.5-4-2.5-4S14 7.5 14 9z"/><path d="M4 21h16"/>',
  note: '<path d="M5 3h10l4 4v14H5z"/><path d="M14 3v5h5M8 12h8M8 16h6"/>',
  hoe: '<path d="M4 20L13 11"/><path d="M11 5l8 8-3 3-8-8z"/>',
  pin: '<path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="4"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  warn: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
  sound: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 010 6"/>'
};
export const pic = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${P[n] || P.sprout}</svg>`;
export const PICTO_NAMES = Object.keys(P);
