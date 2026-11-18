/* Tunnelblick – „Du bist nicht faul.“  ·  Szenen (nutzt lib.js) */
'use strict';
const LIME = '#D2EE4E', LIME2 = '#EEFFAA';
const HOOD = '#3a4356', HOOD_D = '#272d3b', HOOD_L = '#4b566d', HAIR = '#1c140f';
const COOL = '#7f9cc9', WARM = '#FFB866';
let TINS = { all: { w: 1, h: 1 }, energy: { w: 1, h: 1 }, coffee: { w: 1, h: 1 }, cola: { w: 1, h: 1 } };

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
    s += `<g opacity="${f1(clamp(k * 2))}">${tinImg('energy', 122, -500, 130 * (.6 + .4 * k))}</g>`;
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
const DISC = `<text x="${CX}" y="1512" text-anchor="middle" font-size="23" font-weight="600" fill="#fff" opacity=".72">Werbung | Hoher Koffeingehalt. Nicht für Kinder, Schwangere und Stillende.</text>`;
const DISC_P = `<text x="${CX}" y="1482" text-anchor="middle" font-size="23" font-weight="600" fill="#fff" opacity=".6">Preis zum Zeitpunkt der Aufnahme</text>`;

/* ---------- Szenen-Helfer ---------- */
let D = null, CH = null;
function wt(key, occ = 0, fb = null) { const k = norm(key); let c = 0; for (const w of D.words) if (norm(w.word).startsWith(k)) { if (c === occ) return w.start; c++; } return fb; }
function wEnd(key, occ = 0, fb = null) { const k = norm(key); let c = 0; for (const w of D.words) if (norm(w.word).startsWith(k)) { if (c === occ) return w.end; c++; } return fb; }
function blinkAt(t, off = 0) { const p = (t + off) % 3.4; return p < .14 ? Math.sin(p / .14 * Math.PI) : 0; }
const entry = (t, d = .35) => 1 - eOut(t / d);
const SC = {};
const P0 = { x: 520, y: 1600, s: 1.05 };   // Figur auf der Couch

/* 1 – Du bist nicht faul. Du bist einfach … müde. */
SC.s01 = {
  setup() { D.Mu = wt('müde'); },
  sfx() { return [{ t: 0, type: 'room' }, { t: D.Mu, type: 'sigh' }]; },
  render(t) {
    let w = apartment(t) + couchBack();
    const slowBlink = t > D.Mu ? Math.sin(clamp((t - D.Mu) / .7) * Math.PI) * .9 : blinkAt(t, 1.2);
    w += person(Object.assign({}, P0, { emo: 'tired', look: [.1, .8], blink: slowBlink, tilt: -7 + Math.sin(t * .8) * 1.5, rings: 1, phone: 1, glow: .9 }));
    w += couchFront();
    w = cam(w, { z: 1.15 + .05 * t, fx: 520, fy: 1060 });
    return { world: w, fx: `<rect width="1080" height="1920" fill="#0c1a3a" opacity=".28"/>`, sat: .55 };
  },
};

/* 2 – 6:30, Bahn, Büro */
SC.s02 = {
  setup() { D.A1 = wt('angefangen') - .1; D.A2 = wt('irgendwie') - .1; D.Au = wt('aufhört'); },
  sfx() { return [{ t: 0, type: 'alarm', dur: D.A1 }, { t: D.A1, type: 'train', dur: D.A2 - D.A1 + .2 }, { t: D.A2, type: 'notif' }, { t: D.A2 + .5, type: 'notif' }, { t: D.A2 + 1.0, type: 'notif' }, { t: D.Au, type: 'clockspin' }]; },
  render(t) {
    let w = '';
    if (t < D.A1) {
      const sh = Math.sin(t * 60) * 5 * (Math.floor(t * 2) % 2 === 0 ? 1 : 0);
      w += `<rect width="1080" height="1920" fill="#070910"/><rect x="0" y="1150" width="1080" height="800" fill="#0c0f18"/>`;
      w += `<rect x="160" y="1000" width="760" height="160" rx="20" fill="#1b202c"/><path d="M-100 1300 Q300 1200 700 1300 T1300 1280 L1300 1920 L-100 1920 Z" fill="#232a3d"/>`;
      w += `<g transform="translate(${f1(CX + sh)},880)"><rect x="-260" y="-110" width="520" height="220" rx="30" fill="#0a0b0e" stroke="#2a2f3a" stroke-width="6"/><text y="52" text-anchor="middle" font-size="150" font-weight="800" fill="#ff3b3b" opacity="${(Math.floor(t * 4) % 2) ? 1 : .55}">06:30</text></g>`;
      w += `<ellipse cx="${CX}" cy="880" rx="420" ry="260" fill="#ff3b3b" opacity=".08"/>`;
      w = cam(w, { z: 1.1 + .06 * t, fx: CX, fy: 960 });
    } else if (t < D.A2) {
      const lt = t - D.A1;
      w += `<rect width="1080" height="1920" fill="#0b0f19"/>`;
      w += `<rect x="60" y="360" width="900" height="760" rx="40" fill="#141c2e"/>`;
      for (let i = 0; i < 26; i++) { const x = ((rnd(i) * 1400 - lt * (900 + rnd(i * 3) * 900)) % 1400 + 1400) % 1400 - 200; w += `<rect x="${f1(x)}" y="${f1(420 + rnd(i * 7) * 640)}" width="${f1(80 + rnd(i) * 220)}" height="${f1(4 + rnd(i * 5) * 8)}" fill="#ffd08a" opacity="${f1(.15 + .35 * rnd(i * 2))}"/>`; }
      for (let i = 0; i < 40; i++) { const y = ((rnd(i * 3) * 760 + lt * 600) % 760) + 360; w += `<path d="M${f1(80 + rnd(i) * 860)} ${f1(y)} l-6 40" stroke="#9fb7ff" stroke-width="3" opacity=".4"/>`; }
      w += `<rect x="60" y="360" width="900" height="760" rx="40" fill="none" stroke="#2a3245" stroke-width="22"/>`;
      w += `<rect x="760" y="200" width="22" height="1500" fill="#8e97a8"/>`;
      w += person({ x: 470, y: 1720, s: 1.0, emo: 'tired', look: [.6, 0], blink: blinkAt(t, .4), rings: 1, tilt: 6 });
      w = cam(w, { z: 1.12 + .04 * lt, fx: 520, fy: 1000, sy: Math.sin(t * 22) * 2 });
    } else {
      const lt = t - D.A2;
      w += `<rect width="1080" height="1920" fill="#0d1018"/>`;
      // Wanduhr dreht durch
      const sp = t > D.Au ? (t - D.Au) * 2200 : lt * 120;
      w += `<g transform="translate(830,420)"><circle r="110" fill="#e9ecf2"/><circle r="110" fill="none" stroke="#2a2f3a" stroke-width="10"/><path d="M0 0 L0 -70" stroke="#111" stroke-width="10" stroke-linecap="round" transform="rotate(${f1(sp / 12)})"/><path d="M0 0 L0 -92" stroke="#c33" stroke-width="5" stroke-linecap="round" transform="rotate(${f1(sp)})"/></g>`;
      // Monitor mit Mails
      w += `<rect x="120" y="640" width="760" height="500" rx="24" fill="#1a1f2b" stroke="#2c3240" stroke-width="12"/><rect x="420" y="1140" width="160" height="90" fill="#2c3240"/>`;
      for (let i = 0; i < 6; i++) w += `<rect x="160" y="${690 + i * 72}" width="${f1(520 - rnd(i) * 160)}" height="44" rx="8" fill="#2a3242"/><circle cx="740" cy="${712 + i * 72}" r="10" fill="#3d6df2"/>`;
      const n = Math.min(9, Math.floor(lt * 2.2) + 1);
      for (let i = 0; i < n; i++) { const k = eBack(seg(lt, i / 2.2, i / 2.2 + .25)); w += `<g transform="translate(${720 - i * 6},${600 - i * 66}) scale(${f1(k)})"><rect x="-200" y="-34" width="400" height="68" rx="16" fill="#f1f3f7"/><text x="-176" y="12" font-size="28" font-weight="700" fill="#111">✉ Neue Mail (${i + 1})</text></g>`; }
      w = cam(w, { z: 1.06 + .04 * lt, fx: CX, fy: 900 });
    }
    return { world: w, fx: `<rect width="1080" height="1920" fill="#0c1a3a" opacity=".25"/>` + flashRect(.25 * (1 - seg(t, D.A1, D.A1 + .1)) * (t >= D.A1 ? 1 : 0)) + flashRect(.25 * (1 - seg(t, D.A2, D.A2 + .1)) * (t >= D.A2 ? 1 : 0)), sat: .55 };
  },
};

/* 3 – Nachricht vom Freund */
SC.s03 = {
  setup() { D.Na = wt('nachricht') - .15; D.La = wt('lange'); },
  sfx() { return [{ t: .1, type: 'door' }, { t: D.Na, type: 'ping' }, { t: D.La, type: 'pop' }]; },
  render(t) {
    let w = `<g filter="url(#fBlur10)">${apartment(t)}${couchBack()}${couchFront()}</g><rect width="1080" height="1920" fill="#000" opacity=".35"/>`;
    const ph = eOut(seg(t, 0, .6));
    w += phoneUI(t, { y: lerp(1500, 800, ph), rot: lerp(8, -2, ph), banner: t > D.Na ? seg(t, D.Na, D.Na + .4) * (1 - seg(t, D.La - .1, D.La + .2)) : 0, msgs: [{ side: 'l', lines: ['Lange nicht gesehen.', 'Heute Abend? 🍻'], k: seg(t, D.La, D.La + .3) }] });
    w += `<ellipse cx="${CX}" cy="820" rx="560" ry="700" fill="url(#gPhone)" opacity=".25"/>`;
    w = cam(w, { z: 1.0 + .03 * t, fx: CX, fy: 900 });
    return { world: w, fx: `<rect width="1080" height="1920" fill="#0c1a3a" opacity=".2"/>`, sat: .65 };
  },
};

/* 4 – „Sorry, bin echt kaputt.“ */
SC.s04 = {
  setup() { D.So = wt('sorry'); D.Ka = wEnd('kaputt'); },
  sfx() { const s = []; for (let x = D.So; x < D.Ka; x += .085) s.push({ t: x, type: 'type' }); s.push({ t: D.Ka + .05, type: 'send' }); return s; },
  render(t) {
    let w = `<g filter="url(#fBlur10)">${apartment(t)}${couchBack()}${couchFront()}</g><rect width="1080" height="1920" fill="#000" opacity=".35"/>`;
    const full = 'Sorry, bin echt kaputt 😮‍💨';
    const sent = t > D.Ka + .05;
    w += phoneUI(t, { y: 800, rot: -2, typing: sent ? '' : typed(full, seg(t, D.So, D.Ka)),
      msgs: [{ side: 'l', lines: ['Lange nicht gesehen.', 'Heute Abend? 🍻'], k: 1 }, { side: 'r', lines: [full], k: sent ? seg(t, D.Ka + .05, D.Ka + .3) : 0, status: 'Gelesen ✓✓', col: '#4a5468' }],
      dim: sent ? .25 * seg(t, D.Ka + .4, D.duration) : 0 });
    w += `<ellipse cx="${CX}" cy="820" rx="560" ry="700" fill="url(#gPhone)" opacity=".22"/>`;
    w = cam(w, { z: 1.03 + .03 * t, fx: CX, fy: 900 });
    return { world: w, fx: `<rect width="1080" height="1920" fill="#0c1a3a" opacity=".24"/>`, sat: .55 };
  },
};

/* 5 – Gym-Abo & Projekt warten */
SC.s05 = {
  setup() { D.D2 = wt('das', 1) - .1; },
  sfx() { return [{ t: 0, type: 'whoosh', gain: .4 }, { t: D.D2, type: 'whoosh', gain: .4 }]; },
  render(t) {
    let w = `<rect width="1080" height="1920" fill="#0b0e16"/><rect x="0" y="1180" width="1080" height="800" fill="#090b11"/>`;
    if (t < D.D2) {
      // Sporttasche in der Ecke, Mitgliedskarte
      w += `<path d="M-40 1180 L1120 1180" stroke="#1a1f2b" stroke-width="6"/>`;
      w += `<g transform="translate(470,1060)"><path d="M-300 40 Q-310 160 -220 170 L220 170 Q310 160 300 40 Q290 -60 200 -70 L-200 -70 Q-290 -60 -300 40 Z" fill="#262c3a"/><path d="M-260 -10 L260 -10" stroke="#3a4255" stroke-width="10"/><path d="M-150 -70 Q0 -220 150 -70" stroke="#1d222d" stroke-width="22" fill="none"/></g>`;
      w += `<g transform="translate(660,1290) rotate(-8)"><rect x="-170" y="-100" width="340" height="200" rx="20" fill="#e9ecf2"/><rect x="-170" y="-100" width="340" height="56" rx="20" fill="#2b2f3a"/><text x="-146" y="-60" font-size="28" font-weight="800" fill="#fff">FIT CLUB</text>
        <text x="-146" y="10" font-size="26" font-weight="700" fill="#333">Mitglied seit März</text><text x="-146" y="58" font-size="24" font-weight="700" fill="#c33">Zuletzt da: vor 47 Tagen</text></g>`;
      w += sparkleField(t, 30, .25, 3, [100, 700, 800, 700]);
      w = cam(w, { z: 1.25 + .05 * t, fx: 520, fy: 1120 });
    } else {
      const lt = t - D.D2;
      w += `<rect x="40" y="1100" width="1000" height="40" fill="#1b2030"/>`;
      w += `<g transform="translate(470,1060)"><path d="M-260 30 L260 30 L290 60 L-290 60 Z" fill="#2c3240"/><rect x="-250" y="0" width="500" height="34" rx="8" fill="#3a4255"/><circle cx="0" cy="17" r="6" fill="#1a1f2b"/></g>`;
      w += `<g transform="translate(570,1000) rotate(5)"><rect x="-90" y="-80" width="180" height="160" fill="#f3e27a"/><text y="-12" text-anchor="middle" font-size="30" font-weight="800" fill="#333">MEIN</text><text y="28" text-anchor="middle" font-size="30" font-weight="800" fill="#333">PROJEKT 🚀</text></g>`;
      w += `<g transform="translate(260,1060) rotate(-6)"><rect x="-110" y="-40" width="220" height="70" rx="6" fill="#4b3a2e"/><path d="M-80 -20 L80 -20 M-80 0 L40 0" stroke="#d8c8b0" stroke-width="5" opacity=".6"/></g>`;
      w += sparkleField(t, 30, .25, 5, [100, 700, 800, 600]);
      w = cam(w, { z: 1.3 + .05 * lt, fx: 480, fy: 1050 });
    }
    return { world: w, fx: `<rect width="1080" height="1920" fill="#0c1a3a" opacity=".25"/>` + flashRect(t >= D.D2 ? .2 * (1 - seg(t, D.D2, D.D2 + .1)) : 0), sat: .5 };
  },
};

/* 6 – Arbeit ↔ Schlaf */
SC.s06 = {
  setup() { D.Ar = wt('arbeit'); D.Sc = wt('schlaf'); },
  sfx() { return [{ t: 0, type: 'whoosh', gain: .4 }, { t: D.Ar, type: 'tickT' }, { t: D.Sc, type: 'tickT' }]; },
  render(t) {
    let w = `<rect width="1080" height="1920" fill="#0b0e16"/>`;
    const days = ['MO', 'DI', 'MI', 'DO', 'FR', 'MO', 'DI', 'MI', 'DO', 'FR', 'MO'];
    const di = Math.floor(t * (1.2 + t * .6)) % 5;
    days.slice(0, 5).forEach((d, i) => { w += `<g transform="translate(${215 + i * 140},430)"><rect x="-56" y="-44" width="112" height="88" rx="18" fill="${i === di ? '#3a4255' : '#161b26'}"/><text y="16" text-anchor="middle" font-size="40" font-weight="800" fill="${i === di ? '#fff' : '#5d6578'}">${d}</text></g>`; });
    const tile = (x, lab, ic, on) => `<g transform="translate(${x},900)"><rect x="-190" y="-220" width="380" height="440" rx="40" fill="${on ? '#232a3a' : '#161b26'}" stroke="${on ? '#5d6578' : '#232a3a'}" stroke-width="6"/>${ic}<text y="170" text-anchor="middle" font-size="52" font-weight="900" fill="#cfd6e4" letter-spacing="3">${lab}</text></g>`;
    const icW = `<rect x="-100" y="-120" width="200" height="130" rx="12" fill="#3a4255"/><rect x="-130" y="10" width="260" height="20" rx="8" fill="#4b566d"/>`;
    const icS = `<rect x="-120" y="-40" width="240" height="70" rx="16" fill="#3a4255"/><rect x="-120" y="-80" width="80" height="50" rx="16" fill="#4b566d"/><rect x="-130" y="30" width="20" height="40" fill="#3a4255"/><rect x="110" y="30" width="20" height="40" fill="#3a4255"/><text x="70" y="-70" font-size="40" font-weight="800" fill="#7f9cc9">z</text><text x="100" y="-110" font-size="30" font-weight="800" fill="#7f9cc9">z</text>`;
    const freq = .8 + t * .5, ph = (Math.sin(t * freq * Math.PI) + 1) / 2;
    w += tile(280, 'ARBEIT', icW, ph < .5) + tile(720, 'SCHLAF', icS, ph >= .5);
    const bx = lerp(280, 720, eIO(ph));
    for (let i = 1; i < 6; i++) { const pp = (Math.sin((t - i * .03) * freq * Math.PI) + 1) / 2; w += `<circle cx="${f1(lerp(280, 720, eIO(pp)))}" cy="${f1(620 - Math.sin(pp * Math.PI) * 120)}" r="${18 - i * 2}" fill="#cfd6e4" opacity="${f1(.3 - i * .05)}"/>`; }
    w += `<circle cx="${f1(bx)}" cy="${f1(620 - Math.sin(ph * Math.PI) * 120)}" r="22" fill="#fff"/>`;
    if (t >= D.Ar) w += `<rect x="90" y="680" width="380" height="440" rx="40" fill="none" stroke="#fff" stroke-width="6" opacity="${f1(.6 * (1 - seg(t, D.Ar, D.Ar + .5)))}"/>`;
    if (t >= D.Sc) w += `<rect x="530" y="680" width="380" height="440" rx="40" fill="none" stroke="#fff" stroke-width="6" opacity="${f1(.6 * (1 - seg(t, D.Sc, D.Sc + .5)))}"/>`;
    w += `<text x="${CX}" y="1190" text-anchor="middle" font-size="34" font-weight="700" fill="#5d6578">Woche ${1 + Math.floor(t * 1.4)}</text>`;
    w = cam(w, { z: 1.0 + .03 * t, fx: CX, fy: 880 });
    return { world: w, fx: `<rect width="1080" height="1920" fill="#0c1a3a" opacity=".2"/>`, sat: .55 };
  },
};

/* 7 – Erinnerungen: Pläne, Lust */
function polaroid(x, y, rot, k, kind, t) {
  if (k <= 0) return '';
  const sc = lerp(.6, 1, eOut(k));
  let p = `<g transform="translate(${f1(x)},${f1(y + (1 - eOut(k)) * 80)}) rotate(${f1(rot)}) scale(${f1(sc)})" opacity="${f1(clamp(k * 2))}" filter="url(#fShadow)">`;
  p += `<rect x="-200" y="-220" width="400" height="460" rx="8" fill="#f6f0e4"/>`;
  p += `<clipPath id="pc${kind}"><rect x="-176" y="-196" width="352" height="330"/></clipPath><g clip-path="url(#pc${kind})"><rect x="-176" y="-196" width="352" height="330" fill="#e38a4a"/>`;
  if (kind === 1) { p += `<circle cx="0" cy="40" r="120" fill="#ffd27a"/>`; for (const hx of [-110, 0, 110]) p += `<circle cx="${hx}" cy="20" r="46" fill="#3a2418"/><rect x="${hx - 60}" y="66" width="120" height="120" rx="50" fill="#3a2418"/>`; }
  if (kind === 2) { p += `<rect x="-176" y="-196" width="352" height="330" fill="#ffcf7a"/><rect x="-110" y="-40" width="220" height="140" rx="10" fill="#2a2f3a"/><path d="M-20 60 L20 -10 L40 30 Z" fill="${LIME}"/><text x="0" y="-80" text-anchor="middle" font-size="60">🚀</text>`; }
  if (kind === 3) { p += `<rect x="-176" y="-196" width="352" height="330" fill="#f2a65a"/><circle cx="90" cy="-60" r="60" fill="#ffe3a3"/><rect x="-140" y="40" width="280" height="20" rx="10" fill="#3a2418"/><rect x="-150" y="10" width="40" height="80" rx="10" fill="#3a2418"/><rect x="110" y="10" width="40" height="80" rx="10" fill="#3a2418"/>`; }
  p += `</g><text y="200" text-anchor="middle" font-size="34" font-weight="700" fill="#555" font-family="Cormorant">${['', 'wir, Sommer', 'mein Plan', 'jeden Morgen'][kind]}</text></g>`;
  return p;
}
SC.s07 = {
  setup() { D.Me = wt('mehr'); D.Pl = wt('pläne'); D.Lu = wt('lust'); },
  sfx() { return [{ t: D.Me, type: 'chime' }, { t: D.Pl, type: 'chime', gain: .8 }, { t: D.Lu, type: 'chime', gain: .8 }]; },
  render(t) {
    let w = `<rect width="1080" height="1920" fill="#120d0c"/>`;
    w += `<ellipse cx="${CX}" cy="900" rx="${f1(400 + 100 * seg(t, 0, D.duration))}" ry="700" fill="url(#gWarm)" opacity="${f1(.35 + .3 * seg(t, D.Me, D.duration))}"/>`;
    w += sparkleField(t, 30, .5, 8);
    w += polaroid(270, 600, -8, seg(t, D.Me - .1, D.Me + .5), 1, t);
    w += polaroid(745, 700, 7, seg(t, D.Pl - .1, D.Pl + .5), 2, t);
    w += polaroid(470, 1060, -3, seg(t, D.Lu - .1, D.Lu + .5), 3, t);
    w = cam(w, { z: 1.0 + .04 * t, fx: CX, fy: 920, r: Math.sin(t * .7) * 1 });
    return { world: w, fx: `<rect width="1080" height="1920" fill="#ffb866" opacity=".06"/>`, sat: lerp(.6, .9, seg(t, 0, D.duration)), sepia: .25 };
  },
};

/* 8 – Wende: kleine Dose in der Hand */
SC.s08 = {
  setup() { D.Zu = wt('zurückzuholen'); },
  sfx() { return [{ t: 0, type: 'mark_turn' }, { t: .4, type: 'riser', dur: D.duration - .4 }]; },
  render(t) {
    const k = seg(t, .3, D.duration);
    let w = apartment(t, { warm: .2 + .5 * k }) + couchBack();
    w += person(Object.assign({}, P0, { emo: 'tired', emo2: 'hope', emoK: seg(t, .5, 2.2), look: [.5, .6], blink: blinkAt(t, .3), tilt: lerp(-6, 0, k), rings: 1 - k, tin: eOut(seg(t, .2, 1.2)), warmFace: .5 * k }));
    w += couchFront();
    w = cam(w, { z: lerp(1.15, 1.5, eIO(seg(t, 0, D.duration))), fx: lerp(520, 600, k), fy: lerp(1060, 1180, k) });
    return { world: w, fx: `<rect width="1080" height="1920" fill="#0c1a3a" opacity="${f1(.28 * (1 - k))}"/>`, sat: lerp(.55, 1.0, k) };
  },
};

/* 9 – Produkt: Tunnelblick */
SC.s09 = {
  setup() { D.Hu = wt('hundert'); D.Zk = wt('zucker'); D.Ni = wt('nikotin'); D.Ta = wt('tabak'); },
  sfx() { return [{ t: 0, type: 'mark_drop' }, { t: 0, type: 'zap' }, { t: 0, type: 'hit' }, { t: D.Hu, type: 'zap', gain: .6 }, { t: D.Zk, type: 'stamp' }, { t: D.Ni, type: 'stamp' }, { t: D.Ta, type: 'stamp' }]; },
  render(t) {
    let w = `<rect width="1080" height="1920" fill="#06070a"/>`;
    w += `<ellipse cx="${CX}" cy="880" rx="520" ry="420" fill="url(#gLime)" opacity="${f1(.35 + .1 * Math.sin(t * 6))}"/>`;
    w += lightning(t, CX, 880, 700, 7, .8, 1);
    const pk = eBack(seg(t, 0, .45));
    w += `<g transform="translate(${CX},${f1(880 + Math.sin(t * 2) * 8)}) scale(${(pk * (1 + .03 * t)).toFixed(3)})">${tinImg('all', 0, 0, 265, 'filter="url(#fShadow)"')}</g>`;
    if (t >= D.Hu - .05) {
      const hk = eBack(seg(t, D.Hu - .05, D.Hu + .3));
      w += `<g transform="translate(${CX},520) scale(${f1(hk)})"><text text-anchor="middle" font-size="170" font-weight="900" fill="#fff" letter-spacing="-4">100 mg</text><text y="70" text-anchor="middle" font-size="54" font-weight="800" fill="${LIME}" letter-spacing="14">KOFFEIN</text></g>`;
    }
    w += chip(CX, 1110, '0 % ZUCKER', seg(t, D.Zk, D.Zk + .2)) + chip(CX, 1205, '0 % NIKOTIN', seg(t, D.Ni, D.Ni + .2)) + chip(CX, 1300, '0 % TABAK', seg(t, D.Ta, D.Ta + .2));
    const sh = shakeXY(t, 0, .4, 20), s2 = shakeXY(t, D.Zk, .2, 8), s3 = shakeXY(t, D.Ni, .2, 8), s4 = shakeXY(t, D.Ta, .2, 8);
    w = cam(w, { z: 1 + .02 * t + (1 - eOut(seg(t, 0, .4))) * .3, fx: CX, fy: 900, sx: sh[0] + s2[0] + s3[0] + s4[0], sy: sh[1] + s2[1] + s3[1] + s4[1] });
    const fx = tunnel(t, 1 - seg(t, .3, 1.3)) + flashRect(.8 * (1 - seg(t, 0, .15)), LIME2) + DISC;
    return { world: w, fx, subY: 1360 };
  },
};

/* 10 – Hosentasche, Made in Sweden */
SC.s10 = {
  setup() { D.Ta = wt('tasche'); D.Sw = wt('sweden'); },
  sfx() { return [{ t: D.Ta - .2, type: 'pocket' }, { t: D.Sw, type: 'pop' }]; },
  render(t) {
    let w = `<rect width="1080" height="1920" fill="url(#gDenim)"/>`;
    for (let i = 0; i < 70; i++) w += `<path d="M${-200 + i * 26} 0 L${200 + i * 26} 1920" stroke="#fff" stroke-width="2" opacity=".04"/>`;
    // Gesäßtasche
    w += `<path d="M210 620 L810 620 L790 1180 Q510 1300 230 1180 Z" fill="#253f6c" stroke="#d9a441" stroke-width="5" stroke-dasharray="16 10"/>`;
    const sl = eIO(seg(t, D.Ta - .5, D.Ta + .2));
    w += `<clipPath id="pk"><rect x="0" y="0" width="1080" height="660"/></clipPath>`;
    w += `<g clip-path="url(#pk)">${tinImg('energy', 510, lerp(300, 720, sl), 380, 'filter="url(#fShadow)"')}</g>`;
    w += `<path d="M210 620 L810 620" stroke="#1b2d4f" stroke-width="20"/><path d="M210 640 L810 640" stroke="#d9a441" stroke-width="5" stroke-dasharray="16 10"/>`;
    if (t >= D.Sw - .05) {
      const k = eBack(seg(t, D.Sw - .05, D.Sw + .3));
      w += `<g transform="translate(${CX},1170) scale(${f1(k)})"><rect x="-260" y="-60" width="520" height="120" rx="60" fill="#fff"/><rect x="-220" y="-30" width="96" height="60" rx="6" fill="#006aa7"/><rect x="-196" y="-30" width="18" height="60" fill="#fecc00"/><rect x="-220" y="-9" width="96" height="18" fill="#fecc00"/><text x="50" y="16" text-anchor="middle" font-size="46" font-weight="800" fill="#111">Made in Sweden</text></g>`;
    }
    w = cam(w, { z: 1.05 + .04 * t + entry(t) * .1, fx: CX, fy: 900 });
    return { world: w, fx: DISC, subY: 1360 };
  },
};

/* 11 – Preis */
SC.s11 = {
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
    if (t >= D.Z - .05) {
      const k = eBack(seg(t, D.Z - .05, D.Z + .3));
      w += `<g transform="translate(${CX},1170) scale(${f1(k)})"><text text-anchor="middle" font-size="200" font-weight="900" fill="${LIME}" letter-spacing="-4">9,99 €</text></g>`;
      w += burst(t, D.Z, CX, 1110, LIME, 22, 420);
    }
    w = cam(w, { z: 1 + .02 * t + entry(t) * .1, fx: CX, fy: 900 });
    return { world: w, fx: DISC_P + DISC, subY: 1350 };
  },
};
function burst(t, t0, cx, cy, col, n = 22, R = 260) {
  const dt = t - t0; if (dt < 0 || dt > .7) return '';
  const k = eOut(dt / .7); let s = '';
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r1 = R * k, r0 = R * Math.max(0, k - .35); s += `<path d="M${f1(cx + Math.cos(a) * r0)} ${f1(cy + Math.sin(a) * r0)} L${f1(cx + Math.cos(a) * r1)} ${f1(cy + Math.sin(a) * r1)}" stroke="${col}" stroke-width="${f1(10 * (1 - k) + 2)}" stroke-linecap="round"/>`; }
  return s;
}

/* 12 – Coupon */
SC.s12 = {
  setup() { D.Wk = wt('warenkorb'); D.Co = wt('coupon'); D.Gu = wt('günstiger'); },
  sfx() { return [{ t: D.Wk, type: 'pop' }, { t: D.Co, type: 'swipe' }, { t: D.Gu, type: 'ding' }]; },
  render(t) {
    let w = `<rect width="1080" height="1920" fill="#07080b"/><ellipse cx="${CX}" cy="880" rx="520" ry="420" fill="url(#gLime)" opacity=".2"/>`;
    // Warenkorb
    const ck = eBack(seg(t, D.Wk, D.Wk + .3));
    w += `<g transform="translate(${CX},560) scale(${f1(ck)})"><circle r="150" fill="#151a24" stroke="${LIME}" stroke-width="6"/><text y="52" text-anchor="middle" font-size="150">🛒</text></g>`;
    // Coupon-Ticket
    const tk = eOut(seg(t, D.Co - .15, D.Co + .35));
    w += `<g transform="translate(${f1(lerp(1500, CX, tk))},900) rotate(${f1(lerp(20, -4, tk))}) scale(.86)" filter="url(#fShadow)"><path d="M-330 -110 H330 V-40 A40 40 0 0 0 330 40 V110 H-330 V40 A40 40 0 0 0 -330 -40 Z" fill="${LIME}"/>
      <path d="M-170 -110 V110" stroke="#111" stroke-width="5" stroke-dasharray="14 12" opacity=".5"/><text x="-250" y="26" text-anchor="middle" font-size="80">🎟️</text>
      <text x="80" y="-8" text-anchor="middle" font-size="58" font-weight="900" fill="#111">COUPON</text><text x="80" y="50" text-anchor="middle" font-size="38" font-weight="800" fill="#111">im Warenkorb checken</text></g>`;
    if (t >= D.Gu - .05) {
      const gk = eBack(seg(t, D.Gu - .05, D.Gu + .3));
      w += `<g transform="translate(${CX},1190) scale(${f1(gk)})"><rect x="-290" y="-56" width="580" height="112" rx="56" fill="#fff"/><text y="17" text-anchor="middle" font-size="46" font-weight="900" fill="#111">oft noch günstiger ↓</text></g>`;
    }
    w = cam(w, { z: 1 + .02 * t, fx: CX, fy: 900 });
    return { world: w, fx: DISC_P + DISC, subY: 1350 };
  },
};

/* 13 – „Bin dabei.“ */
SC.s13 = {
  setup() { D.Bi = wt('bin'); D.Da = wEnd('dabei'); },
  sfx() { const s = []; for (let x = D.Bi - .1; x < D.Da; x += .09) s.push({ t: x, type: 'type' }); s.push({ t: D.Da + .03, type: 'send' }, { t: D.Da + .6, type: 'ping' }); return s; },
  render(t) {
    let w = `<g filter="url(#fBlur10)">${apartment(t, { warm: .9 })}${couchBack()}${couchFront()}</g><rect width="1080" height="1920" fill="#000" opacity=".25"/>`;
    const full = 'Bin dabei. 💪', sent = t > D.Da + .03;
    w += phoneUI(t, { y: 800, rot: 1, online: true, warm: true, typing: sent ? '' : typed(full, seg(t, D.Bi - .1, D.Da)),
      msgs: [{ side: 'l', lines: ['Lange nicht gesehen.', 'Heute Abend? 🍻'], k: 1 }, { side: 'r', lines: ['Bin dabei. 💪'], k: sent ? seg(t, D.Da + .03, D.Da + .3) : 0, col: '#3d6df2', status: sent ? 'Gelesen ✓✓' : '' }, { side: 'l', lines: ['Endlich!! 🙌'], k: seg(t, D.Da + .6, D.Da + .9) }] });
    w += `<ellipse cx="${CX}" cy="820" rx="600" ry="760" fill="url(#gWarm)" opacity=".25"/>`;
    w = cam(w, { z: 1.03 + .03 * t, fx: CX, fy: 900 });
    return { world: w, fx: DISC, sat: 1.05 };
  },
};

/* 14 – Link im Warenkorb */
SC.s14 = {
  setup() { D.Wk = wt('warenkorb'); },
  sfx() { return [{ t: D.Wk, type: 'ding' }]; },
  render(t) {
    let w = apartment(t, { warm: 1 }) + couchBack();
    w += person(Object.assign({}, P0, { x: 600, emo: 'joy', look: [-.2, -.1], blink: blinkAt(t, .2), tilt: 3, warmFace: .6 }));
    w += couchFront();
    w = cam(w, { z: 1.12 + .03 * t, fx: 560, fy: 1000 });
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
