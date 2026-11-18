/* Tunnelblick FOCUS – „Dein Kopf hat 47 Tabs offen.“  ·  Szenen (nutzt lib.js) */
'use strict';
const LIME = '#D2EE4E', LIME2 = '#EEFFAA';
const HOOD = '#3a4356', HOOD_D = '#272d3b', HOOD_L = '#4b566d', HAIR = '#1c140f';
const COOL = '#7f9cc9', WARM = '#FFB866';
let TINS = { all: { w: 1, h: 1 }, watermelon: { w: 1, h: 1 }, strawberry: { w: 1, h: 1 }, blueberry: { w: 1, h: 1 } };

EMO.tired = { bl: [6, -6], br: [6, -6], lid: .55, eye: 1, mouth: 'flat' };
EMO.sadT = { bl: [12, -14], br: [12, -14], lid: .45, eye: 1, mouth: 'flat' };
EMO.hope = { bl: [-10, -14], br: [-10, -14], lid: .12, eye: 1.04, mouth: 'smile0', happy: .05 };
EMO.joy = { bl: [-14, -12], br: [-14, -12], lid: .05, eye: 1, mouth: 'smile', happy: .35 };

function tinImg(name, cx, cy, h, extra = '') {
  const d = TINS[name], w = h * d.w / d.h;
  const file = name === 'all' ? 'tins' : 'tin_' + name;
  return `<image href="../build/${file}.png" x="${f1(cx - w / 2)}" y="${f1(cy - h / 2)}" width="${f1(w)}" height="${f1(h)}" ${extra}/>`;
}
function defs2() {
  return `<defs>
  <linearGradient id="gWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2234"/><stop offset="1" stop-color="#0d121d"/></linearGradient>
  <linearGradient id="gWallW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a22"/><stop offset="1" stop-color="#1a1210"/></linearGradient>
  <radialGradient id="gPhone"><stop offset="0" stop-color="#bcd4ff" stop-opacity=".55"/><stop offset="1" stop-color="#bcd4ff" stop-opacity="0"/></radialGradient>
  <radialGradient id="gLime"><stop offset="0" stop-color="${LIME2}" stop-opacity=".9"/><stop offset=".45" stop-color="${LIME}" stop-opacity=".3"/><stop offset="1" stop-color="${LIME}" stop-opacity="0"/></radialGradient>
  <linearGradient id="gHood" x1="0" x2="1"><stop offset="0" stop-color="${HOOD_D}"/><stop offset=".5" stop-color="${HOOD_L}"/><stop offset="1" stop-color="${HOOD_D}"/></linearGradient>
  <linearGradient id="gDenim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f4a78"/><stop offset="1" stop-color="#1b2d4f"/></linearGradient>
  <filter id="fBlur3" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="fBlur10" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10"/></filter>
 </defs>`;
}

/* ---------- Figur im Hoodie (Brustbild) ---------- */
function person(o) {
  const hy = -640;
  let s = '';
  s += `<path d="M-150 -462 Q-176 -566 -112 -592 L112 -592 Q176 -566 150 -462 Z" fill="${HOOD_D}"/>`;
  s += `<path d="M-262 0 L-252 -320 Q-246 -420 -170 -450 L-74 -478 Q0 -432 74 -478 L170 -450 Q246 -420 252 -320 L262 0 Z" fill="url(#gHood)"/>`;
  s += `<path d="M-84 -476 Q0 -406 84 -476" stroke="${HOOD_D}" stroke-width="24" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M-34 -446 L-42 -322 M34 -446 L42 -312" stroke="#e6e6ec" stroke-width="7" stroke-linecap="round"/><circle cx="-42" cy="-318" r="7" fill="#cfd0d8"/><circle cx="42" cy="-308" r="7" fill="#cfd0d8"/>`;
  s += `<path d="M-160 -20 L-128 -190 L128 -190 L160 -20" stroke="${HOOD_D}" stroke-width="7" fill="none"/>`;
  s += `<rect x="-44" y="${hy + 100}" width="88" height="80" fill="${SKIN}"/><path d="M-44 ${hy + 132} Q0 ${hy + 156} 44 ${hy + 132}" stroke="${SKIN_D}" stroke-width="12" fill="none" opacity=".5"/>`;
  s += `<g transform="rotate(${f1(o.tilt || 0)} 0 ${hy + 120})">`;
  s += `<ellipse cx="-114" cy="${hy + 12}" rx="20" ry="30" fill="${SKIN}"/><ellipse cx="114" cy="${hy + 12}" rx="20" ry="30" fill="${SKIN}"/>`;
  s += `<path d="M-114 ${hy - 20} Q-118 ${hy + 86} -62 ${hy + 116} Q0 ${hy + 142} 62 ${hy + 116} Q118 ${hy + 86} 114 ${hy - 20} Q110 ${hy - 132} 0 ${hy - 134} Q-110 ${hy - 132} -114 ${hy - 20} Z" fill="${SKIN}"/>`;
  s += `<path d="M-90 ${hy + 70} Q0 ${hy + 150} 90 ${hy + 70}" stroke="${SKIN_D}" stroke-width="10" fill="none" opacity=".22"/>`;
  // Augenringe bei Müdigkeit
  if (o.rings) s += `<path d="M-74 ${hy + 46} Q-46 ${hy + 58} -18 ${hy + 46} M18 ${hy + 46} Q46 ${hy + 58} 74 ${hy + 46}" stroke="#8a5a6a" stroke-width="6" fill="none" opacity="${f1(.45 * o.rings)}"/>`;
  // zerzauste Haare
  s += `<path d="M-122 ${hy - 4} C-142 ${hy - 112} -92 ${hy - 178} -10 ${hy - 178} C72 ${hy - 192} 142 ${hy - 130} 124 ${hy - 8} C116 ${hy - 58} 102 ${hy - 70} 86 ${hy - 76} L98 ${hy - 112} L62 ${hy - 92} L54 ${hy - 132} L22 ${hy - 98} L-6 ${hy - 136} L-28 ${hy - 98} L-64 ${hy - 124} L-70 ${hy - 86} C-100 ${hy - 72} -114 ${hy - 42} -122 ${hy - 4} Z" fill="${HAIR}"/>`;
  s += `<path d="M-40 ${hy - 160} C10 ${hy - 178} 70 ${hy - 160} 100 ${hy - 120}" stroke="#3a2a20" stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"/>`;
  s += face(o, hy, false);
  if (o.glow) s += `<ellipse cx="0" cy="${hy + 60}" rx="150" ry="170" fill="url(#gPhone)" opacity="${f1(o.glow)}"/>`;
  if (o.warmFace) s += `<ellipse cx="0" cy="${hy + 40}" rx="170" ry="190" fill="url(#gWarm)" opacity="${f1(o.warmFace)}"/>`;
  s += `</g>`;
  // Hand mit Handy (unten vorne)
  if (o.phone) {
    s += `<path d="M250 40 L80 -330" stroke="url(#gHood)" stroke-width="88" stroke-linecap="round"/>`;
    s += `<g transform="translate(20,-420) rotate(-10)"><rect x="-58" y="-110" width="116" height="220" rx="18" fill="#0b0d12" stroke="#2a2f3a" stroke-width="4"/><rect x="-50" y="-100" width="100" height="196" rx="12" fill="#9fc0ff" opacity="${f1(.55 * (o.phone || 1))}"/></g>`;
    s += hand(52, -340, -40, 1, {});
  }
  // offene Hand mit Dose
  if (o.tin) {
    const k = o.tin;
    s += `<path d="M260 40 L150 -400" stroke="url(#gHood)" stroke-width="88" stroke-linecap="round"/>`;
    s += `<ellipse cx="126" cy="-452" rx="${f1(70 + 60 * k)}" ry="${f1(70 + 60 * k)}" fill="url(#gLime)" opacity="${f1(.9 * k)}"/>`;
    s += hand(126, -432, -20, 1.15, {});
    s += `<g opacity="${f1(clamp(k * 2))}">${tinImg('watermelon', 122, -500, 130 * (.6 + .4 * k))}</g>`;
  }
  return `<g transform="translate(${f1(o.x)},${f1(o.y)}) scale(${o.s ?? 1})">${s}</g>`;
}

/* ---------- Wohnung ---------- */
function apartment(t, o = {}) {
  const warm = o.warm || 0;
  let s = `<rect x="-300" y="-300" width="1680" height="2520" fill="url(#gWall)"/>`;
  if (warm > 0) s += `<rect x="-300" y="-300" width="1680" height="2520" fill="url(#gWallW)" opacity="${f1(warm)}"/>`;
  // Fenster mit Stadt bei Nacht
  s += `<rect x="600" y="360" width="420" height="560" rx="8" fill="#0a1124"/>`;
  for (let i = 0; i < 14; i++) { const bx = 600 + i * 32, bh = 140 + rnd(i * 5) * 260; s += `<rect x="${bx}" y="${920 - bh}" width="28" height="${bh}" fill="#070b18"/>`; for (let j = 0; j < 4; j++) if (rnd(i * 9 + j) > .55) s += `<rect x="${bx + 6 + (j % 2) * 10}" y="${940 - bh + 20 + j * 40}" width="6" height="9" fill="#FFD08A" opacity="${f1(.4 + .4 * rnd(i + j))}"/>`; }
  s += `<circle cx="930" cy="450" r="34" fill="#dfe8ff" opacity=".7"/><circle cx="930" cy="450" r="90" fill="url(#gCold)" opacity=".6"/>`;
  s += `<path d="M810 360 V920 M600 640 H1020" stroke="#1d2536" stroke-width="12"/><rect x="600" y="360" width="420" height="560" rx="8" fill="none" stroke="#1d2536" stroke-width="16"/>`;
  // Stehlampe
  s += `<rect x="120" y="560" width="10" height="700" fill="#2a2f3a"/><path d="M60 560 L190 560 L160 470 L90 470 Z" fill="${warm > .1 ? '#e8b46a' : '#2f3542'}"/>`;
  if (warm > 0) s += `<ellipse cx="125" cy="620" rx="${f1(320 * warm)}" ry="${f1(380 * warm)}" fill="url(#gWarm)" opacity="${f1(.9 * warm)}"/>`;
  // Pflanze
  s += `<path d="M960 1180 q-40 -120 -10 -200 M960 1180 q30 -100 70 -150 M960 1180 q-80 -60 -110 -130" stroke="#1d3a2a" stroke-width="22" fill="none" stroke-linecap="round"/><rect x="920" y="1170" width="80" height="90" rx="10" fill="#2a2f3a"/>`;
  s += `<rect x="-300" y="1250" width="1680" height="900" fill="#0b0f18"/>`;
  return s;
}
function couchBack(y = 1250) { return `<rect x="40" y="${y - 260}" width="1000" height="200" rx="60" fill="#232a3a"/>`; }
function couchFront(y = 1250) { return `<rect x="-40" y="${y - 90}" width="1160" height="260" rx="40" fill="#2b3346"/><rect x="-40" y="${y - 90}" width="1160" height="26" rx="13" fill="#38415a"/><rect x="-60" y="${y - 260}" width="140" height="420" rx="50" fill="#2e3649"/><rect x="980" y="${y - 260}" width="140" height="420" rx="50" fill="#2e3649"/>`; }

/* ---------- Handy mit Chat ---------- */
function bubble(x, y, lines, side, k, o = {}) {
  const fs = 34, lh = 44, pad = 22;
  const w = Math.max(...lines.map(l => tw(l, fs) * .97 + (/[\u{1F300}-\u{1FAFF}]/u.test(l) ? 24 : 0))) + pad * 2;
  const h = lines.length * lh + pad * 1.4;
  const bx = side === 'r' ? x - w : x;
  const sc = eBack(k);
  let s = `<g transform="translate(${f1(side === 'r' ? x : x)},${f1(y)}) scale(${f1(sc)}) translate(${f1(-(side === 'r' ? x : x))},${f1(-y)})" opacity="${f1(clamp(k * 3))}">`;
  s += `<rect x="${f1(bx)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="26" fill="${side === 'r' ? (o.col || '#3d6df2') : '#2a2f3a'}"/>`;
  lines.forEach((l, i) => { s += `<text x="${f1(bx + pad)}" y="${f1(y + pad + 22 + i * lh)}" font-size="${fs}" font-weight="600" fill="#fff">${l}</text>`; });
  if (o.status) s += `<text x="${f1(x)}" y="${f1(y + h + 34)}" text-anchor="end" font-size="24" font-weight="600" fill="#8a93a6">${o.status}</text>`;
  return s + `</g>`;
}
function phoneUI(t, o) {
  const X = o.x ?? CX, Y = o.y ?? 800, S = o.s ?? 1.12;
  const w = 560, h = 1080, sx = -w / 2, sy = -h / 2;
  let s = `<g transform="translate(${f1(X)},${f1(Y)}) rotate(${f1(o.rot || 0)}) scale(${S})">`;
  s += `<rect x="${sx - 18}" y="${sy - 18}" width="${w + 36}" height="${h + 36}" rx="78" fill="#07080c" stroke="#2c313d" stroke-width="5"/>`;
  s += `<rect x="${sx}" y="${sy}" width="${w}" height="${h}" rx="62" fill="${o.warm ? '#151018' : '#0e1118'}"/>`;
  s += `<rect x="-60" y="${sy + 14}" width="120" height="30" rx="15" fill="#000"/>`;
  // Kopfzeile
  s += `<text x="${sx + 40}" y="${sy + 42}" font-size="24" font-weight="700" fill="#cfd6e4">${o.clock || '18:47'}</text>`;
  s += `<rect x="${sx}" y="${sy + 70}" width="${w}" height="110" fill="#151a24"/>`;
  s += `<circle cx="${sx + 80}" cy="${sy + 125}" r="34" fill="#5b7bd5"/><text x="${sx + 80}" y="${sy + 137}" text-anchor="middle" font-size="34" font-weight="800" fill="#fff">J</text>`;
  s += `<text x="${sx + 132}" y="${sy + 120}" font-size="32" font-weight="700" fill="#fff">Jonas</text><text x="${sx + 132}" y="${sy + 152}" font-size="22" font-weight="600" fill="${o.online ? LIME : '#8a93a6'}">${o.online ? 'online' : 'zuletzt online vor 2 Min.'}</text>`;
  // Nachrichten (von unten nach oben gestapelt)
  let yy = sy + 230;
  for (const m of o.msgs || []) {
    if (m.k <= 0) continue;
    s += bubble(m.side === 'r' ? sx + w - 30 : sx + 30, yy, m.lines, m.side, m.k, { status: m.status, col: m.col });
    yy += m.lines.length * 44 + 60 + (m.status ? 30 : 0);
  }
  // Eingabefeld
  s += `<rect x="${sx + 24}" y="${sy + h - 110}" width="${w - 130}" height="76" rx="38" fill="#1c2230"/>`;
  const txt = o.typing || '';
  s += `<text x="${sx + 54}" y="${sy + h - 61}" font-size="30" font-weight="600" fill="${txt ? '#fff' : '#5d6578'}">${txt || 'Nachricht'}${txt && (Math.floor(t * 3) % 2 === 0) ? '|' : ''}</text>`;
  s += `<circle cx="${sx + w - 62}" cy="${sy + h - 72}" r="36" fill="${txt ? '#3d6df2' : '#2a2f3a'}"/><path d="M${sx + w - 76} ${sy + h - 72} L${sx + w - 46} ${sy + h - 72} M${sx + w - 58} ${sy + h - 84} L${sx + w - 46} ${sy + h - 72} L${sx + w - 58} ${sy + h - 60}" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  if (o.banner > 0) {
    const by = sy + 40 - (1 - eOut(o.banner)) * 200;
    s += `<g opacity="${f1(clamp(o.banner * 2))}"><rect x="${sx + 20}" y="${f1(by)}" width="${w - 40}" height="120" rx="28" fill="#f1f3f7"/><circle cx="${sx + 76}" cy="${f1(by + 60)}" r="30" fill="#5b7bd5"/><text x="${sx + 76}" y="${f1(by + 71)}" text-anchor="middle" font-size="30" font-weight="800" fill="#fff">J</text>
      <text x="${sx + 120}" y="${f1(by + 50)}" font-size="26" font-weight="800" fill="#111">Jonas</text><text x="${sx + 120}" y="${f1(by + 88)}" font-size="24" font-weight="600" fill="#444">Lange nicht gesehen …</text></g>`;
  }
  s += `<rect x="${sx}" y="${sy}" width="${w}" height="${h}" rx="62" fill="#000" opacity="${f1(o.dim || 0)}"/>`;
  return s + `</g>`;
}
function typed(full, k) { const n = Math.round(clamp(k) * [...full].length); return [...full].slice(0, n).join(''); }

/* ---------- Effekte ---------- */
function lightning(t, cx, cy, R, n, op, seed = 0) {
  let s = '';
  const fr = Math.floor(t * 15);
  for (let i = 0; i < n; i++) {
    if (rnd(fr * 7 + i * 13 + seed) < .45) continue;
    const a0 = rnd(i * 3 + fr + seed) * Math.PI * 2;
    let x = cx + Math.cos(a0) * R * .55, y = cy + Math.sin(a0) * R * .45, d = `M${f1(x)} ${f1(y)}`;
    for (let k = 1; k < 7; k++) { x += Math.cos(a0) * R * .09 + (rnd(fr + i * 5 + k) - .5) * 60; y += Math.sin(a0) * R * .09 + (rnd(fr * 3 + i + k * 7) - .5) * 60; d += ` L${f1(x)} ${f1(y)}`; }
    s += `<path d="${d}" stroke="${LIME2}" stroke-width="10" fill="none" opacity="${f1(.25 * op)}" filter="url(#fBlur6)"/><path d="${d}" stroke="#fff" stroke-width="3" fill="none" opacity="${f1(.9 * op)}"/>`;
  }
  return s;
}
function tunnel(t, k, cx = CX, cy = 900) {
  if (k <= .01) return '';
  let s = '';
  for (let i = 0; i < 9; i++) {
    const p = ((t * 1.6 + i / 9) % 1), r = 60 + Math.pow(p, 2.2) * 1400;
    s += `<circle cx="${cx}" cy="${cy}" r="${f1(r)}" fill="none" stroke="${LIME}" stroke-width="${f1(2 + 18 * p)}" opacity="${f1(k * .35 * (1 - p))}"/>`;
  }
  for (let i = 0; i < 40; i++) {
    const a = rnd(i * 7) * Math.PI * 2, r0 = 260 + rnd(i + Math.floor(t * 20)) * 300, len = 300 + rnd(i * 3) * 600;
    s += `<path d="M${f1(cx + Math.cos(a) * r0)} ${f1(cy + Math.sin(a) * r0)} L${f1(cx + Math.cos(a) * (r0 + len))} ${f1(cy + Math.sin(a) * (r0 + len))}" stroke="#fff" stroke-width="${f1(2 + rnd(i) * 4)}" opacity="${f1(k * .4)}"/>`;
  }
  return s + `<rect width="1080" height="1920" fill="url(#gVig)" opacity="${f1(k * .8)}"/>`;
}
function chip(x, y, txt, k, col = LIME) {
  if (k <= 0) return '';
  const w = tw(txt, 44) * 1.1 + 60;
  const sc = lerp(1.8, 1, eOut(k)), rot = -6 + 4 * Math.sin(x);
  return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(rot)}) scale(${f1(sc)})" opacity="${f1(clamp(k * 4))}"><rect x="${f1(-w / 2)}" y="-42" width="${f1(w)}" height="84" rx="16" fill="none" stroke="${col}" stroke-width="6"/><text y="15" text-anchor="middle" font-size="44" font-weight="900" fill="${col}" letter-spacing="1">${txt}</text></g>`;
}
const DISC = `<text x="${CX}" y="1500" text-anchor="middle" font-size="22" font-weight="600" fill="#fff" opacity=".72">Werbung | Nahrungsergänzungsmittel mit Koffein.</text><text x="${CX}" y="1528" text-anchor="middle" font-size="22" font-weight="600" fill="#fff" opacity=".72">Max. 3 Pouches pro Tag. Nicht für Kinder &amp; Schwangere.</text>`;
const DISC_P = `<text x="${CX}" y="1466" text-anchor="middle" font-size="23" font-weight="600" fill="#fff" opacity=".6">Preis zum Zeitpunkt der Aufnahme</text>`;

/* ---------- Szenen-Helfer ---------- */
let D = null, CH = null;
function wt(key, occ = 0, fb = null) { const k = norm(key); let c = 0; for (const w of D.words) if (norm(w.word).startsWith(k)) { if (c === occ) return w.start; c++; } return fb; }
function wEnd(key, occ = 0, fb = null) { const k = norm(key); let c = 0; for (const w of D.words) if (norm(w.word).startsWith(k)) { if (c === occ) return w.end; c++; } return fb; }
function blinkAt(t, off = 0) { const p = (t + off) % 3.4; return p < .14 ? Math.sin(p / .14 * Math.PI) : 0; }
const entry = (t, d = .35) => 1 - eOut(t / d);
const SC = {};
const P0 = { x: 520, y: 1600, s: 1.05 };   // Figur auf der Couch

function burst(t, t0, cx, cy, col, n = 22, R = 260) {
  const dt = t - t0; if (dt < 0 || dt > .7) return '';
  const k = eOut(dt / .7); let s = '';
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r1 = R * k, r0 = R * Math.max(0, k - .35); s += `<path d="M${f1(cx + Math.cos(a) * r0)} ${f1(cy + Math.sin(a) * r0)} L${f1(cx + Math.cos(a) * r1)} ${f1(cy + Math.sin(a) * r1)}" stroke="${col}" stroke-width="${f1(10 * (1 - k) + 2)}" stroke-linecap="round"/>`; }
  return s;
}

/* ===== Szenen „47 Tabs“ ===== */
const WM = '#E36A6E', WM2 = '#7CC47F', SB = '#E2474B', BB = '#6A70C9';
const TAB_TITLES = ['Mail: Re: Re: Angebot', 'To-Do (12)', 'Rechnung fällig', 'Gym-Plan', 'Mama zurückrufen', 'Einkaufsliste', 'Steuer 2025', 'Präsentation_final_v7', 'WhatsApp (3)', 'Urlaub buchen?', 'Kalender', 'Bewerbung', 'Kurs Woche 4', 'Netflix', 'Paket verfolgen', 'Arzttermin', 'Miete', 'Reels', 'Notizen', 'Banking'];
const DISC_S = `<text x="${CX}" y="1466" text-anchor="middle" font-size="22" font-weight="600" fill="#fff" opacity=".6">Vitamin B12 trägt zur Verringerung von Müdigkeit und Ermüdung bei.</text>`;

function tabWin(x, y, w, h, title, o = {}) {
  const op = o.op ?? 1, sc = o.sc ?? 1, rot = o.rot || 0, hi = o.hi;
  let s = `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(rot)}) scale(${f1(sc)})" opacity="${f1(op)}">`;
  s += `<rect x="${-w / 2 + 6}" y="${-h / 2 + 10}" width="${w}" height="${h}" rx="18" fill="#000" opacity=".35"/>`;
  s += `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="18" fill="${hi ? '#2a3150' : '#1d2230'}" stroke="${hi ? LIME : '#323a4d'}" stroke-width="${hi ? 5 : 3}"/>`;
  s += `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="54" rx="18" fill="#2a3142"/><rect x="${-w / 2}" y="${-h / 2 + 34}" width="${w}" height="20" fill="#2a3142"/>`;
  for (let i = 0; i < 3; i++) s += `<circle cx="${-w / 2 + 26 + i * 22}" cy="${-h / 2 + 27}" r="7" fill="${['#ff5f57', '#febc2e', '#28c840'][i]}"/>`;
  s += `<text x="${-w / 2 + 104}" y="${-h / 2 + 37}" font-size="24" font-weight="700" fill="#e6e9f0">${title}</text>`;
  s += `<text x="${w / 2 - 30}" y="${-h / 2 + 37}" text-anchor="middle" font-size="26" font-weight="700" fill="#8a93a6">×</text>`;
  for (let i = 0; i < Math.min(4, Math.floor((h - 80) / 34)); i++) s += `<rect x="${-w / 2 + 26}" y="${-h / 2 + 76 + i * 34}" width="${f1((w - 60) * (.9 - (i % 3) * .2))}" height="14" rx="7" fill="#323a4d"/>`;
  return s + `</g>`;
}
// Tab-Chaos um den Kopf: n Fenster, deterministische Positionen
function tabCloud(t, n, o = {}) {
  let s = '';
  const close = o.close || 0;      // 0..1: Tabs schließen sich nacheinander
  for (let i = 0; i < n; i++) {
    const ck = seg(close * n - (n - 1 - i), 0, 1);  // letzte zuerst
    if (ck >= 1) continue;
    const ang = rnd(i * 3.3) * Math.PI * 2;
    const rx = 250 + rnd(i * 7) * 220, ry = 280 + rnd(i * 5) * 380;
    let x = CX + Math.cos(ang + t * .08 * (rnd(i) - .5)) * rx, y = 860 + Math.sin(ang) * ry * .9;
    if (o.avoid && Math.abs(x - CX) < 330 && y > 560 && y < 1200) x = CX + Math.sign(x - CX || 1) * (330 + rnd(i * 19) * 120);
    const ag = seg(t, (o.t0 || 0) + i * (o.step ?? .14), (o.t0 || 0) + i * (o.step ?? .14) + .3);
    if (ag <= 0) continue;
    const jit = (o.jitter || 0) * Math.sin(t * 13 + i * 2);
    s += tabWin(x + jit, y + (1 - eOut(ag)) * 60, 300 + rnd(i * 11) * 120, 180 + rnd(i * 13) * 80, TAB_TITLES[i % TAB_TITLES.length], { op: eOut(ag) * (1 - ck) * (o.op ?? 1), sc: lerp(.6, 1, eBack(ag)) * (1 - ck * .3), rot: (rnd(i * 17) - .5) * 14 });
  }
  return s;
}
function desk(t, o = {}) {
  let s = `<rect x="-300" y="1300" width="1680" height="800" fill="#141821"/><rect x="-300" y="1290" width="1680" height="22" fill="#262c3a"/>`;
  // Laptop von hinten
  s += `<path d="M300 1295 L690 1295 L670 1060 L320 1060 Z" fill="#2a2f3a"/><path d="M320 1060 L670 1060" stroke="#c9d6ff" stroke-width="4" opacity="${f1(.6 * (o.screen ?? 1))}"/>`;
  s += `<circle cx="495" cy="1170" r="16" fill="#3a4050"/>`;
  s += `<ellipse cx="495" cy="1000" rx="380" ry="260" fill="url(#gPhone)" opacity="${f1(.35 * (o.screen ?? 1))}"/>`;
  return s;
}
const PD = { x: 495, y: 1640, s: 1.0 };

/* f01 – 47 Tabs offen */
SC.f01 = {
  setup() { D.N = wt('47'); D.Au = wt('aufgabe'); },
  sfx() { const s = [{ t: 0, type: 'room' }]; for (let i = 0; i < 14; i++) s.push({ t: (D.Au || 1) + i * .22, type: 'tab', gain: .5 + i * .03 }); s.push({ t: D.N, type: 'hit' }); return s; },
  render(t) {
    let w = apartment(t);
    w += person(Object.assign({}, PD, { emo: t > D.N ? 'worried' : 'tired', look: [0, -.2 + .3 * Math.sin(t * 3)], blink: blinkAt(t, 1), rings: .7, tilt: Math.sin(t * 1.5) * 2 }));
    w += desk(t);
    const n = Math.floor(lerp(0, 16, seg(t, D.Au || 1, D.N + .3)));
    w += tabCloud(t, n, { t0: D.Au || 1, step: .2, jitter: t > D.N ? 3 : 0, avoid: true });
    if (t >= D.N - .05) {
      const k = eBack(seg(t, D.N - .05, D.N + .3));
      w += `<g transform="translate(${CX},420) scale(${f1(k)})"><rect x="-230" y="-80" width="460" height="160" rx="40" fill="#ff3b55"/><text y="34" text-anchor="middle" font-size="96" font-weight="900" fill="#fff">47 Tabs</text></g>`;
    }
    const sh = shakeXY(t, D.N, .35, 14);
    w = cam(w, { z: 1.0 + .05 * t, fx: CX, fy: 960, sx: sh[0], sy: sh[1] });
    return { world: w, fx: `<rect width="1080" height="1920" fill="#0c1a3a" opacity=".22"/>`, sat: .7 };
  },
};

/* f02 – Mail, Nachricht, Termin */
SC.f02 = {
  setup() { D.Ma = wt('mail'); D.Na = wt('nachricht'); D.Te = wt('termin'); },
  sfx() { return [{ t: D.Ma, type: 'notif' }, { t: D.Na, type: 'ping' }, { t: D.Te, type: 'notif' }]; },
  render(t) {
    let w = `<rect width="1080" height="1920" fill="#0d1018"/>` + tabCloud(t + 6, 16, { t0: -5, op: .35, jitter: 2 });
    const card = (t0, y, body, col) => {
      const k = seg(t, t0 - .05, t0 + .3); if (k <= 0) return '';
      return `<g transform="translate(${CX},${y}) scale(${f1(eBack(k))})" filter="url(#fShadow)">${body(col)}</g>`;
    };
    w += card(D.Ma, 620, c => `<rect x="-360" y="-150" width="720" height="300" rx="28" fill="#f1f3f7"/><text x="-320" y="-90" font-size="30" font-weight="800" fill="#111">✉ Neue Mail · Entwurf</text><text x="-320" y="-30" font-size="30" font-weight="600" fill="#555">An: Chef</text><text x="-320" y="30" font-size="32" font-weight="600" fill="#111">Hey, wegen morgen …${Math.floor(t * 3) % 2 ? '|' : ''}</text><text x="-320" y="100" font-size="24" font-weight="700" fill="#c33">Seit 3 Tagen ungesendet</text>`);
    w += card(D.Na, 960, c => `<rect x="-360" y="-110" width="720" height="220" rx="28" fill="#1f2a44"/><circle cx="-280" cy="0" r="50" fill="#5b7bd5"/><text x="-280" y="14" text-anchor="middle" font-size="40" font-weight="800" fill="#fff">L</text><text x="-200" y="-20" font-size="32" font-weight="800" fill="#fff">Lisa</text><text x="-200" y="28" font-size="28" font-weight="600" fill="#b7c3dc">„Alles gut bei dir?“</text><circle cx="300" cy="-60" r="26" fill="#ff3b55"/><text x="300" y="-50" text-anchor="middle" font-size="28" font-weight="800" fill="#fff">3</text>`);
    w += card(D.Te, 1260, c => `<rect x="-360" y="-110" width="720" height="220" rx="28" fill="#f1f3f7"/><rect x="-360" y="-110" width="160" height="220" rx="28" fill="#ff3b55"/><text x="-280" y="-10" text-anchor="middle" font-size="34" font-weight="800" fill="#fff">MORGEN</text><text x="-280" y="50" text-anchor="middle" font-size="46" font-weight="900" fill="#fff">09:00</text><text x="-160" y="-10" font-size="34" font-weight="800" fill="#111">Termin</text><text x="-160" y="40" font-size="28" font-weight="600" fill="#555">Unterlagen noch nicht fertig</text>`);
    w = cam(w, { z: 1.0 + .03 * t, fx: CX, fy: 940, r: Math.sin(t * 1.3) * .6 });
    return { world: w, fx: `<rect width="1080" height="1920" fill="#0c1a3a" opacity=".18"/>`, subY: 1420, sat: .75 };
  },
};

/* f03 – irgendwo dazwischen: das, was du eigentlich wolltest */
SC.f03 = {
  setup() { D.Ei = wt('eigentlich'); },
  sfx() { return [{ t: D.Ei, type: 'chime' }]; },
  render(t) {
    const fz = eIO(seg(t, D.Ei - .4, D.Ei + .6));
    let w = `<rect width="1080" height="1920" fill="#0d1018"/>` + tabCloud(t + 12, 18, { t0: -10, op: lerp(.8, .25, fz) });
    // vergrabenes Fenster „Mein Ding“
    w += tabWin(640, 1010, 380, 240, 'Mein eigenes Ding ✨', { hi: true, op: lerp(.6, 1, fz), sc: lerp(.8, 1, fz), rot: lerp(8, 0, fz) });
    w += `<g opacity="${f1(fz)}"><text x="640" y="1060" text-anchor="middle" font-size="40">🎸 📷 🚀</text></g>`;
    w = cam(w, { z: lerp(1.0, 1.8, fz), fx: lerp(CX, 640, fz), fy: lerp(940, 1010, fz) });
    return { world: w, fx: '', sat: lerp(.7, .9, fz) };
  },
};

/* f04 – anfangen, scrollen, aufhören */
SC.f04 = {
  setup() { D.D2 = wt('du', 1) - .05; D.D3 = wt('du', 2) - .05; },
  sfx() { const s = [{ t: 0, type: 'type' }, { t: .1, type: 'type' }, { t: .2, type: 'type' }]; for (let x = D.D2; x < D.D3; x += .18) s.push({ t: x, type: 'swipe', gain: .4 }); s.push({ t: D.D3 + .3, type: 'door' }); return s; },
  render(t) {
    let w = `<rect width="1080" height="1920" fill="#0d1018"/>`;
    if (t < D.D2) {
      w += `<rect x="140" y="560" width="720" height="560" rx="20" fill="#f1f3f7"/><text x="190" y="640" font-size="34" font-weight="800" fill="#111">Neues Dokument</text>`;
      w += `<rect x="190" y="680" width="${f1(260 * seg(t, 0, D.D2))}" height="14" rx="7" fill="#9aa3b8"/><rect x="190" y="1060" width="620" height="18" rx="9" fill="#ddd"/><rect x="190" y="1060" width="${f1(620 * .03 * seg(t, 0, D.D2) + 4)}" height="18" rx="9" fill="${LIME}"/><text x="830" y="1050" text-anchor="end" font-size="26" font-weight="700" fill="#555">3 %</text>`;
      w = cam(w, { z: 1.1 + .05 * t, fx: CX, fy: 860 });
    } else if (t < D.D3) {
      const lt = t - D.D2;
      w += phoneUIfeed(t, lt);
      w = cam(w, { z: 1.05, fx: CX, fy: 900 });
    } else {
      const lt = t - D.D3, k = eIO(seg(lt, .1, .6));
      w += `<g transform="translate(${CX},1100) scale(1,${f1(1 - .96 * k)}) translate(${-CX},-1100)"><rect x="140" y="560" width="720" height="540" rx="20" fill="#f1f3f7"/><text x="190" y="640" font-size="34" font-weight="800" fill="#111">Neues Dokument</text><rect x="190" y="1060" width="620" height="18" rx="9" fill="#ddd"/><rect x="190" y="1060" width="22" height="18" rx="9" fill="${LIME}"/></g>`;
      w += `<rect x="120" y="1100" width="760" height="40" rx="10" fill="#2c3240"/>`;
      w = cam(w, { z: 1.1, fx: CX, fy: 900 });
    }
    return { world: w, fx: `<rect width="1080" height="1920" fill="#0c1a3a" opacity=".2"/>`, sat: .75 };
  },
};
function phoneUIfeed(t, lt) {
  let s = `<g transform="translate(${CX},860) scale(1.12)"><rect x="-298" y="-558" width="596" height="1116" rx="78" fill="#07080c" stroke="#2c313d" stroke-width="5"/><rect x="-280" y="-540" width="560" height="1080" rx="62" fill="#111"/>`;
  s += `<clipPath id="feed"><rect x="-280" y="-540" width="560" height="1080" rx="62"/></clipPath><g clip-path="url(#feed)">`;
  const off = (lt * 2600) % 540;
  const cols = ['#e3824a', '#5b7bd5', '#c0587a', '#3fa37a', '#d1b04a', '#7a5bd5'];
  for (let i = -1; i < 4; i++) { const idx = Math.floor(lt * 2600 / 540) + i; s += `<rect x="-280" y="${f1(-540 + i * 540 - off + 540)}" width="560" height="530" fill="${cols[((idx % 6) + 6) % 6]}"/><text x="0" y="${f1(-540 + i * 540 - off + 540 + 300)}" text-anchor="middle" font-size="120">${['😂', '🔥', '🐶', '🍕', '😱', '🎮'][((idx % 6) + 6) % 6]}</text>`; }
  s += `</g></g>`;
  return s;
}

/* f05 – wo ist die Zeit hin */
SC.f05 = {
  setup() { D.Ze = wt('zeit'); },
  sfx() { return [{ t: 0, type: 'clockspin' }, { t: D.Ze, type: 'sigh' }]; },
  render(t) {
    const k = seg(t, 0, D.duration);
    let w = apartment(t);
    w += `<rect x="600" y="360" width="420" height="560" fill="#5a7ab8" opacity="${f1(.5 * (1 - k))}"/>`;
    w += person(Object.assign({}, PD, { emo: 'sadT', look: [.6, -.5], blink: blinkAt(t, .3), rings: 1, tilt: -5 }));
    w += desk(t, { screen: .5 });
    w += `<g transform="translate(260,520)"><circle r="100" fill="#e9ecf2"/><path d="M0 0 L0 -60" stroke="#111" stroke-width="10" stroke-linecap="round" transform="rotate(${f1(t * 400)})"/><path d="M0 0 L0 -82" stroke="#c33" stroke-width="5" transform="rotate(${f1(t * 4800)})"/></g>`;
    w += `<text x="260" y="690" text-anchor="middle" font-size="40" font-weight="800" fill="#cfd6e4">${String(14 + Math.floor(k * 9)).padStart(2, '0')}:${String(Math.floor(k * 540) % 60).padStart(2, '0')}</text>`;
    w = cam(w, { z: 1.1 + .05 * t, fx: CX, fy: 980 });
    return { world: w, fx: `<rect width="1080" height="1920" fill="#0c1a3a" opacity="${f1(.2 + .15 * k)}"/>`, sat: .65 };
  },
};

/* f06 – Wende: alles wird leiser, Tabs schließen sich */
SC.f06 = {
  setup() { D.Ma = wt('manchmal'); D.Le = wt('leiser'); },
  sfx() { const s = [{ t: 0, type: 'mark_turn' }]; for (let i = 0; i < 12; i++) s.push({ t: .9 + i * (Math.max(1, D.Le - 1.2) / 12), type: 'tabclose', gain: .6 }); s.push({ t: D.Le, type: 'chime' }); return s; },
  render(t) {
    const cl = seg(t, .8, D.Le), calm = seg(t, D.Le - .5, D.duration);
    let w = apartment(t, { warm: .5 * calm });
    w += person(Object.assign({}, PD, { emo: 'tired', emo2: 'hope', emoK: seg(t, D.Le - .6, D.Le + .4), look: [0, -.2], blink: blinkAt(t, .8), rings: 1 - calm, tilt: lerp(-3, 0, calm) }));
    w += desk(t, { screen: 1 - calm });
    const tk = eOut(seg(t, D.Le, D.duration));
    if (tk > 0) w += `<ellipse cx="770" cy="1260" rx="${f1(150 * tk)}" ry="${f1(110 * tk)}" fill="url(#gLime)"/><g opacity="${f1(tk)}">${tinImg('watermelon', 770, 1250 - 20 * tk, 170)}</g>`;
    w += tabCloud(t + 20, 16, { t0: -20, close: cl, avoid: true });
    w = cam(w, { z: lerp(1.0, 1.25, eIO(calm)), fx: lerp(CX, 560, calm), fy: lerp(960, 1080, calm) });
    return { world: w, fx: `<rect width="1080" height="1920" fill="#0c1a3a" opacity="${f1(.22 * (1 - calm))}"/>`, sat: lerp(.7, 1.0, calm) };
  },
};

/* f07 – Produkt: Tunnelblick Focus, 75 mg, L-Theanin, B12 */
SC.f07 = {
  setup() { D.Mg = wt('75'); D.Lt = wt('ltheanin'); D.Vb = wt('vitamin'); },
  sfx() { return [{ t: 0, type: 'mark_drop' }, { t: 0, type: 'zap' }, { t: 0, type: 'hit' }, { t: D.Mg, type: 'zap', gain: .6 }, { t: D.Lt, type: 'pop' }, { t: D.Vb, type: 'pop' }]; },
  render(t) {
    let w = `<rect width="1080" height="1920" fill="#06070a"/><ellipse cx="${CX}" cy="900" rx="520" ry="420" fill="url(#gLime)" opacity="${f1(.3 + .1 * Math.sin(t * 6))}"/>`;
    w += lightning(t, CX, 900, 700, 6, .7, 2);
    const pk = eBack(seg(t, 0, .45));
    w += `<g transform="translate(${CX},${f1(780 + Math.sin(t * 2) * 8)}) scale(${(pk * (1 + .02 * t)).toFixed(3)})">${tinImg('all', 0, 0, 255, 'filter="url(#fShadow)"')}</g>`;
    w += `<g opacity="${f1(eOut(seg(t, .2, .6)))}"><rect x="${CX - 120}" y="930" width="240" height="64" rx="32" fill="none" stroke="#fff" stroke-width="4"/><text x="${CX}" y="974" text-anchor="middle" font-size="38" font-weight="800" fill="#fff" letter-spacing="6">FOCUS</text></g>`;
    if (t >= D.Mg - .05) { const k = eBack(seg(t, D.Mg - .05, D.Mg + .3)); w += `<g transform="translate(${CX},500) scale(${f1(k)})"><text text-anchor="middle" font-size="170" font-weight="900" fill="#fff" letter-spacing="-4">75 mg</text><text y="70" text-anchor="middle" font-size="54" font-weight="800" fill="${LIME}" letter-spacing="14">KOFFEIN</text></g>`; }
    w += chip(CX, 1080, '+ L-THEANIN', seg(t, D.Lt, D.Lt + .2), '#fff') + chip(CX, 1172, '+ VITAMIN B12', seg(t, D.Vb, D.Vb + .2), '#fff');
    const sh = shakeXY(t, 0, .4, 20);
    w = cam(w, { z: 1 + .02 * t + (1 - eOut(seg(t, 0, .4))) * .3, fx: CX, fy: 900, sx: sh[0], sy: sh[1] });
    return { world: w, fx: tunnel(t, 1 - seg(t, .3, 1.3)) + flashRect(.8 * (1 - seg(t, 0, .15)), LIME2) + DISC_S + DISC, subY: 1360 };
  },
};

/* f08 – 0 % */
SC.f08 = {
  setup() { D.Zk = wt('zucker'); D.Ni = wt('nikotin'); D.Ta = wt('tabak'); },
  sfx() { return [{ t: D.Zk, type: 'stamp' }, { t: D.Ni, type: 'stamp' }, { t: D.Ta, type: 'stamp' }]; },
  render(t) {
    let w = `<rect width="1080" height="1920" fill="#06070a"/><ellipse cx="${CX}" cy="760" rx="520" ry="400" fill="url(#gLime)" opacity=".22"/>`;
    w += `<g transform="translate(${CX},680) scale(${(.9 + .02 * t).toFixed(3)})">${tinImg('all', 0, 0, 240, 'filter="url(#fShadow)"')}</g>`;
    w += chip(CX, 960, '0 % ZUCKER', seg(t, D.Zk, D.Zk + .2)) + chip(CX, 1065, '0 % NIKOTIN', seg(t, D.Ni, D.Ni + .2)) + chip(CX, 1170, '0 % TABAK', seg(t, D.Ta, D.Ta + .2));
    const s2 = shakeXY(t, D.Zk, .2, 8), s3 = shakeXY(t, D.Ni, .2, 8), s4 = shakeXY(t, D.Ta, .2, 8);
    w = cam(w, { z: 1 + .02 * t, fx: CX, fy: 900, sx: s2[0] + s3[0] + s4[0], sy: s2[1] + s3[1] + s4[1] });
    return { world: w, fx: DISC, subY: 1360 };
  },
};

/* f09 – Anwendung: unter die Lippe, 10–15 Min., kein Kaffee/keine Dose */
SC.f09 = {
  setup() { D.Li = wt('lippe'); D.Mi = wt('minuten'); D.Fe = wt('fertig'); D.Ka = wt('kaffee'); D.Do = wt('dose'); },
  sfx() { return [{ t: D.Li, type: 'pop' }, { t: D.Mi, type: 'tickT' }, { t: D.Fe, type: 'ding' }, { t: D.Ka, type: 'strike' }, { t: D.Do, type: 'strike' }]; },
  render(t) {
    let w = `<rect width="1080" height="1920" fill="#0b0d12"/>`;
    const step = (i, x, y, t0, ic, lab) => { const k = eBack(seg(t, t0 - .05, t0 + .3)); if (k <= 0) return ''; return `<g transform="translate(${x},${y}) scale(${f1(k)})"><circle r="120" fill="#161b26" stroke="${LIME}" stroke-width="6"/>${ic}<circle cx="-90" cy="-90" r="34" fill="${LIME}"/><text x="-90" y="-78" text-anchor="middle" font-size="36" font-weight="900" fill="#111">${i}</text><text y="180" text-anchor="middle" font-size="34" font-weight="800" fill="#fff">${lab}</text></g>`; };
    const tk = seg(t, D.Mi, D.Fe);
    w += step(1, 230, 500, D.Li, `<path d="M-70 10 Q0 -40 70 10 Q0 60 -70 10 Z" fill="#E6AE88" stroke="#C58A64" stroke-width="6"/><rect x="-30" y="-14" width="60" height="22" rx="8" fill="#fff"/>`, 'unter die Lippe');
    w += step(2, 760, 500, D.Mi, `<circle r="70" fill="none" stroke="#323a4d" stroke-width="14"/><path d="M0 -70 A70 70 0 ${tk > .5 ? 1 : 0} 1 ${f1(70 * Math.sin(tk * 2 * Math.PI * .999))} ${f1(-70 * Math.cos(tk * 2 * Math.PI * .999))}" stroke="${LIME}" stroke-width="14" fill="none" stroke-linecap="round"/><text y="14" text-anchor="middle" font-size="36" font-weight="900" fill="#fff">10–15</text>`, 'Minuten');
    w += step(3, CX, 820, D.Fe, `<path d="M-45 0 L-12 34 L50 -36" stroke="${LIME}" stroke-width="20" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`, 'fertig');
    const nk = (t0, x, ic) => { const k = eBack(seg(t, t0 - .05, t0 + .3)); if (k <= 0) return ''; const xk = eOut(seg(t, t0 + .25, t0 + .5)); return `<g transform="translate(${x},1150) scale(${f1(k)})"><text y="40" text-anchor="middle" font-size="120">${ic}</text><path d="M-80 -60 L${f1(-80 + 160 * xk)} ${f1(-60 + 140 * xk)}" stroke="#ff3b55" stroke-width="16" stroke-linecap="round"/></g>`; };
    w += nk(D.Ka, 330, '☕') + nk(D.Do, 660, '🥤');
    w = cam(w, { z: 1 + .02 * t, fx: CX, fy: 900 });
    return { world: w, fx: DISC, subY: 1400 };
  },
};

/* f10 – drei Sorten */
SC.f10 = {
  setup() { D.Wa = wt('watermelon'); D.St = wt('strawberry'); D.Bl = wt('blueberry'); D.Sw = wt('sweden'); },
  sfx() { return [{ t: D.Wa, type: 'whoosh' }, { t: D.St, type: 'whoosh' }, { t: D.Bl, type: 'whoosh' }, { t: D.Sw, type: 'pop' }]; },
  render(t) {
    let w = `<rect width="1080" height="1920" fill="#08090d"/>`;
    const fl = [['watermelon', D.Wa, WM2, 'WATERMELON MINT'], ['strawberry', D.St, SB, 'STRAWBERRY'], ['blueberry', D.Bl, BB, 'BLUEBERRY']];
    let cur = 0; fl.forEach((f, i) => { if (t >= f[1] - .1) cur = i; });
    const f = fl[cur];
    w += `<ellipse cx="${CX}" cy="860" rx="520" ry="520" fill="${f[2]}" opacity=".22" filter="url(#fBlur30)"/>`;
    fl.forEach((g, i) => { const on = i === cur, k = eOut(seg(t, g[1] - .15, g[1] + .25)); if (k <= 0) return;
      const x = on ? CX : CX + (i - cur) * 330, sc = on ? 1 : .5;
      w += `<g transform="translate(${f1(lerp(1400, x, k))},${on ? 860 : 1120}) scale(${sc}) rotate(${f1(on ? Math.sin(t * 2) * 3 : 0)})" opacity="${on ? 1 : .55}">${tinImg(g[0], 0, 0, 520, 'filter="url(#fShadow)"')}</g>`; });
    w += `<text x="${CX}" y="470" text-anchor="middle" font-size="64" font-weight="900" fill="${f[2]}" letter-spacing="4">${f[3]}</text>`;
    if (t >= D.Sw - .05) { const k = eBack(seg(t, D.Sw - .05, D.Sw + .3)); w += `<g transform="translate(${CX},1280) scale(${f1(k)})"><rect x="-260" y="-60" width="520" height="120" rx="60" fill="#fff"/><rect x="-220" y="-30" width="96" height="60" rx="6" fill="#006aa7"/><rect x="-196" y="-30" width="18" height="60" fill="#fecc00"/><rect x="-220" y="-9" width="96" height="18" fill="#fecc00"/><text x="50" y="16" text-anchor="middle" font-size="46" font-weight="800" fill="#111">Made in Sweden</text></g>`; }
    w = cam(w, { z: 1 + .02 * t, fx: CX, fy: 900 });
    return { world: w, fx: DISC, subY: 1410 };
  },
};

/* f11 – fast 10.000 gekauft */
SC.f11 = {
  setup() { D.Ge = wt('gekauft'); },
  sfx() { const s = []; for (let x = .1; x < 1.4; x += .07) s.push({ t: x, type: 'tickT', gain: .5 }); s.push({ t: 1.45, type: 'cash' }); return s; },
  render(t) {
    let w = `<rect width="1080" height="1920" fill="#08090d"/><ellipse cx="${CX}" cy="800" rx="480" ry="380" fill="url(#gLime)" opacity=".2"/>`;
    const n = Math.round(9917 * eOut(seg(t, .1, 1.45)));
    w += `<text x="${CX}" y="760" text-anchor="middle" font-size="180" font-weight="900" fill="#fff" letter-spacing="-4">${n.toLocaleString('de-DE')}</text>`;
    w += `<text x="${CX}" y="850" text-anchor="middle" font-size="54" font-weight="800" fill="${LIME}" letter-spacing="10">MAL GEKAUFT</text>`;
    const sk = eOut(seg(t, .8, 1.6));
    w += `<g opacity="${f1(sk)}"><text x="${CX}" y="1010" text-anchor="middle" font-size="80" fill="#FFC83D" letter-spacing="8">★★★★☆</text><text x="${CX}" y="1090" text-anchor="middle" font-size="40" font-weight="700" fill="#cfd6e4">4,4 von 5 · 478 Bewertungen</text></g>`;
    w += burst(t, 1.45, CX, 720, LIME, 22, 420);
    w = cam(w, { z: 1 + .03 * t, fx: CX, fy: 900 });
    return { world: w, fx: `<text x="${CX}" y="1466" text-anchor="middle" font-size="22" font-weight="600" fill="#fff" opacity=".6">Laut TikTok Shop, Stand 18.11.2026</text>` + DISC, subY: 1360 };
  },
};

/* f12/f13 – Preis & Coupon: Szenen aus dem ersten Tunnelblick-Video */
SC.f12 = {
  setup() { D.F = wt('15'); D.Z = wt('10'); },
  sfx() { return [{ t: 0, type: 'whoosh', gain: .5 }, { t: D.F + .2, type: 'strike' }, { t: D.Z, type: 'cash' }]; },
  render(t) {
    let w = `<rect width="1080" height="1920" fill="#07080b"/><ellipse cx="${CX}" cy="760" rx="520" ry="400" fill="url(#gLime)" opacity=".28"/>`;
    w += lightning(t, CX, 760, 600, 4, .5, 4);
    w += `<g transform="translate(${CX},680) scale(${(.92 + .02 * t).toFixed(3)})">${tinImg('all', 0, 0, 255, 'filter="url(#fShadow)"')}</g>`;
    w += `<text x="${CX}" y="430" text-anchor="middle" font-size="60" font-weight="900" fill="#fff" letter-spacing="4">3er-SET</text>`;
    const ok = eOut(seg(t, D.F - .3, D.F + .1));
    w += `<g opacity="${f1(ok)}"><text x="${CX}" y="980" text-anchor="middle" font-size="90" font-weight="800" fill="#8a93a6">14,99 €</text>`;
    const sk = eOut(seg(t, D.F + .2, D.F + .5));
    w += `<path d="M${CX - 190} 950 L${f1(CX - 190 + 380 * sk)} ${f1(950 - 30 * sk)}" stroke="#ff3b55" stroke-width="12" stroke-linecap="round"/></g>`;
    if (t >= D.Z - .05) { const k = eBack(seg(t, D.Z - .05, D.Z + .3)); w += `<g transform="translate(${CX},1170) scale(${f1(k)})"><text text-anchor="middle" font-size="200" font-weight="900" fill="${LIME}" letter-spacing="-4">9,99 €</text></g>`; w += burst(t, D.Z, CX, 1110, LIME, 22, 420); }
    w = cam(w, { z: 1 + .02 * t + entry(t) * .1, fx: CX, fy: 900 });
    return { world: w, fx: DISC_P + DISC, subY: 1350 };
  },
};
SC.f13 = {
  setup() { D.Wk = wt('warenkorb'); D.Co = wt('coupon'); D.Gu = wt('günstiger'); },
  sfx() { return [{ t: D.Wk, type: 'pop' }, { t: D.Co, type: 'swipe' }, { t: D.Gu, type: 'ding' }]; },
  render(t) {
    let w = `<rect width="1080" height="1920" fill="#07080b"/><ellipse cx="${CX}" cy="880" rx="520" ry="420" fill="url(#gLime)" opacity=".2"/>`;
    const ck = eBack(seg(t, D.Wk, D.Wk + .3));
    w += `<g transform="translate(${CX},560) scale(${f1(ck)})"><circle r="150" fill="#151a24" stroke="${LIME}" stroke-width="6"/><text y="52" text-anchor="middle" font-size="150">🛒</text></g>`;
    const tk = eOut(seg(t, D.Co - .15, D.Co + .35));
    w += `<g transform="translate(${f1(lerp(1500, CX, tk))},900) rotate(${f1(lerp(20, -4, tk))}) scale(.86)" filter="url(#fShadow)"><path d="M-330 -110 H330 V-40 A40 40 0 0 0 330 40 V110 H-330 V40 A40 40 0 0 0 -330 -40 Z" fill="${LIME}"/>
      <path d="M-170 -110 V110" stroke="#111" stroke-width="5" stroke-dasharray="14 12" opacity=".5"/><text x="-250" y="26" text-anchor="middle" font-size="80">🎟️</text>
      <text x="80" y="-8" text-anchor="middle" font-size="58" font-weight="900" fill="#111">COUPON</text><text x="80" y="50" text-anchor="middle" font-size="38" font-weight="800" fill="#111">im Warenkorb checken</text></g>`;
    if (t >= D.Gu - .05) { const gk = eBack(seg(t, D.Gu - .05, D.Gu + .3)); w += `<g transform="translate(${CX},1190) scale(${f1(gk)})"><rect x="-290" y="-56" width="580" height="112" rx="56" fill="#fff"/><text y="17" text-anchor="middle" font-size="46" font-weight="900" fill="#111">oft noch günstiger ↓</text></g>`; }
    w = cam(w, { z: 1 + .02 * t, fx: CX, fy: 900 });
    return { world: w, fx: DISC_P + DISC, subY: 1350 };
  },
};

/* f14 – Mach die Tabs zu */
SC.f14 = {
  setup() { D.Ta = wt('tabs'); D.Wk = wt('warenkorb'); },
  sfx() { return [{ t: D.Ta, type: 'tabclose' }, { t: D.Ta + .05, type: 'hit', gain: .6 }, { t: D.Wk, type: 'ding' }]; },
  render(t) {
    const cl = seg(t, D.Ta - .1, D.Ta + .5);
    let w = apartment(t, { warm: 1 });
    w += person(Object.assign({}, PD, { x: 560, emo: 'joy', look: [-.2, -.1], blink: blinkAt(t, .2), tilt: 3, warmFace: .6 }));
    w += desk(t, { screen: .3 });
    // letzter Tab schließt sich mit Klick
    if (cl < 1) w += `<g opacity="${f1(1 - cl)}">${tabWin(CX, 560, 520, 260, '47 Tabs offen …', { sc: 1 - .4 * cl })}</g>`;
    if (t >= D.Ta - .1 && t < D.Ta + .5) w += `<g transform="translate(${CX + 210},${448})"><path d="M0 0 L0 60 L16 46 L28 72 L40 66 L28 40 L48 40 Z" fill="#fff" stroke="#111" stroke-width="4"/></g>`;
    w = cam(w, { z: 1.12 + .03 * t, fx: 540, fy: 1000 });
    let fx = `<g transform="translate(250,1080)">${tinImg('all', 0, 0, 150, 'filter="url(#fShadow)"')}</g>`;
    const k = eBack(seg(t, D.Wk - .05, D.Wk + .3));
    fx += `<g transform="translate(${CX + 120},1180) scale(${f1(k)})"><rect x="-220" y="-56" width="440" height="112" rx="56" fill="${LIME}" filter="url(#fGlowG)"/><text y="18" text-anchor="middle" font-size="50" font-weight="900" fill="#111">🛒 Warenkorb</text></g>`;
    fx += DISC_P + DISC;
    return { world: w, fx, sat: 1.05, subY: 1350 };
  },
};
/* ---------- API ---------- */
let SCN = null;
window.setup = function (data) {
  D = JSON.parse(JSON.stringify(data));
  if (data.tins) TINS = data.tins;
  SCN = SC[D.id]; SCN.setup.call(SCN);
  CH = buildChunks(D.words || []);
  return true;
};
window.info = function () { return { sfx: SCN.sfx.call(SCN).filter(s => s.t != null && !isNaN(s.t)) }; };
window.renderFrame = function (t) {
  UID = 0;
  const r = SCN.render.call(SCN, t);
  const world = document.getElementById('world');
  let flt = '';
  if (r.sat != null) flt += `saturate(${r.sat}) `;
  if (r.sepia) flt += `sepia(${r.sepia}) `;
  world.style.filter = flt || 'none';
  world.innerHTML = defs() + defs2() + r.world;
  document.getElementById('fx').innerHTML = defs() + defs2() + (r.fx || '') + vignette(.7) + grain(t, 50);
  document.getElementById('subs').innerHTML = subtitles(t, D.words || [], CH, r.subY || 1420, D.duration);
  return true;
};
window.guides = on => document.body.classList.toggle('guides', !!on);
