/* ProFuel – „100 Tage Creatin“  ·  Szenen-Engine
 * Jede Szene ist eine reine Funktion der Zeit t -> SVG. Dadurch ist jeder Frame deterministisch
 * und kann von Playwright einzeln gerendert werden.
 */
'use strict';
const W = 1080, H = 1920;
const OR = '#FF6B1A', OR2 = '#FF8A3D', ORD = '#C9480A';
const SKIN = '#EBAA7E', SKIN_D = '#CC8A5E', SKIN_L = '#F6C29C';
const HAIR = '#2A1A12', HAIR_L = '#4A2E1F';
const SHIRT = '#F1F1F3', SHIRT_D = '#CFCFD6', SHORTS = '#262B37', SHORTS_D = '#1B1F29';
const INK = '#16161A';
const FX0 = 490, FY0 = 1335, FS0 = 0.8;  // Standardposition der Figur (Füße)

/* ---------------- Utils ---------------- */
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const smooth = k => { k = clamp(k); return k * k * (3 - 2 * k); };
const eOut = k => 1 - Math.pow(1 - clamp(k), 3);
const eIn = k => Math.pow(clamp(k), 3);
const eIO = k => { k = clamp(k); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const eBack = k => { k = clamp(k); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const eElastic = k => { k = clamp(k); if (k === 0 || k === 1) return k; return Math.pow(2, -10 * k) * Math.sin((k * 10 - .75) * (2 * Math.PI / 3)) + 1; };
const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const noise1 = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(rnd(i) * 2 - 1, rnd(i + 1) * 2 - 1, u); };
const f1 = v => Math.round(v * 10) / 10;
const DEG = Math.PI / 180;
let UID = 0; const uid = p => p + (UID++);
const norm = s => s.toLowerCase().replace(/[^0-9a-zäöüß]/g, '');

const muscleOf = day => 0.78 * Math.pow(clamp(day / 100), 0.85);
const postureOf = day => lerp(0.15, 1, Math.pow(clamp(day / 100), 0.7));
const barOf = day => clamp(day / 30);

/* ---------------- globale Defs ---------------- */
function defs() {
  return `<defs>
  <linearGradient id="gBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#25272E"/><stop offset=".55" stop-color="#16171B"/><stop offset="1" stop-color="#0A0A0C"/></linearGradient>
  <radialGradient id="gGlow"><stop offset="0" stop-color="${OR}" stop-opacity=".55"/><stop offset=".45" stop-color="${OR}" stop-opacity=".16"/><stop offset="1" stop-color="${OR}" stop-opacity="0"/></radialGradient>
  <radialGradient id="gGlowW"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <radialGradient id="gVig" cx=".5" cy=".46" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".72"/></radialGradient>
  <linearGradient id="gFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1D1E23"/><stop offset="1" stop-color="#0B0B0D"/></linearGradient>
  <linearGradient id="gOr" x1="0" x2="1"><stop offset="0" stop-color="#FF8F45"/><stop offset="1" stop-color="#FF5A0A"/></linearGradient>
  <linearGradient id="gOrV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF9A55"/><stop offset="1" stop-color="#F0540A"/></linearGradient>
  <linearGradient id="gShirt" x1="0" x2="1"><stop offset="0" stop-color="${SHIRT}"/><stop offset=".7" stop-color="${SHIRT}"/><stop offset="1" stop-color="${SHIRT_D}"/></linearGradient>
  <linearGradient id="gWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FD8FF"/><stop offset="1" stop-color="#1F7BD8"/></linearGradient>
  <linearGradient id="gNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E1630"/><stop offset="1" stop-color="#26324F"/></linearGradient>
  <linearGradient id="gPlate" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a3d46"/><stop offset="1" stop-color="#141519"/></linearGradient>
  <linearGradient id="gPlateO" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF9A55"/><stop offset="1" stop-color="#C9480A"/></linearGradient>
  <filter id="fBlur8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="fBlur20" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="20"/></filter>
  <filter id="fShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000" flood-opacity=".55"/></filter>
  <filter id="fOrGlow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="0" stdDeviation="16" flood-color="${OR}" flood-opacity=".9"/></filter>
 </defs>`;
}

/* ---------------- Figur (Frontansicht) ----------------
 * o: x,y (Fußpunkt), s, m (Muskeln 0..1), post (Haltung 0..1), emo, armL/armR [schulter, ellenbogen] in Grad,
 *    look [dx,dy], blink 0..1, talk 0..1, sit 0..1, hold {r:'shaker'|'dumbbell'}, tilt, shrug 0..1, sweat
 */
const EMO = {
  neutral: { bl: [0, 0], br: [0, 0], lid: .14, eye: 1, mouth: 'smile0' },
  curious: { bl: [-8, -10], br: [-4, -2], lid: .1, eye: 1.04, mouth: 'smile0' },
  doubt: { bl: [-16, -22], br: [6, 6], lid: .3, eye: 1, mouth: 'skew' },
  shock: { bl: [-36, -32], br: [-36, -32], lid: 0, eye: 1.2, pupil: .68, mouth: 'O' },
  sad: { bl: [12, -16], br: [12, -16], lid: .46, eye: 1, mouth: 'frown' },
  determined: { bl: [-8, 12], br: [-8, 12], lid: .2, eye: 1, mouth: 'firm' },
  proud: { bl: [-12, -4], br: [-12, -4], lid: .12, eye: 1, mouth: 'grin', happy: .3, blush: .8 },
  raise: { bl: [8, 10], br: [-34, -26], lid: .22, eye: 1, mouth: 'smirk' },
  happy: { bl: [-22, -16], br: [-22, -16], lid: 0, eye: 1.06, mouth: 'open', happy: .28, blush: 1 },
  relieved: { bl: [-6, -10], br: [-6, -10], lid: .25, eye: 1, mouth: 'smile', happy: .15 },
  strain: { bl: [-4, 16], br: [-4, 16], lid: .5, eye: .95, mouth: 'teeth', blush: .6 },
};
const POSE = {
  stand: { l: [7, 6], r: [7, 6] },
  hips: { l: [42, -100], r: [42, -100] },
  shrug: { l: [24, 70], r: [24, 70] },
  shock: { l: [52, 100], r: [52, 100] },
  flex: { l: [96, 86], r: [96, 86] },
  flexR: { l: [42, -100], r: [96, 86] },
  holdR: { l: [7, 6], r: [14, -108] },
  pointR: { l: [42, -100], r: [118, -14] },
  fist: { l: [7, 6], r: [40, 120] },
  knees: { l: [-6, -40], r: [-6, -40] },
  curl: { l: [8, 20], r: [8, 20] },
};
const mixPose = (a, b, k) => ({ l: [lerp(a.l[0], b.l[0], k), lerp(a.l[1], b.l[1], k)], r: [lerp(a.r[0], b.r[0], k), lerp(a.r[1], b.r[1], k)] });
function emoMix(a, b, k) {
  const A = EMO[a], B = EMO[b] || A;
  const L = (x, y) => lerp(x || 0, y || 0, k);
  return {
    bl: [L(A.bl[0], B.bl[0]), L(A.bl[1], B.bl[1])], br: [L(A.br[0], B.br[0]), L(A.br[1], B.br[1])],
    lid: L(A.lid, B.lid), eye: L(A.eye, B.eye), pupil: L(A.pupil || 1, B.pupil || 1), happy: L(A.happy, B.happy),
    blush: L(A.blush, B.blush), mouth: k < .5 ? A.mouth : B.mouth,
  };
}

function arm(side, sx, sy, a1, a2, L1, L2) {
  const d1 = [side * Math.sin(a1 * DEG), Math.cos(a1 * DEG)];
  const e = [sx + d1[0] * L1, sy + d1[1] * L1];
  const a = a1 + a2;
  const d2 = [side * Math.sin(a * DEG), Math.cos(a * DEG)];
  const h = [e[0] + d2[0] * L2, e[1] + d2[1] * L2];
  return { e, h, d1, d2 };
}

function drawArm(side, S, A, m, o, back) {
  const L1 = 178, L2 = 168;
  const g = arm(side, S[0], S[1], A[0], A[1], L1, L2);
  const wU = 52 + 26 * m, wF = 44 + 12 * m;
  let s = '';
  // Oberarm + Unterarm
  s += `<path d="M${f1(S[0])} ${f1(S[1])} L${f1(g.e[0])} ${f1(g.e[1])}" stroke="${SKIN}" stroke-width="${wU}" stroke-linecap="round"/>`;
  // Bizeps-Wölbung zur Beugeseite
  const dot = g.d2[0] * g.d1[0] + g.d2[1] * g.d1[1];
  let bx = g.d2[0] - dot * g.d1[0], by = g.d2[1] - dot * g.d1[1];
  const bl = Math.hypot(bx, by);
  const bend = clamp(bl);
  if (bl > 0.01) { bx /= bl; by /= bl; }
  const br = (22 + 18 * m) * (0.35 + 0.65 * bend) * (0.6 + 0.6 * m);
  const bp = [S[0] + g.d1[0] * L1 * .58 + bx * wU * .26, S[1] + g.d1[1] * L1 * .58 + by * wU * .26];
  s += `<ellipse cx="${f1(bp[0])}" cy="${f1(bp[1])}" rx="${f1(br * 1.25)}" ry="${f1(br)}" transform="rotate(${f1(Math.atan2(g.d1[1], g.d1[0]) / DEG)} ${f1(bp[0])} ${f1(bp[1])})" fill="${SKIN}"/>`;
  s += `<path d="M${f1(g.e[0])} ${f1(g.e[1])} L${f1(g.h[0])} ${f1(g.h[1])}" stroke="${SKIN}" stroke-width="${wF}" stroke-linecap="round"/>`;
  // Schatten-Linie Ellenbogen
  s += `<circle cx="${f1(g.e[0])}" cy="${f1(g.e[1])}" r="${f1(wF * .2)}" fill="${SKIN_D}" opacity=".35"/>`;
  // Ärmel
  const sl = [S[0] + g.d1[0] * L1 * .42, S[1] + g.d1[1] * L1 * .42];
  s += `<path d="M${f1(S[0] - g.d1[0] * 8)} ${f1(S[1] - g.d1[1] * 8)} L${f1(sl[0])} ${f1(sl[1])}" stroke="${SHIRT}" stroke-width="${wU + 16 + 6 * m}" stroke-linecap="round"/>`;
  s += `<path d="M${f1(sl[0] - g.d1[1] * (wU / 2 + 10) * side * 0)} ${f1(sl[1])}" />`;
  // Ärmelbündchen orange
  const n = [-g.d1[1], g.d1[0]];
  const hw = (wU + 16 + 6 * m) / 2;
  s += `<path d="M${f1(sl[0] + n[0] * hw)} ${f1(sl[1] + n[1] * hw)} L${f1(sl[0] - n[0] * hw)} ${f1(sl[1] - n[1] * hw)}" stroke="${OR}" stroke-width="9" stroke-linecap="round"/>`;
  // Hand
  const hh = [g.h[0] + g.d2[0] * 14, g.h[1] + g.d2[1] * 14];
  s += `<circle cx="${f1(hh[0])}" cy="${f1(hh[1])}" r="${31 + 4 * m}" fill="${SKIN}"/>`;
  s += `<circle cx="${f1(hh[0] - side * 16)}" cy="${f1(hh[1] - 16)}" r="13" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="3" stroke-opacity=".4"/>`;
  return { svg: s, hand: hh, elbow: g.e, d2: g.d2 };
}

function shaker(x, y, s, fill, shakeA) {
  return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(shakeA || 0)}) scale(${s})">
   <rect x="-38" y="-120" width="76" height="150" rx="12" fill="#ffffff" fill-opacity=".22" stroke="#fff" stroke-opacity=".7" stroke-width="4"/>
   <rect x="-36" y="${f1(28 - 120 * (fill ?? .55))}" width="72" height="${f1(120 * (fill ?? .55))}" rx="8" fill="#F4E6D6" opacity=".95"/>
   <rect x="-44" y="-150" width="88" height="34" rx="9" fill="#1b1b1f"/>
   <rect x="-16" y="-170" width="32" height="24" rx="6" fill="${OR}"/>
   <path d="M-30 -96 L-30 0" stroke="#fff" stroke-opacity=".5" stroke-width="5" stroke-linecap="round"/>
  </g>`;
}
function dumbbell(x, y, s, rot) {
  return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(rot || 0)}) scale(${s})">
   <rect x="-70" y="-9" width="140" height="18" rx="9" fill="#9aa0aa"/>
   <rect x="-92" y="-40" width="34" height="80" rx="9" fill="#24262d" stroke="#3b3f49" stroke-width="4"/>
   <rect x="58" y="-40" width="34" height="80" rx="9" fill="#24262d" stroke="#3b3f49" stroke-width="4"/>
   <rect x="-104" y="-28" width="14" height="56" rx="5" fill="${OR}"/><rect x="90" y="-28" width="14" height="56" rx="5" fill="${OR}"/>
  </g>`;
}

function guy(o) {
  const m = o.m || 0, post = o.post ?? 1, sit = o.sit || 0, shrug = o.shrug || 0;
  const E = o.E || emoMix(o.emo || 'neutral', o.emo2 || o.emo || 'neutral', o.emoK || 0);
  const pose = o.pose || POSE.stand;
  const slump = 1 - post;
  const drop = sit * 205;
  const hipY = -440 + drop;
  const sy = -772 + drop + slump * 26 - shrug * 22 - (o.chest || 0) * 6;
  const hy = -914 + drop + slump * 42 - (o.chest || 0) * 4;
  const SW = 124 + 42 * m + post * 6, WW = 98 + 8 * m;
  const idE = uid('e');
  let s = '';
  // Bodenschatten
  if (!o.noShadow) s += `<ellipse cx="0" cy="8" rx="${190 + 20 * m}" ry="26" fill="#000" opacity=".45"/>`;
  // Beine
  const lw = 76 + 14 * m;
  if (sit < .5) {
    for (const sd of [-1, 1]) {
      s += `<path d="M${sd * 58} ${hipY + 120} L${sd * 62} -52" stroke="${SKIN}" stroke-width="${lw}" stroke-linecap="round"/>`;
      s += `<path d="M${sd * (58 + lw * .3)} ${hipY + 240} q${sd * 8} 50 0 100" stroke="${SKIN_D}" stroke-width="5" fill="none" opacity=".35"/>`;
      s += `<rect x="${sd * 64 - 56 + sd * 10}" y="-62" width="112" height="58" rx="26" fill="#FAFAFA"/>`;
      s += `<rect x="${sd * 64 - 56 + sd * 10}" y="-22" width="112" height="18" rx="9" fill="#2a2a30"/>`;
      s += `<path d="M${sd * 64 - 30 + sd * 10} -40 l40 -10" stroke="${OR}" stroke-width="9" stroke-linecap="round"/>`;
    }
    s += `<path d="M${-WW - 6} ${hipY - 14} L${WW + 6} ${hipY - 14} L${WW + 24} ${hipY + 190} L8 ${hipY + 190} L0 ${hipY + 80} L-8 ${hipY + 190} L${-WW - 24} ${hipY + 190} Z" fill="${SHORTS}"/>`;
    s += `<path d="M${WW + 2} ${hipY - 6} L${WW + 19} ${hipY + 186}" stroke="${OR}" stroke-width="8"/><path d="M${-WW - 2} ${hipY - 6} L${-WW - 19} ${hipY + 186}" stroke="${OR}" stroke-width="8"/>`;
  } else {
    // sitzend: Knie nach vorn (verkürzt), Unterschenkel zum Boden
    for (const sd of [-1, 1]) {
      s += `<path d="M${sd * 78} ${hipY + 70} L${sd * 84} -52" stroke="${SKIN}" stroke-width="${lw}" stroke-linecap="round"/>`;
      s += `<rect x="${sd * 86 - 56 + sd * 6}" y="-62" width="112" height="58" rx="26" fill="#FAFAFA"/>`;
      s += `<rect x="${sd * 86 - 56 + sd * 6}" y="-22" width="112" height="18" rx="9" fill="#2a2a30"/>`;
      s += `<circle cx="${sd * 80}" cy="${hipY + 56}" r="${lw * .62}" fill="${SKIN}"/>`;
    }
    s += `<path d="M${-WW - 14} ${hipY - 14} L${WW + 14} ${hipY - 14} L${WW + 52} ${hipY + 48} Q${WW + 40} ${hipY + 88} ${WW - 10} ${hipY + 70} L-10 ${hipY + 70} L${-WW + 10} ${hipY + 70} Q${-WW - 40} ${hipY + 88} ${-WW - 52} ${hipY + 48} Z" fill="${SHORTS}"/>`;
  }
  // Torso (Shirt)
  const ay = sy + 96;
  s += `<path d="M${-SW} ${sy + 8} Q${-SW - 6} ${sy - 10} ${-SW + 30} ${sy - 18} L-44 ${sy - 22} Q0 ${sy + 16} 44 ${sy - 22} L${SW - 30} ${sy - 18} Q${SW + 6} ${sy - 10} ${SW} ${sy + 8}
     L${SW - 14} ${ay} Q${WW + 6} ${lerp(ay, hipY, .6)} ${WW} ${hipY + 4} L${-WW} ${hipY + 4} Q${-WW - 6} ${lerp(ay, hipY, .6)} ${-SW + 14} ${ay} Z" fill="url(#gShirt)"/>`;
  // Brust-/Bauchlinien je nach Muskeln
  if (m > .15) {
    const k = clamp((m - .15) / .5);
    s += `<path d="M${-SW * .62} ${sy + 92} Q${-SW * .3} ${sy + 128} -6 ${sy + 104} M6 ${sy + 104} Q${SW * .3} ${sy + 128} ${SW * .62} ${sy + 92}" stroke="${SHIRT_D}" stroke-width="6" fill="none" stroke-linecap="round" opacity="${f1(k * .9)}"/>`;
  }
  s += `<path d="M-40 ${sy - 20} Q0 ${sy + 18} 40 ${sy - 20}" stroke="${OR}" stroke-width="9" fill="none" stroke-linecap="round"/>`;
  // Hals
  const nw = 34 + 12 * m;
  s += `<rect x="${-nw}" y="${hy + 70}" width="${nw * 2}" height="${sy - hy - 70 + 6}" fill="${SKIN}"/>`;
  s += `<path d="M${-nw} ${hy + 110} Q0 ${hy + 132} ${nw} ${hy + 110}" stroke="${SKIN_D}" stroke-width="10" fill="none" opacity=".45"/>`;
  // Arme
  const SL = [-(SW - 22), sy + 30], SR = [SW - 22, sy + 30];
  const aL = drawArm(-1, SL, pose.l, m, o), aR = drawArm(1, SR, pose.r, m, o);
  let held = '';
  if (o.hold && o.hold.r === 'shaker') held += shaker(aR.hand[0] - 4, aR.hand[1] + 30, 1, o.hold.fill, o.hold.rot);
  if (o.hold && o.hold.r === 'dumbbell') held += dumbbell(aR.hand[0], aR.hand[1], .8, 90 + (o.hold.rot || 0));
  if (o.hold && o.hold.l === 'dumbbell') held += dumbbell(aL.hand[0], aL.hand[1], .8, 90 - (o.hold.rot || 0));
  s += held + aL.svg + aR.svg;
  // Kopf
  const tilt = o.tilt || 0;
  s += `<g transform="rotate(${f1(tilt)} 0 ${hy + 100})">`;
  s += `<ellipse cx="-114" cy="${hy + 14}" rx="22" ry="32" fill="${SKIN}"/><ellipse cx="114" cy="${hy + 14}" rx="22" ry="32" fill="${SKIN}"/>`;
  s += `<ellipse cx="-114" cy="${hy + 14}" rx="9" ry="16" fill="${SKIN_D}" opacity=".5"/><ellipse cx="114" cy="${hy + 14}" rx="9" ry="16" fill="${SKIN_D}" opacity=".5"/>`;
  s += `<path d="M-116 ${hy - 20} Q-120 ${hy + 92} -60 ${hy + 118} Q0 ${hy + 140} 60 ${hy + 118} Q120 ${hy + 92} 116 ${hy - 20} Q112 ${hy - 132} 0 ${hy - 134} Q-112 ${hy - 132} -116 ${hy - 20} Z" fill="${SKIN}"/>`;
  // Haare
  s += `<path d="M-122 ${hy - 4} C-140 ${hy - 120} -70 ${hy - 182} 6 ${hy - 172} C70 ${hy - 196} 150 ${hy - 140} 124 ${hy - 6} C112 ${hy - 70} 92 ${hy - 84} 60 ${hy - 88} C30 ${hy - 70} -10 ${hy - 70} -40 ${hy - 94} C-70 ${hy - 82} -104 ${hy - 70} -122 ${hy - 4} Z" fill="${HAIR}"/>`;
  s += `<path d="M-40 ${hy - 150} C0 ${hy - 178} 60 ${hy - 172} 92 ${hy - 140}" stroke="${HAIR_L}" stroke-width="12" fill="none" stroke-linecap="round"/>`;
  // Augen
  const look = o.look || [0, 0];
  const blink = clamp(o.blink || 0);
  for (const sd of [-1, 1]) {
    const ex = sd * 48, ey = hy + 4, rx = 36 * E.eye, ry = 44 * E.eye;
    const cid = idE + (sd > 0 ? 'r' : 'l');
    s += `<clipPath id="${cid}"><ellipse cx="${ex}" cy="${ey}" rx="${f1(rx)}" ry="${f1(ry)}"/></clipPath>`;
    s += `<ellipse cx="${ex}" cy="${ey}" rx="${f1(rx)}" ry="${f1(ry)}" fill="#fff"/>`;
    s += `<g clip-path="url(#${cid})">`;
    const ir = 21 * E.pupil, px = ex + look[0] * 12, py = ey + look[1] * 13 + 3;
    s += `<circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(ir)}" fill="#5A3420"/><circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(ir * .52)}" fill="#0d0d0d"/>`;
    s += `<circle cx="${f1(px + 7)}" cy="${f1(py - 8)}" r="${f1(6 * E.pupil + 1)}" fill="#fff"/>`;
    const lid = Math.max(E.lid, blink);
    const lidY = ey - ry + 2 * ry * lid;
    s += `<rect x="${f1(ex - rx - 2)}" y="${f1(ey - ry - 4)}" width="${f1(rx * 2 + 4)}" height="${f1(lidY - (ey - ry - 4))}" fill="${SKIN}"/>`;
    if (lid > .03) s += `<path d="M${f1(ex - rx)} ${f1(lidY)} L${f1(ex + rx)} ${f1(lidY)}" stroke="${HAIR}" stroke-width="5" opacity=".7"/>`;
    if (E.happy > .02 && blink < .5) s += `<ellipse cx="${ex}" cy="${f1(ey + ry * 1.32)}" rx="${f1(rx * 1.3)}" ry="${f1(ry * (0.62 + E.happy))}" fill="${SKIN}"/>`;
    s += `</g>`;
    s += `<ellipse cx="${ex}" cy="${ey}" rx="${f1(rx)}" ry="${f1(ry)}" fill="none" stroke="${SKIN_D}" stroke-width="3" opacity=".6"/>`;
    // Augenbraue
    const b = sd < 0 ? E.bl : E.br, by0 = hy - 52;
    const ox = sd * 86, ix = sd * 18;
    s += `<path d="M${ox} ${f1(by0 + b[0])} Q${sd * 52} ${f1(by0 - 14 + (b[0] + b[1]) / 2)} ${ix} ${f1(by0 + b[1])}" stroke="${HAIR}" stroke-width="17" fill="none" stroke-linecap="round"/>`;
  }
  // Nase
  s += `<path d="M-4 ${hy + 34} Q4 ${hy + 50} 14 ${hy + 44}" stroke="${SKIN_D}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  // Wangen
  if (E.blush > .02) s += `<ellipse cx="-82" cy="${hy + 56}" rx="24" ry="13" fill="#FF7B7B" opacity="${f1(E.blush * .35)}"/><ellipse cx="82" cy="${hy + 56}" rx="24" ry="13" fill="#FF7B7B" opacity="${f1(E.blush * .35)}"/>`;
  // Mund
  const my = hy + 80;
  let mouth = E.mouth;
  const talk = o.talk || 0;
  const talkable = ['smile0', 'smile', 'firm', 'grin', 'skew', 'frown', 'smirk'].includes(mouth);
  if (talk > .05 && talkable) mouth = 'talk';
  const MOUTH = {
    smile0: `<path d="M-30 ${my} Q0 ${my + 18} 30 ${my}" stroke="${INK}" stroke-width="8" fill="none" stroke-linecap="round"/>`,
    smile: `<path d="M-38 ${my - 4} Q0 ${my + 28} 38 ${my - 4}" stroke="${INK}" stroke-width="8" fill="none" stroke-linecap="round"/>`,
    grin: `<path d="M-48 ${my - 8} Q0 ${my + 2} 48 ${my - 8} Q42 ${my + 44} 0 ${my + 48} Q-42 ${my + 44} -48 ${my - 8} Z" fill="#5A1616"/><path d="M-44 ${my - 6} Q0 ${my + 3} 44 ${my - 6} L40 ${my + 8} Q0 ${my + 16} -40 ${my + 8} Z" fill="#fff"/><ellipse cx="0" cy="${my + 36}" rx="20" ry="9" fill="#E06A6A"/>`,
    open: `<path d="M-44 ${my - 10} Q0 ${my - 2} 44 ${my - 10} Q40 ${my + 56} 0 ${my + 60} Q-40 ${my + 56} -44 ${my - 10} Z" fill="#5A1616"/><path d="M-40 ${my - 8} Q0 ${my} 40 ${my - 8} L36 ${my + 6} Q0 ${my + 12} -36 ${my + 6} Z" fill="#fff"/><ellipse cx="0" cy="${my + 44}" rx="22" ry="11" fill="#E06A6A"/>`,
    O: `<ellipse cx="0" cy="${my + 14}" rx="22" ry="32" fill="#5A1616"/><ellipse cx="0" cy="${my + 34}" rx="12" ry="7" fill="#E06A6A"/>`,
    frown: `<path d="M-30 ${my + 14} Q0 ${my - 8} 30 ${my + 14}" stroke="${INK}" stroke-width="8" fill="none" stroke-linecap="round"/>`,
    skew: `<path d="M-30 ${my + 8} Q0 ${my + 4} 32 ${my - 6}" stroke="${INK}" stroke-width="8" fill="none" stroke-linecap="round"/>`,
    smirk: `<path d="M-26 ${my + 4} Q8 ${my + 16} 36 ${my - 10}" stroke="${INK}" stroke-width="8" fill="none" stroke-linecap="round"/>`,
    firm: `<path d="M-30 ${my + 4} Q0 ${my + 10} 30 ${my + 2}" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round"/>`,
    teeth: `<rect x="-40" y="${my - 6}" width="80" height="30" rx="12" fill="#fff" stroke="${INK}" stroke-width="5"/><path d="M-40 ${my + 9} L40 ${my + 9} M-14 ${my - 4} L-14 ${my + 22} M14 ${my - 4} L14 ${my + 22}" stroke="${INK}" stroke-width="3"/>`,
    talk: `<ellipse cx="0" cy="${my + 6}" rx="${f1(26 + 4 * talk)}" ry="${f1(5 + 20 * talk)}" fill="#5A1616"/><rect x="-18" y="${f1(my + 6 - 5 - 20 * talk)}" width="36" height="${f1(4 + 6 * talk)}" rx="3" fill="#fff"/>`,
  };
  s += MOUTH[mouth];
  // Schweiß
  if (o.sweat) {
    const k = o.sweat;
    s += `<path d="M118 ${hy - 70} q-16 26 0 36 q16 -10 0 -36 Z" fill="#8FD6FF" opacity="${f1(k)}" transform="translate(0 ${f1((o.sweatY || 0))})"/>`;
    s += `<path d="M-128 ${hy - 40} q-12 20 0 28 q12 -8 0 -28 Z" fill="#8FD6FF" opacity="${f1(k * .8)}"/>`;
  }
  s += `</g>`;
  return `<g transform="translate(${f1(o.x)},${f1(o.y)}) scale(${o.s ?? 1})">${s}</g>`;
}
// Kopfposition in Weltkoordinaten (für Kamera-Fokus)
const headOf = o => [o.x, o.y + o.s * (-914 + (o.sit || 0) * 205 + (1 - (o.post ?? 1)) * 42)];

/* ---------------- Figur liegend (Bankdrücken, Seitenansicht) ---------------- */
function liftGuy(o) {
  const { x, y, s } = o; const m = o.m || 0, ext = clamp(o.ext), strain = o.strain || 0;
  const T = 112 + 30 * m;
  let g = '';
  // Rack
  g += `<rect x="-148" y="-610" width="22" height="830" rx="6" fill="#30333b"/><rect x="-170" y="-520" width="64" height="16" rx="6" fill="#4a4e58"/>`;
  // Bank
  g += `<rect x="-350" y="0" width="520" height="44" rx="18" fill="#2b2e36"/><rect x="-350" y="0" width="520" height="16" rx="8" fill="#3a3e48"/>`;
  g += `<rect x="-300" y="40" width="26" height="180" fill="#3a3e48"/><rect x="110" y="40" width="26" height="180" fill="#3a3e48"/><rect x="-330" y="212" width="490" height="14" rx="7" fill="#22252c"/>`;
  // Beine
  const hip = [110, -50], knee = [250, -128], foot = [312, 196];
  g += `<path d="M${hip[0]} ${hip[1]} L${knee[0]} ${knee[1]} L${foot[0]} ${foot[1]}" stroke="${SKIN}" stroke-width="${66 + 10 * m}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  g += `<path d="M${hip[0] - 20} ${hip[1]} L${lerp(hip[0], knee[0], .6)} ${lerp(hip[1], knee[1], .6)}" stroke="${SHORTS}" stroke-width="${92 + 10 * m}" stroke-linecap="round"/>`;
  g += `<rect x="${foot[0] - 40}" y="${foot[1] - 18}" width="120" height="50" rx="22" fill="#FAFAFA"/><rect x="${foot[0] - 40}" y="${foot[1] + 16}" width="120" height="16" rx="8" fill="#2a2a30"/>`;
  // Torso liegend
  g += `<rect x="-200" y="${-T}" width="330" height="${T}" rx="${T / 2.2}" fill="url(#gShirt)"/>`;
  g += `<ellipse cx="-110" cy="${-T + 18}" rx="${88 + 26 * m}" ry="${30 + 16 * m}" fill="${SHIRT}"/>`;
  g += `<rect x="70" y="${-T + 6}" width="80" height="${T - 6}" rx="30" fill="${SHORTS}"/>`;
  // Kopf (Gesicht nach oben)
  const hx = -268, hyy = -72;
  g += `<rect x="-232" y="${-T + 24}" width="60" height="70" fill="${SKIN}"/>`;
  g += `<circle cx="${hx}" cy="${hyy}" r="98" fill="${SKIN}"/>`;
  g += `<path d="M${hx - 98} ${hyy + 6} A98 98 0 0 1 ${hx - 30} ${hyy - 92} Q${hx - 60} ${hyy - 40} ${hx - 70} ${hyy + 30} Z" fill="${HAIR}"/>`;
  g += `<path d="M${hx - 100} ${hyy} Q${hx - 110} ${hyy - 80} ${hx - 40} ${hyy - 104}" stroke="${HAIR}" stroke-width="34" fill="none" stroke-linecap="round"/>`;
  g += `<ellipse cx="${hx - 8}" cy="${hyy + 6}" rx="20" ry="26" fill="${SKIN_D}" opacity=".45"/>`;
  // Gesicht
  const ex = hx + 18, ey = hyy - 66, sq = strain * .55;
  g += `<ellipse cx="${ex}" cy="${ey}" rx="30" ry="${f1(26 * (1 - sq * .6))}" fill="#fff" stroke="${INK}" stroke-opacity=".5" stroke-width="4"/>`;
  g += `<circle cx="${ex + 10}" cy="${f1(ey - 6 + sq * 6)}" r="${f1(14 * (1 - sq * .3))}" fill="#111"/><circle cx="${ex + 14}" cy="${f1(ey - 10 + sq * 6)}" r="4" fill="#fff"/>`;
  g += `<path d="M${ex - 34} ${f1(ey - 22 - (o.brow || 0))} Q${ex - 10} ${f1(ey - 46 + strain * 18 - (o.brow || 0))} ${ex + 26} ${f1(ey - 36 + strain * 14)}" stroke="${HAIR}" stroke-width="13" fill="none" stroke-linecap="round"/>`;
  g += `<path d="M${hx + 62} ${hyy - 78} q22 -10 26 6 q-8 10 -22 10" fill="${SKIN}" stroke="${SKIN_D}" stroke-width="5"/>`;
  if (o.mouth === 'grin') g += `<path d="M${hx + 74} ${hyy - 24} Q${hx + 100} ${hyy - 6} ${hx + 82} ${hyy + 22} Z" fill="#5A1616"/>`;
  else if (strain > .3) g += `<rect x="${hx + 66}" y="${hyy - 34}" width="26" height="42" rx="8" fill="#fff" stroke="${INK}" stroke-width="4"/>`;
  else g += `<path d="M${hx + 76} ${hyy - 30} q10 18 0 36" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  if (strain > .05) g += `<circle cx="${hx}" cy="${hyy}" r="98" fill="#FF3B3B" opacity="${f1(strain * .22)}"/>`;
  if (o.sweat) g += `<path d="M${hx - 60} ${hyy - 110} q-14 24 0 32 q14 -8 0 -32Z" fill="#8FD6FF" opacity="${f1(o.sweat)}"/>`;
  // Arm (IK) + Hantel
  const S = [-150, -T + 26];
  const L1 = 172, L2 = 168;
  const hand = [-140 + (o.tremble || 0) * 2, -T - 30 - ext * 268 + (o.tremble || 0)];
  let dx = hand[0] - S[0], dy = hand[1] - S[1];
  let d = Math.min(Math.hypot(dx, dy), L1 + L2 - 1);
  const th = Math.atan2(dy, dx);
  const a = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const el = [S[0] + L1 * Math.cos(th + a), S[1] + L1 * Math.sin(th + a)];
  const wU = 54 + 24 * m, wF = 46 + 10 * m;
  g += `<path d="M${f1(S[0])} ${f1(S[1])} L${f1(el[0])} ${f1(el[1])}" stroke="${SKIN}" stroke-width="${wU}" stroke-linecap="round"/>`;
  g += `<path d="M${f1(el[0])} ${f1(el[1])} L${f1(hand[0])} ${f1(hand[1])}" stroke="${SKIN}" stroke-width="${wF}" stroke-linecap="round"/>`;
  g += `<path d="M${f1(S[0])} ${f1(S[1])} L${f1(lerp(S[0], el[0], .38))} ${f1(lerp(S[1], el[1], .38))}" stroke="${SHIRT}" stroke-width="${wU + 18}" stroke-linecap="round"/>`;
  // Hantelscheiben (Seitenansicht: Stange zeigt in den Bildschirm)
  const plates = o.plates || [{ r: 132, c: 'url(#gPlate)' }];
  let px = hand[0] + (plates.length - 1) * 16;
  for (let i = plates.length - 1; i >= 0; i--) {
    const p = plates[i];
    g += `<circle cx="${f1(px)}" cy="${f1(hand[1])}" r="${p.r}" fill="${p.c}" stroke="#0b0b0d" stroke-width="6"/>`;
    g += `<circle cx="${f1(px)}" cy="${f1(hand[1])}" r="${p.r - 22}" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="10"/>`;
    if (p.label) g += `<text x="${f1(px)}" y="${f1(hand[1] - p.r + 52)}" text-anchor="middle" font-size="30" font-weight="900" fill="#fff" opacity=".85">${p.label}</text>`;
    px -= 16;
  }
  g += `<circle cx="${f1(hand[0])}" cy="${f1(hand[1])}" r="34" fill="#b8bec8" stroke="#6b717c" stroke-width="6"/><circle cx="${f1(hand[0])}" cy="${f1(hand[1])}" r="12" fill="#575c66"/>`;
  return { svg: `<g transform="translate(${f1(x)},${f1(y)}) scale(${s})">${g}</g>`, hand: [x + hand[0] * s, y + hand[1] * s] };
}

/* ---------------- Produkt ---------------- */
let PRODUCT = { src: '../build/product.png', w: 900, h: 1100 };
function product(cx, cy, h, extra) {
  const w = h * PRODUCT.w / PRODUCT.h;
  return `<image href="${PRODUCT.src}" x="${f1(cx - w / 2)}" y="${f1(cy - h / 2)}" width="${f1(w)}" height="${f1(h)}" ${extra || ''}/>`;
}
function gymBag(x, y, s, peek) {
  return `<g transform="translate(${x},${y}) scale(${s})">
   <ellipse cx="0" cy="62" rx="190" ry="20" fill="#000" opacity=".5"/>
   ${product(-40, -30 - (peek ?? 1) * 26, 150)}
   <path d="M-170 -10 Q-176 60 -120 64 L120 64 Q176 60 170 -10 Q160 -56 110 -60 L-110 -60 Q-160 -56 -170 -10 Z" fill="#2E323D"/>
   <path d="M-150 -40 L150 -40" stroke="${OR}" stroke-width="8" stroke-linecap="round"/>
   <path d="M-90 -60 Q0 -150 90 -60" stroke="#20232b" stroke-width="16" fill="none"/>
   <rect x="30" y="-6" width="90" height="40" rx="10" fill="#262a33"/><text x="75" y="22" text-anchor="middle" font-size="20" font-weight="900" fill="${OR}">GYM</text>
  </g>`;
}

/* ---------------- Gym-Hintergrund ---------------- */
function gym(t, o = {}) {
  const px = o.px || 0;  // Parallax-Versatz
  let s = `<rect x="-400" y="-400" width="1880" height="2720" fill="url(#gBg)"/>`;
  // Wandpaneele
  s += `<g transform="translate(${f1(px * .3)},0)">`;
  for (let i = -2; i < 8; i++) s += `<rect x="${i * 240 - 60}" y="380" width="226" height="780" rx="10" fill="#ffffff" opacity=".025"/>`;
  // Fenster
  const wx = 70, wy = 470, ww = 360, wh = 420;
  s += `<rect x="${wx - 14}" y="${wy - 14}" width="${ww + 28}" height="${wh + 28}" rx="14" fill="#30333B"/>`;
  s += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="url(#gNight)"/>`;
  for (let i = 0; i < 22; i++) {
    const bx = wx + rnd(i * 3) * ww, bh = 80 + rnd(i * 7) * 220;
    s += `<rect x="${f1(bx)}" y="${f1(wy + wh - bh)}" width="${f1(30 + rnd(i) * 40)}" height="${f1(bh)}" fill="#0b1020" opacity=".9"/>`;
    for (let j = 0; j < 4; j++) if (rnd(i * 13 + j) > .45) s += `<rect x="${f1(bx + 6 + j * 8)}" y="${f1(wy + wh - bh + 14 + rnd(i + j) * (bh - 30))}" width="5" height="7" fill="#FFC36B" opacity="${f1(.4 + .5 * rnd(i * j + 3))}"/>`;
  }
  if (o.rain) {
    let r = '';
    for (let i = 0; i < 70; i++) {
      const sp = 900 + rnd(i) * 500, x0 = wx + rnd(i * 5) * ww, y0 = ((rnd(i * 9) * wh + t * sp) % (wh + 80)) + wy - 40;
      r += `<path d="M${f1(x0)} ${f1(y0)} l-8 46" stroke="#9fb7ff" stroke-width="3" opacity=".55"/>`;
    }
    for (let i = 0; i < 26; i++) {
      const x0 = wx + rnd(i * 31) * ww, y0 = wy + ((rnd(i * 17) * wh + t * (40 + rnd(i) * 60)) % wh);
      r += `<ellipse cx="${f1(x0)}" cy="${f1(y0)}" rx="5" ry="8" fill="#cfe0ff" opacity=".45"/>`;
    }
    s += `<g clip-path="url(#winClip)">${r}</g><clipPath id="winClip"><rect x="${wx}" y="${wy}" width="${ww}" height="${wh}"/></clipPath>`;
  }
  s += `<path d="M${wx + ww / 2} ${wy} V${wy + wh} M${wx} ${wy + wh / 2} H${wx + ww}" stroke="#30333B" stroke-width="12"/>`;
  s += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="#fff" opacity=".04"/>`;
  // Wandlogo-Streifen
  s += `<rect x="-200" y="1000" width="1480" height="14" fill="${OR}" opacity=".85"/>`;
  s += `<text x="690" y="640" font-size="120" font-weight="900" fill="#fff" opacity=".045" letter-spacing="-2">NO</text><text x="640" y="760" font-size="120" font-weight="900" fill="#fff" opacity=".045">LIMIT</text>`;
  s += `</g>`;
  // Kurzhantel-Rack rechts (mittlere Ebene)
  s += `<g transform="translate(${f1(px * .6)},0)">`;
  s += `<rect x="640" y="1080" width="440" height="20" rx="6" fill="#30333B"/><rect x="660" y="1100" width="16" height="140" fill="#30333B"/><rect x="1040" y="1100" width="16" height="140" fill="#30333B"/>`;
  for (let i = 0; i < 6; i++) { const cx = 690 + i * 64; s += `<rect x="${cx}" y="${1040 - i * 2}" width="46" height="44" rx="10" fill="#22252c" stroke="#3a3e48" stroke-width="3"/>`; }
  s += `</g>`;
  // Boden
  s += `<rect x="-400" y="1180" width="1880" height="1200" fill="url(#gFloor)"/>`;
  s += `<g opacity=".18" stroke="#fff" stroke-width="2">`;
  for (let i = -8; i <= 8; i++) s += `<path d="M${540 + i * 40 + px * .2} 1180 L${540 + i * 260 + px} 1920"/>`;
  for (let j = 0; j < 7; j++) { const yy = 1180 + Math.pow(j / 7, 1.8) * 740; s += `<path d="M-400 ${f1(yy)} L1480 ${f1(yy)}" opacity="${f1(.4 + j * .08)}"/>`; }
  s += `</g>`;
  s += `<rect x="-400" y="1176" width="1880" height="6" fill="#000" opacity=".5"/>`;
  // Glow hinter der Figur
  if (o.glow !== false) s += `<ellipse cx="${FX0}" cy="900" rx="560" ry="640" fill="url(#gGlow)" opacity="${o.glowK ?? .55}"/>`;
  if (o.bag) s += gymBag(o.bag[0] + px * 1.1, o.bag[1], o.bag[2] || .9, o.bag[3]);
  return s;
}

/* ---------------- Effekte ---------------- */
function dust(t, n, col, op, seed = 1) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const k = i + seed * 100;
    const x = (rnd(k) * 1200 + t * (10 + rnd(k * 2) * 30)) % 1200 - 60;
    const y = (rnd(k * 3) * 2000 - t * (30 + rnd(k * 5) * 70)) % 2000;
    const yy = y < 0 ? y + 2000 : y;
    const r = 2 + rnd(k * 7) * 5;
    s += `<circle cx="${f1(x)}" cy="${f1(yy)}" r="${f1(r)}" fill="${col}" opacity="${f1(op * (.3 + .7 * rnd(k * 11)) * (.6 + .4 * Math.sin(t * 3 + k)))}"/>`;
  }
  return s;
}
function speedLines(t, k, cx = 540, cy = 960, col = '#fff', n = 46) {
  if (k <= 0.01) return '';
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = rnd(i * 3.1) * Math.PI * 2 + Math.floor(t * 30) * .07;
    const r0 = 380 + rnd(i * 7 + Math.floor(t * 30)) * 360, len = 260 + rnd(i * 5) * 600;
    s += `<path d="M${f1(cx + Math.cos(a) * r0)} ${f1(cy + Math.sin(a) * r0)} L${f1(cx + Math.cos(a) * (r0 + len))} ${f1(cy + Math.sin(a) * (r0 + len))}" stroke="${col}" stroke-width="${f1(3 + rnd(i) * 7)}" stroke-linecap="round" opacity="${f1(k * (.25 + .5 * rnd(i * 9)))}"/>`;
  }
  return s;
}
function hLines(t, k, col = '#fff') {
  if (k <= .01) return '';
  let s = '';
  const fr = Math.floor(t * 30);
  for (let i = 0; i < 30; i++) {
    const y = rnd(i * 5 + fr * 0.37) * 1920, x = rnd(i * 3 + fr) * 1080 - 300, len = 300 + rnd(i * 7) * 700;
    s += `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(len)}" height="${f1(2 + rnd(i) * 6)}" fill="${col}" opacity="${f1(k * (.2 + .4 * rnd(i * 2)))}"/>`;
  }
  return s;
}
function confetti(t, t0, ox, oy, n = 140, power = 1) {
  const dt = t - t0;
  if (dt < 0 || dt > 3.5) return '';
  const cols = [OR, '#FFFFFF', '#FFD23F', OR2, '#3DDC97', '#59C3FF'];
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (rnd(i * 3) - .5) * 2.6;
    const v = (900 + rnd(i * 5) * 1500) * power;
    const drag = Math.exp(-dt * 1.6);
    const x = ox + Math.cos(a) * v * (1 - drag) / 1.6 + Math.sin(dt * 4 + i) * 20;
    const y = oy + Math.sin(a) * v * (1 - drag) / 1.6 + 380 * dt * dt * .5 + 120 * dt;
    const rot = dt * (300 + rnd(i) * 600) + i * 40;
    const w = 14 + rnd(i * 7) * 14, h = 8 + rnd(i * 11) * 10;
    const fl = Math.abs(Math.cos(dt * 8 + i));
    s += `<rect x="${f1(-w / 2)}" y="${f1(-h / 2)}" width="${f1(w)}" height="${f1(h * fl + 2)}" fill="${cols[i % cols.length]}" transform="translate(${f1(x)},${f1(y)}) rotate(${f1(rot)})" opacity="${f1(clamp(3.3 - dt))}"/>`;
  }
  return s;
}
function burst(t, t0, cx, cy, col = OR, n = 22, R = 260) {
  const dt = t - t0;
  if (dt < 0 || dt > .7) return '';
  const k = eOut(dt / .7);
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + rnd(i) * .2;
    const r1 = R * k, r0 = R * Math.max(0, k - .35);
    s += `<path d="M${f1(cx + Math.cos(a) * r0)} ${f1(cy + Math.sin(a) * r0)} L${f1(cx + Math.cos(a) * r1)} ${f1(cy + Math.sin(a) * r1)}" stroke="${col}" stroke-width="${f1(10 * (1 - k) + 2)}" stroke-linecap="round"/>`;
  }
  return s;
}
function rays(t, cx, cy, k, col = OR, n = 14) {
  let s = `<g transform="translate(${cx},${cy}) rotate(${f1(t * 14)})" opacity="${f1(k)}">`;
  for (let i = 0; i < n; i++) { const a = i / n * 360; s += `<path d="M0 0 L-60 -1100 L60 -1100 Z" fill="${col}" opacity=".07" transform="rotate(${a})"/>`; }
  return s + `</g>`;
}
const flashRect = (k, col = '#fff') => k > .01 ? `<rect width="1080" height="1920" fill="${col}" opacity="${f1(clamp(k))}"/>` : '';
const vignette = (k = 1) => `<rect width="1080" height="1920" fill="url(#gVig)" opacity="${k}"/>`;
function grain(t) {
  const fr = Math.floor(t * 30);
  let s = '';
  for (let i = 0; i < 60; i++) s += `<rect x="${f1(rnd(i + fr * 61) * 1080)}" y="${f1(rnd(i * 3 + fr * 17) * 1920)}" width="3" height="3" fill="#fff" opacity=".05"/>`;
  return s;
}
function shakeXY(t, t0, dur, amp, freq = 38) {
  const k = 1 - seg(t, t0, t0 + dur);
  if (t < t0 || k <= 0) return [0, 0, 0];
  const a = amp * k * k;
  return [noise1(t * freq) * a, noise1(t * freq + 50) * a, noise1(t * freq * .7 + 9) * a * .03];
}
function cam(inner, c) {
  const z = c.z ?? 1, fx = c.fx ?? 540, fy = c.fy ?? 960, sx = c.sx || 0, sy = c.sy || 0, r = c.r || 0;
  return `<g transform="translate(${f1(540 + sx)},${f1(960 + sy)}) rotate(${f1(r)}) scale(${z.toFixed(4)}) translate(${f1(-fx)},${f1(-fy)})">${inner}</g>`;
}
// Ausdrucks-Text in der Szene (z.B. „?!“, Labels)
function popText(t, t0, x, y, txt, o = {}) {
  const dt = t - t0;
  if (dt < 0 || (o.until != null && t > o.until)) return '';
  const k = eBack(dt / (o.dur || .22));
  const out = o.until != null ? 1 - seg(t, o.until - .12, o.until) : 1;
  const wob = o.wob ? Math.sin(dt * 9) * o.wob : 0;
  return `<g transform="translate(${x},${y}) rotate(${f1((o.rot || 0) + wob)}) scale(${f1(k * out)})" opacity="${f1(clamp(dt / .06) * out)}">
   <text text-anchor="middle" font-size="${o.size || 90}" font-weight="900" fill="${o.fill || '#fff'}" stroke="${o.stroke || '#000'}" stroke-width="${o.sw ?? 14}" stroke-linejoin="round" paint-order="stroke" letter-spacing="${o.ls || 0}">${txt}</text></g>`;
}
function pill(x, y, w, h, txt, o = {}) {
  return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${o.rot || 0}) scale(${f1(o.k ?? 1)})" opacity="${o.op ?? 1}" ${o.filter ? `filter="url(#${o.filter})"` : ''}>
   <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="${o.bg || OR}" stroke="${o.stroke || 'none'}" stroke-width="${o.swd || 0}"/>
   <text y="${f1(o.fs * .36 || 14)}" text-anchor="middle" font-size="${o.fs || 40}" font-weight="900" fill="${o.fg || '#111'}">${txt}</text></g>`;
}

/* ---------------- HUD: Tageszähler + Speicherbalken ---------------- */
function hud(t, h) {
  if (!h || h.hide >= 1) return '';
  const op = 1 - (h.hide || 0);
  const day = h.day;
  const pop = h.pop || 0;
  let s = `<g opacity="${f1(op)}">`;
  const cx = 500, cy = 236;
  const sc = 1 + pop * .16;
  s += `<g transform="translate(${cx + (h.jx || 0)},${cy + (h.jy || 0)}) scale(${f1(sc)})">`;
  s += `<rect x="-235" y="-78" width="470" height="156" rx="34" fill="#0c0c0e" fill-opacity=".72" stroke="${h.col || OR}" stroke-width="6"/>`;
  if (pop > .05) s += `<rect x="-235" y="-78" width="470" height="156" rx="34" fill="none" stroke="${h.col || OR}" stroke-width="16" opacity="${f1(pop * .5)}" filter="url(#fBlur8)"/>`;
  const num = (dx, col, op) => `<text x="${dx}" y="48" text-anchor="middle" font-weight="900" fill="${col}" opacity="${op}" letter-spacing="-2"><tspan font-size="78" fill="${op < 1 ? col : (h.col || OR)}" letter-spacing="2">TAG </tspan><tspan font-size="128" dy="2">${day}</tspan></text>`;
  if (h.rgb) s += num(h.rgb, '#ff1f4b', .6) + num(-h.rgb, '#1fd2ff', .6);
  s += num(0, '#fff', 1);
  s += `</g>`;
  // Speicherbalken
  const bx = 230, by = 362, bw = 540, bh = 40, lv = clamp(h.bar ?? 0);
  s += `<text x="${bx}" y="${by - 14}" font-size="27" font-weight="800" fill="#fff" letter-spacing="1.5">CREATIN-SPEICHER IM MUSKEL</text>`;
  s += `<text x="${bx + bw}" y="${by - 14}" text-anchor="end" font-size="27" font-weight="900" fill="${OR}">${Math.round(lv * 100)} %</text>`;
  s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${bh / 2}" fill="#0c0c0e" fill-opacity=".75" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>`;
  if (lv > .005) {
    const fw = Math.max(bh, (bw - 8) * lv);
    s += `<clipPath id="barClip"><rect x="${bx + 4}" y="${by + 4}" width="${f1(fw)}" height="${bh - 8}" rx="${(bh - 8) / 2}"/></clipPath>`;
    s += `<g clip-path="url(#barClip)"><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="url(#gOr)"/>`;
    for (let i = -2; i < 16; i++) { const xx = bx + i * 44 + (t * 70 % 44); s += `<path d="M${f1(xx)} ${by + bh} l24 -${bh} h14 l-24 ${bh} Z" fill="#fff" opacity=".18"/>`; }
    s += `</g>`;
  }
  if (h.barFlash > .01) s += `<rect x="${bx - 10}" y="${by - 10}" width="${bw + 20}" height="${bh + 20}" rx="30" fill="#fff" opacity="${f1(h.barFlash * .8)}" filter="url(#fBlur8)"/>`;
  s += `</g>`;
  return s;
}

/* ---------------- Untertitel ---------------- */
const SUB_FS = 92, SUB_LH = 112, SUB_MAXW = 820, GAP = 50;
let measureCtx = null;
function tw(txt, fs = SUB_FS) {
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
  measureCtx.font = `800 ${fs}px Poppins`;
  return measureCtx.measureText(txt).width;
}
function buildChunks(words) {
  const chunks = []; let cur = [];
  const width = idx => idx.reduce((a, i) => a + tw(words[i].word), 0) + (idx.length - 1) * GAP;
  for (let i = 0; i < words.length; i++) {
    cur.push(i);
    const w = words[i].word;
    const end = /[.!?:…]$/.test(w) || (/,$/.test(w) && cur.length >= 2);
    const nextTooWide = i + 1 < words.length && width([...cur, i + 1]) > SUB_MAXW;
    if (end || cur.length >= 3 || nextTooWide) { chunks.push(cur); cur = []; }
  }
  if (cur.length) chunks.push(cur);
  // Layout pro Chunk (ggf. zweizeilig)
  return chunks.map(idx => {
    const lines = [[]]; let lw = 0;
    for (const i of idx) {
      const ww = tw(words[i].word);
      if (lines[lines.length - 1].length && lw + GAP + ww > SUB_MAXW) { lines.push([]); lw = 0; }
      lines[lines.length - 1].push(i); lw += (lw ? GAP : 0) + ww;
    }
    const pos = {};
    lines.forEach((ln, li) => {
      const tot = ln.reduce((a, i) => a + tw(words[i].word), 0) + (ln.length - 1) * GAP;
      let x = SUB_CX - tot / 2;
      for (const i of ln) { const ww = tw(words[i].word); pos[i] = { x: x + ww / 2, line: li }; x += ww + GAP; }
    });
    return { idx, lines: lines.length, pos };
  });
}
const SUB_CX = 495;
function subtitles(t, words, chunks, y0, dur) {
  if (!words.length) return '';
  let s = '';
  for (let c = 0; c < chunks.length; c++) {
    const ch = chunks[c];
    const st = words[ch.idx[0]].start - .05;
    const nx = c + 1 < chunks.length ? words[chunks[c + 1].idx[0]].start - .05 : dur + 1;
    const en = Math.min(nx, words[ch.idx[ch.idx.length - 1]].end + .7);
    if (t < st || t >= en) continue;
    const yTop = y0 - (ch.lines - 1) * SUB_LH / 2;
    for (const i of ch.idx) {
      const w = words[i];
      const age = t - (w.start - .03);
      if (age < 0) continue;
      const k = eBack(age / .17);
      const sc = lerp(.45, 1, k) * (t >= w.start && t < w.end + .05 ? 1.07 : 1);
      const p = ch.pos[i];
      const y = yTop + p.line * SUB_LH;
      const fill = w.key ? OR : '#fff';
      const txt = w.word.replace(/&/g, '&amp;');
      s += `<g transform="translate(${f1(p.x)},${f1(y)}) scale(${sc.toFixed(3)})" opacity="${f1(clamp(age / .05))}">
       <text y="${SUB_FS * .35 + 7}" text-anchor="middle" font-size="${SUB_FS}" font-weight="800" fill="#000" opacity=".45">${txt}</text>
       <text y="${SUB_FS * .35}" text-anchor="middle" font-size="${SUB_FS}" font-weight="800" fill="${fill}" stroke="#000" stroke-width="17" stroke-linejoin="round" paint-order="stroke">${txt}</text></g>`;
    }
  }
  return s;
}

/* ---------------- Szenen ---------------- */
let D = null;      // Szenendaten (Dauer, Wörter, ...)
let CH = null;     // Untertitel-Chunks
// Startzeit eines Wortes (nach Inhalt, n-tes Vorkommen)
function wt(key, occ = 0, fb = null) {
  const k = norm(key); let c = 0;
  for (const w of D.words) if (norm(w.word).startsWith(k)) { if (c === occ) return w.start; c++; }
  return fb;
}
function wEnd(key, occ = 0, fb = null) {
  const k = norm(key); let c = 0;
  for (const w of D.words) if (norm(w.word).startsWith(k)) { if (c === occ) return w.end; c++; }
  return fb;
}
function talkAt(t) {
  for (const w of D.words) if (t >= w.start && t < w.end) return .45 + .55 * Math.abs(Math.sin((t - w.start) * 17));
  return 0;
}
function blinkAt(t, off = 0) {
  const p = (t + off) % 2.9;
  return p < .13 ? Math.sin(p / .13 * Math.PI) : 0;
}
const entry = t => 1 - eOut(t / .28);             // Szenen-Einstieg (Whoosh-Punch)
function rattle(t, from, to, t0 = .04, t1 = .5) {
  if (from === to) return to;
  return Math.round(lerp(from, to, eOut(seg(t, t0, t1))));
}

// Standard-Figurposition je Tag
function guyBase(day, extra) {
  return Object.assign({ x: FX0, y: FY0, s: FS0, m: muscleOf(day), post: postureOf(day) }, extra || {});
}

// Hero-Pose (Tag 100) – identisch im ersten Frame und im Loop-Ende
function heroWorld(th) {
  const t = th;
  const g = guyBase(100, {
    pose: POSE.hips, emo: 'proud', chest: 1, look: [0, 0],
    blink: 0, y: FY0 + Math.sin(t * 2.4) * 3,
  });
  let w = gym(t, { bag: [170, 1300, .85], px: Math.sin(t * .6) * 10 });
  w += rays(t, FX0, 880, .7);
  w += guy(g);
  // Bestwert-Badge blinkt
  const ph = ((t % .5) + .5) % .5;
  const on = ph < .34 ? 1 : .35;
  w += `<g transform="translate(735,610) rotate(-8)" opacity="${on}">
    <rect x="-170" y="-52" width="340" height="104" rx="22" fill="${OR}" filter="url(#fOrGlow)"/>
    <text y="-6" text-anchor="middle" font-size="34" font-weight="900" fill="#111">NEUER</text>
    <text y="34" text-anchor="middle" font-size="40" font-weight="900" fill="#fff" stroke="#111" stroke-width="2">BESTWERT ★</text></g>`;
  w += dust(t + 20, 26, OR2, .55, 3);
  const z = 1.06 + .012 * t;
  return { world: cam(w, { z, fx: 540, fy: 960 + 10 * t }), hud: { day: 100, bar: 1 } };
}

const SC = {};

/* ---- HOOK ---- */
SC.hook = {
  setup() {
    const x = D.extra;
    const R = x.rewind_word ? wt(x.rewind_word) - .06 : 1.0;
    let Ts = wt(x.stutter_word, 0, R + .5);
    if (Ts < R + .3) Ts = R + .3;
    const E = D.duration;
    D.R = Math.max(1.0, R); D.Ts = Ts; D.Te = Ts + .5; D.Land = E - .38;
    D.sd = x.stutter_day;
  },
  dayAt(t) {
    if (t < D.R) return 100;
    if (t < D.Ts) return Math.round(lerp(100, D.sd, eIn(seg(t, D.R, D.Ts)) * .4 + seg(t, D.R, D.Ts) * .6));
    if (t < D.Te) return D.sd;
    return Math.max(1, Math.round(lerp(D.sd, 1, seg(t, D.Te, D.Land))));
  },
  sfx() {
    return [{ t: D.R - .02, type: 'rewind', dur: D.Land - D.R + .05 }, { t: D.Ts, type: 'glitch' }, { t: D.Land, type: 'hit', gain: .7 }];
  },
  render(t) {
    const day = this.dayAt(t);
    if (t < D.R) {
      const h = heroWorld(t);
      return { world: h.world, hud: h.hud };
    }
    const rw = t < D.Land ? 1 : 1 - seg(t, D.Land, D.Land + .25);   // Rückspul-Intensität
    const inStut = t >= D.Ts && t < D.Te;
    let w = '';
    if (inStut) {
      // Standbild des Schlüsseltags
      if (D.sd === 20) {
        w += gym(t, { bag: [170, 1300, .85] });
        const g = guyBase(20, { pose: POSE.shock, emo: 'shock', sweat: 1, look: [0, .4] });
        w += scaleProp(FX0, FY0 + 20, 1.0, '+2,0 KG', 1);
        w += guy(g);
        w += popText(t, D.Ts, 720, 760, '?!', { size: 150, fill: OR, rot: 12 });
        w = cam(w, { z: 1.25, fx: FX0, fy: 900, r: -3 });
      } else {
        w += gym(t, { glowK: .9 });
        const L = liftGuy({ x: 520, y: 1110, s: 1.05, m: muscleOf(80), ext: .92, strain: .7, plates: PL80 });
        w += L.svg + confetti(t, D.Ts - .2, L.hand[0], L.hand[1]);
        w = cam(w, { z: 1.35, fx: 460, fy: 880, r: 3 });
      }
      w += `<rect width="1080" height="1920" fill="${D.sd === 20 ? '#ff1f4b' : '#FFD23F'}" opacity=".16"/>`;
    } else {
      const k = 1 - (day - 1) / 99;   // 0 = Tag 100, 1 = Tag 1
      const pose = mixPose(POSE.hips, POSE.stand, smooth(k * 1.4));
      const landed = t >= D.Land;
      const g = guyBase(day, {
        pose, emo: k > .6 ? 'doubt' : 'proud', look: landed ? [-.3, -.1] : [0, 0],
        chest: 1 - k, blink: landed ? blinkAt(t, 1.3) : 0,
      });
      const jx = rw * noise1(t * 40) * 26;
      w += gym(t, { bag: [170, 1300, .85], px: jx * .5 });
      w += guy(g);
      w = cam(w, { z: 1.06 - .04 * k, fx: 540, fy: 960, sx: jx });
    }
    // VHS-Rückspul-Layer
    let fx = '';
    if (rw > .01) {
      const fr = Math.floor(t * 30);
      fx += `<rect width="1080" height="1920" fill="#0a1a40" opacity="${f1(.2 * rw)}"/>`;
      for (let y = 0; y < 1920; y += 8) fx += `<rect x="0" y="${y}" width="1080" height="3" fill="#000" opacity="${f1(.22 * rw)}"/>`;
      for (let i = 0; i < 4; i++) {
        const by = (rnd(fr * 3 + i) * 1920), bh = 18 + rnd(fr + i * 7) * 70;
        fx += `<rect x="0" y="${f1(by)}" width="1080" height="${f1(bh)}" fill="#fff" opacity="${f1(.10 + .14 * rnd(i + fr))}"/>`;
        fx += `<rect x="${f1(rnd(fr + i) * 400)}" y="${f1(by + bh * .4)}" width="${f1(200 + rnd(i * 3 + fr) * 600)}" height="4" fill="#ff1f4b" opacity=".5"/>`;
      }
      fx += hLines(t, .8 * rw);
      // OSD
      const blinkOn = Math.floor(t * 4) % 2 === 0;
      fx += `<g opacity="${f1(rw)}"><text x="70" y="540" font-size="64" font-weight="900" fill="#fff" stroke="#000" stroke-width="6" paint-order="stroke">${blinkOn ? '◀◀' : ''}</text>
        <text x="190" y="540" font-size="48" font-weight="800" fill="#fff" stroke="#000" stroke-width="6" paint-order="stroke">REWIND</text>
        <text x="70" y="600" font-size="34" font-weight="700" fill="#fff" opacity=".85" stroke="#000" stroke-width="5" paint-order="stroke">TAG ${String(day).padStart(3, '0')} · ${String(Math.floor(fr / 30) % 60).padStart(2, '0')}:${String(fr % 30).padStart(2, '0')}</text></g>`;
    }
    if (inStut) fx += flashRect(1 - seg(t, D.Ts, D.Ts + .14), '#fff');
    if (t >= D.Land) fx += flashRect(.5 * (1 - seg(t, D.Land, D.Land + .2)));
    const rgb = rw > .05 ? 6 + rnd(Math.floor(t * 30)) * 10 : 0;
    return {
      world: w, fx, rgbSplit: rgb * (inStut ? 2 : 1),
      hud: { day, bar: barOf(day), pop: t >= D.Land ? 1 - seg(t, D.Land, D.Land + .3) : (inStut ? 1 - seg(t, D.Ts, D.Te) : 0), rgb: rw > .05 ? 5 : 0, col: inStut && D.sd === 20 ? '#ff3b55' : OR },
    };
  },
};

/* Waage */
function scaleProp(x, y, s, disp, hot) {
  return `<g transform="translate(${x},${y}) scale(${s})">
   <rect x="-190" y="-46" width="380" height="64" rx="22" fill="#D9DCE2"/>
   <rect x="-190" y="-46" width="380" height="18" rx="9" fill="#F3F4F7"/>
   <rect x="-92" y="-22" width="184" height="36" rx="8" fill="${hot ? '#2a0d00' : '#0f1a14'}" stroke="#555" stroke-width="3"/>
   <text x="0" y="6" text-anchor="middle" font-size="28" font-weight="900" fill="${hot ? OR : '#7CFFB2'}" font-family="Poppins" letter-spacing="1">${disp}</text>
  </g>`;
}
const PL25 = [{ r: 128, c: 'url(#gPlate)', label: '20' }, { r: 104, c: '#2e3038' }];
const PL80 = [{ r: 140, c: 'url(#gPlateO)', label: '25' }, { r: 132, c: 'url(#gPlate)' }, { r: 108, c: '#2e3038' }, { r: 84, c: '#4a4e58' }];

/* ---- TAG 1 ---- */
SC.d1 = {
  setup() { D.P0 = wt('fünf') - .12; D.P1 = wt('ich') - .08; D.Sh = wt('gar') - .05; },
  dayAt(t) { return 1; },
  sfx() { return [{ t: 0, type: 'whoosh' }, { t: D.P0, type: 'pop' }, { t: D.P0 + .45, type: 'pour' }, { t: D.P1, type: 'whoosh', gain: .6 }, { t: D.Sh, type: 'crickets', dur: D.duration - D.Sh + .3 }]; },
  render(t) {
    const day = 1;
    const inProd = t >= D.P0 && t < D.P1;
    let w = '', fx = '';
    if (!inProd) {
      const after = t >= D.P1;
      const shrugK = after ? eBack(seg(t, D.Sh, D.Sh + .3)) : 0;
      const shakeA = after && t < D.Sh ? Math.sin(t * 40) * 14 : 0;
      const pose = after ? mixPose(POSE.holdR, { l: POSE.shrug.l, r: [30, -110] }, clamp(shrugK)) : POSE.holdR;
      const g = guyBase(day, {
        pose, emo: after ? (t > D.Sh ? 'doubt' : 'curious') : 'curious', look: after ? [.6 * shrugK, -.2] : [.5, .5], shrug: shrugK,
        talk: t < D.P0 || after ? talkAt(t) * .7 : 0, blink: blinkAt(t), tilt: shrugK * -6,
        hold: { r: 'shaker', fill: after ? .62 : .5, rot: shakeA },
      });
      w += gym(t, { bag: [170, 1300, .85, 1] });
      w += guy(g);
      if (t > D.Sh) {
        // Grillen-Moment
        w += popText(t, D.Sh + .1, 790, 690, '…', { size: 150, fill: '#fff' });
        w += `<text x="780" y="${f1(1240 - Math.abs(Math.sin(t * 9)) * 22)}" font-size="70" text-anchor="middle">🦗</text>`;
        w += popText(t, D.Sh + .2, 800, 1150, 'zirp', { size: 40, fill: '#9fe39f', sw: 8, rot: -10, wob: 6 });
      }
      const z = after ? 1.08 + .1 * seg(t, D.Sh, D.duration) : 1.04 + .03 * t;
      w = cam(w, { z: z + entry(t) * .14, fx: FX0, fy: after ? 900 : 960, r: after ? 0 : -1 + t });
      fx += speedLines(t, entry(t) * .8) + speedLines(t, after ? 1 - seg(t, D.P1, D.P1 + .25) : 0);
    } else {
      // Produkt groß: Shake wird gemacht
      const lt = t - D.P0, dur = D.P1 - D.P0;
      w += gym(t, { glowK: .9 });
      w += rays(t, 400, 900, .9);
      const ps = eBack(lt / .25);
      w += `<g transform="translate(360,960) scale(${f1(ps)}) rotate(${f1(-4 + lt * 4)})">${product(0, 0, 640, 'filter="url(#fShadow)"')}</g>`;
      // Messlöffel-Bogen
      const k = eIO(seg(lt, .12, dur * .75));
      const sx = lerp(360, 790, k), sy = lerp(700, 860, k) - Math.sin(k * Math.PI) * 260;
      w += shaker(800, 1240, 2.0, .5 + .2 * seg(lt, dur * .7, dur));
      w += `<g transform="translate(${f1(sx)},${f1(sy)}) rotate(${f1(-30 + k * 80)})"><ellipse cx="0" cy="0" rx="58" ry="30" fill="#f4f4f6" stroke="#bbb" stroke-width="4"/><ellipse cx="0" cy="-6" rx="46" ry="16" fill="#fff"/><rect x="40" y="-8" width="120" height="16" rx="8" fill="#e5e5e8"/></g>`;
      for (let i = 0; i < 26; i++) {
        const pk = seg(lt, dur * .55 + rnd(i) * .1, dur);
        if (pk <= 0 || pk >= 1) continue;
        w += `<circle cx="${f1(790 + (rnd(i * 3) - .5) * 70)}" cy="${f1(870 + pk * 300)}" r="${f1(4 + rnd(i) * 6)}" fill="#fff" opacity="${f1(1 - pk)}"/>`;
      }
      w += popText(t, D.P0 + .15, 760, 640, '5 g', { size: 120, fill: OR, rot: 8 });
      w = cam(w, { z: 1.05 + lt * .08, fx: 540, fy: 960 });
      fx += speedLines(t, 1 - seg(lt, 0, .3)) + flashRect(.6 * (1 - seg(lt, 0, .1)));
    }
    return { world: w, fx, hud: { day, bar: barOf(day), pop: 1 - seg(t, 0, .35) } };
  },
};

/* ---- TAG 20a: Waage ---- */
SC.d20a = {
  setup() { D.Wg = wt('waage') - .05; D.Zw = wt('zwei'); D.Bn = wt('bin') - .05; },
  dayAt(t) { return rattle(t, 1, 20); },
  sfx() { return [{ t: 0, type: 'whoosh' }, { t: D.Wg, type: 'zoom' }, { t: D.Zw, type: 'hit' }, { t: D.Bn, type: 'whoosh', gain: .7 }]; },
  render(t) {
    const day = 20;
    const rollK = seg(t, D.Wg + .1, D.Zw);
    const kg = t < D.Zw ? (70 + rollK * 2 + (rollK < 1 ? rnd(Math.floor(t * 30)) * .9 : 0)).toFixed(1).replace('.', ',') + ' KG' : '+2,0 KG';
    const hot = t >= D.Zw;
    const shocked = t >= D.Zw;
    const pose = shocked ? mixPose(POSE.stand, POSE.shock, eBack(seg(t, D.Zw, D.Zw + .25))) : POSE.stand;
    const g = guyBase(day, {
      y: FY0 - 44 * FS0, pose, emo: shocked ? 'shock' : 'curious', look: t < D.Bn ? [0, 1] : [0, 0],
      sweat: t > D.Bn ? 1 : 0, sweatY: ((t * 120) % 60), blink: shocked ? 0 : blinkAt(t), talk: shocked ? 0 : talkAt(t) * .6,
    });
    let w = gym(t, { bag: [170, 1300, .85] });
    w += scaleProp(FX0, FY0 + 12, FS0 * 1.1, kg, hot);
    w += guy(g);
    if (hot) {
      w += burst(t, D.Zw, FX0, FY0 - 4, OR, 18, 220);
    }
    // Kamera: Totale -> Waage (Zoom) -> Gesicht
    let c;
    const hd = headOf(g);
    if (t < D.Wg) c = { z: 1.02 + .03 * t, fx: 540, fy: 960 };
    else if (t < D.Bn) { const k = eIO(seg(t, D.Wg, D.Wg + .35)); c = { z: lerp(1.05, 2.9, k), fx: lerp(540, FX0, k), fy: lerp(960, FY0 - 10, k) }; }
    else { const k = eOut(seg(t, D.Bn, D.Bn + .25)); c = { z: lerp(2.9, 1.7, k) + .05 * (t - D.Bn), fx: lerp(FX0, hd[0], k), fy: lerp(FY0, hd[1] + 140, k) }; }
    const sh = shakeXY(t, D.Zw, .4, 26);
    c.z += entry(t) * .14; c.sx = sh[0]; c.sy = sh[1]; c.r = sh[2];
    w = cam(w, c);
    let fx = speedLines(t, entry(t) * .8) + speedLines(t, t > D.Bn ? 1 - seg(t, D.Bn, D.Bn + .3) : 0) + flashRect(hot ? .45 * (1 - seg(t, D.Zw, D.Zw + .15)) : 0, OR);
    if (hot) fx += popText(t, D.Zw, 495, 640, '+2 KG', { size: 150, fill: OR, rot: -4, until: D.Bn + .05 });
    if (t >= D.Bn) fx += popText(t, D.Bn + .05, 800, 700, '?!', { size: 170, fill: OR, rot: 14, wob: 4 });
    return { world: w, fx, hud: { day: this.dayAt(t), bar: barOf(this.dayAt(t)), pop: 1 - seg(t, .45, .8) } };
  },
};

/* ---- TAG 20b: Wasser im Muskel ---- */
SC.d20b = {
  setup() { D.Nn = wt('nein'); D.Ws = wt('wasser'); D.Im = wt('im'); D.Gn = wt('genau'); },
  dayAt() { return 20; },
  sfx() { return [{ t: 0, type: 'whoosh' }, { t: D.Nn + .05, type: 'stamp' }, { t: D.Ws, type: 'water', dur: 1.6 }, { t: D.Gn, type: 'ding' }]; },
  render(t) {
    let w = gym(t, { glowK: .35 });
    w += `<rect x="-100" y="-100" width="1300" height="2200" fill="#08090b" opacity=".55"/>`;
    // „FETT?“ durchgestrichen
    const fk = eBack(seg(t, 0, .2));
    const fOut = 1 - seg(t, D.Ws - .1, D.Ws + .15);
    if (fOut > 0) {
      w += `<g transform="translate(495,760) scale(${f1(fk * (0.8 + .2 * fOut))})" opacity="${f1(fOut)}"><text text-anchor="middle" y="60" font-size="200" font-weight="900" fill="#fff" stroke="#000" stroke-width="14" paint-order="stroke">FETT?</text></g>`;
      const xk = eOut(seg(t, D.Nn + .05, D.Nn + .22));
      w += `<g opacity="${f1(fOut)}"><path d="M200 640 L${f1(lerp(200, 790, xk))} ${f1(lerp(640, 880, xk))}" stroke="#FF3B55" stroke-width="34" stroke-linecap="round"/>
        <path d="M790 640 L${f1(lerp(790, 200, xk))} ${f1(lerp(640, 880, xk))}" stroke="#FF3B55" stroke-width="34" stroke-linecap="round"/></g>`;
    }
    // Muskel-Grafik füllt sich mit Wasser
    const mk = eBack(seg(t, D.Ws - .1, D.Ws + .25));
    if (mk > 0) {
      const lvl = eIO(seg(t, D.Ws + .1, D.Gn));
      const cx = 495, cy = 880, RX = 330, RY = 190;
      let m = `<g transform="translate(${cx},${cy}) scale(${(mk * .74).toFixed(3)}) rotate(-8)">`;
      m += `<path d="M${-RX - 110} 0 Q${-RX - 40} -40 ${-RX + 10} -60 Q0 ${-RY - 30} ${RX - 10} -60 Q${RX + 40} -40 ${RX + 110} 0 Q${RX + 40} 40 ${RX - 10} 60 Q0 ${RY + 30} ${-RX + 10} 60 Q${-RX - 40} 40 ${-RX - 110} 0 Z" fill="#B33A3A" stroke="#fff" stroke-width="8"/>`;
      m += `<clipPath id="mclip"><path d="M${-RX - 110} 0 Q${-RX - 40} -40 ${-RX + 10} -60 Q0 ${-RY - 30} ${RX - 10} -60 Q${RX + 40} -40 ${RX + 110} 0 Q${RX + 40} 40 ${RX - 10} 60 Q0 ${RY + 30} ${-RX + 10} 60 Q${-RX - 40} 40 ${-RX - 110} 0 Z"/></clipPath>`;
      m += `<g clip-path="url(#mclip)">`;
      for (let i = -6; i <= 6; i++) m += `<path d="M${-RX - 120} ${i * 30} Q0 ${i * 30 * 1.6} ${RX + 120} ${i * 30}" stroke="#E06060" stroke-width="7" fill="none" opacity=".7"/>`;
      const wy = lerp(RY + 40, -RY - 40, lvl);
      let wp = `M${-RX - 140} ${RY + 60} L${-RX - 140} ${f1(wy)}`;
      for (let x = -RX - 140; x <= RX + 140; x += 40) wp += ` L${x} ${f1(wy + Math.sin(x / 50 + t * 7) * 12)}`;
      wp += ` L${RX + 140} ${RY + 60} Z`;
      m += `<path d="${wp}" fill="url(#gWater)" opacity=".82"/>`;
      for (let i = 0; i < 16; i++) { const by = ((rnd(i) * 400 - t * 160) % 400 + 400) % 400 - 200; if (by > wy) m += `<circle cx="${f1((rnd(i * 3) - .5) * RX * 1.8)}" cy="${f1(by)}" r="${f1(5 + rnd(i) * 7)}" fill="#fff" opacity=".5"/>`; }
      m += `</g>`;
      m += `<path d="M${-RX - 110} 0 L${-RX - 210} 0 M${RX + 110} 0 L${RX + 210} 0" stroke="#F2E6D8" stroke-width="40" stroke-linecap="round"/>`;
      m += `</g>`;
      w += m;
      // Tropfen fliegen hinein
      for (let i = 0; i < 12; i++) {
        const dk = seg(t, D.Ws + i * .1, D.Ws + i * .1 + .55);
        if (dk <= 0 || dk >= 1) continue;
        const a = rnd(i) * Math.PI * 2;
        const x = cx + Math.cos(a) * 520 * (1 - eIn(dk)), y = cy + Math.sin(a) * 520 * (1 - eIn(dk));
        w += `<path d="M${f1(x)} ${f1(y - 26)} q-20 30 0 40 q20 -10 0 -40Z" fill="#7FD8FF" opacity="${f1(1 - dk * .5)}"/>`;
      }
      w += popText(t, D.Ws, 330, 610, 'WASSER', { size: 74, fill: '#7FD8FF', rot: -6 });
      w += popText(t, D.Im, 680, 1160, 'IM MUSKEL', { size: 74, fill: OR, rot: -4 });
    }
    if (t >= D.Gn) {
      const ck = eBack(seg(t, D.Gn, D.Gn + .3));
      w += `<g transform="translate(800,620) scale(${f1(ck)})"><circle r="88" fill="#2BD67B" stroke="#fff" stroke-width="8"/><path d="M-40 4 L-10 34 L44 -30" stroke="#fff" stroke-width="20" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
      w += burst(t, D.Gn, 800, 620, '#2BD67B', 16, 190);
    }
    w += dust(t, 20, '#7FD8FF', .4);
    w = cam(w, { z: 1 + .03 * t + entry(t) * .14, fx: 540, fy: 960, r: Math.sin(t * 1.4) * .8 });
    return { world: w, fx: speedLines(t, entry(t) * .8), hud: { day: 20, bar: barOf(20) } };
  },
};

/* ---- TAG 25: Bankdrücken ---- */
SC.d25 = {
  setup() { D.Mr = wt('mehr'); D.Zf = wt('zufall') - .12; },
  dayAt(t) { return rattle(t, 20, 25); },
  sfx() {
    const s = [{ t: 0, type: 'whoosh' }];
    for (let k = 1; k <= 3; k++) s.push({ t: D.Mr - (3 - k) * .95, type: k === 3 ? 'hit' : 'clank', gain: k === 3 ? .6 : .5 });
    s.push({ t: D.Zf, type: 'whoosh', gain: .7 }, { t: D.Zf + .1, type: 'boing' });
    return s;
  },
  render(t) {
    const day = 25, P = .95;
    let w = '', fx = '';
    if (t < D.Zf) {
      const ph = (t - D.Mr) / P;  // 0 = Lockout bei „mehr“
      const ext = t < D.Mr + .1 ? .5 + .5 * Math.cos(2 * Math.PI * ph) : 1;
      const reps = t < D.Mr ? 9 - Math.ceil((D.Mr - t) / P - 1e-6) : 9;
      w += gym(t, { glowK: .6, px: -t * 8 });
      w += `<g transform="translate(150,1300) scale(.8)">${product(0, -40, 150)}</g>`;
      const L = liftGuy({ x: 520, y: 1130, s: 1.0, m: muscleOf(day), ext, strain: (1 - ext) * .4 + (reps === 9 && t < D.Mr ? .3 : 0), plates: PL25, sweat: .7 });
      w += L.svg;
      // Wiederholungszähler
      const rp = 1 - seg(t % P + (t < D.Mr ? 0 : 0), 0, .2);
      const lastPop = t >= D.Mr ? eBack(seg(t, D.Mr, D.Mr + .25)) : 0;
      w += `<g transform="translate(790,640)"><rect x="-135" y="-120" width="270" height="250" rx="30" fill="#0c0c0e" fill-opacity=".8" stroke="${reps >= 9 ? OR : '#fff'}" stroke-opacity="${reps >= 9 ? 1 : .4}" stroke-width="6"/>
        <text y="-60" text-anchor="middle" font-size="38" font-weight="800" fill="#fff" opacity=".8">WDH</text>
        <text y="80" text-anchor="middle" font-size="${f1(150 * (1 + lastPop * .15 * (1 - seg(t, D.Mr + .25, D.Mr + .6))))}" font-weight="900" fill="${reps >= 9 ? OR : '#fff'}">${reps}</text>
        <text y="166" text-anchor="middle" font-size="28" font-weight="700" fill="#fff" opacity=".6">sonst: 8</text></g>`;
      if (t >= D.Mr) w += popText(t, D.Mr, 830, 500, '+1', { size: 120, fill: OR, rot: 10 }) + burst(t, D.Mr, 790, 660, OR, 18, 230);
      const sh = shakeXY(t, D.Mr, .3, 16);
      w = cam(w, { z: 1.0 + .05 * t + entry(t) * .14, fx: 560, fy: 960, sx: sh[0], sy: sh[1] });
      fx += speedLines(t, entry(t) * .8);
    } else {
      // Close-up: Augenbraue hoch
      const lt = t - D.Zf;
      w += gym(t, { glowK: .7 });
      const g = guyBase(day, { emo: 'raise', look: [.5, -.25], blink: 0, tilt: 5 + Math.sin(lt * 3) * 2, talk: talkAt(t) * .4 });
      w += guy(g);
      const hd = headOf(g);
      w = cam(w, { z: 1.85 + lt * .2 + (1 - eOut(lt / .2)) * .5, fx: hd[0] + 40, fy: hd[1] + 230 });
      fx += speedLines(t, 1 - seg(lt, 0, .3)) + popText(t, D.Zf + .12, 790, 640, '?', { size: 200, fill: OR, rot: 12, wob: 5 });
    }
    return { world: w, fx, hud: { day: this.dayAt(t), bar: barOf(this.dayAt(t)), pop: 1 - seg(t, .45, .8) } };
  },
};

/* ---- TAG 30: Speicher voll ---- */
SC.d30 = {
  setup() { D.Vl = wt('voll'); D.Ab = wt('ab'); },
  dayAt(t) { return rattle(t, 25, 30); },
  barAt(t) { return t < D.Vl ? lerp(25 / 30, .94, seg(t, .1, D.Vl)) : 1; },
  sfx() { return [{ t: 0, type: 'whoosh' }, { t: .35, type: 'charge', dur: D.Vl - .35 }, { t: D.Vl, type: 'hit' }, { t: D.Vl, type: 'ding' }, { t: D.Ab, type: 'punch' }]; },
  render(t) {
    const lv = this.barAt(t), full = t >= D.Vl;
    let w = gym(t, { glowK: full ? 1 : .5, bag: [170, 1300, .85] });
    if (full) w += rays(t, 495, 760, eOut(seg(t, D.Vl, D.Vl + .4)));
    // großer Speicher (Batterie-Optik)
    const bk = eBack(seg(t, 0, .35));
    const bx = 175, by = 590, bw = 640, bh = 200;
    let b = `<g transform="translate(495,${by + bh / 2}) scale(${f1(bk)}) translate(-495,${-(by + bh / 2)})">`;
    b += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="46" fill="#0c0c0e" stroke="#fff" stroke-width="10"/>`;
    b += `<rect x="${bx + bw + 6}" y="${by + 60}" width="34" height="90" rx="12" fill="#fff"/>`;
    const fw = (bw - 36) * lv;
    b += `<clipPath id="bclip"><rect x="${bx + 18}" y="${by + 18}" width="${f1(fw)}" height="${bh - 36}" rx="30"/></clipPath><g clip-path="url(#bclip)"><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="url(#gOr)"/>`;
    for (let i = -4; i < 20; i++) { const xx = bx + i * 60 + (t * 160 % 60); b += `<path d="M${f1(xx)} ${by + bh} l50 -${bh} h22 l-50 ${bh} Z" fill="#fff" opacity=".16"/>`; }
    b += `</g>`;
    b += `<text x="495" y="${by + bh / 2 + 34}" text-anchor="middle" font-size="96" font-weight="900" fill="#fff" stroke="#000" stroke-width="10" paint-order="stroke">${Math.round(lv * 100)} %</text>`;
    b += `</g>`;
    if (full) b += burst(t, D.Vl, 495, by + bh / 2, '#FFD23F', 26, 420);
    w += b;
    if (full) w += popText(t, D.Vl + .05, 495, 545, 'SPEICHER VOLL', { size: 74, fill: OR, rot: -3 });
    // Figur unten, entschlossen
    const fist = t >= D.Ab ? eBack(seg(t, D.Ab, D.Ab + .25)) : 0;
    const g = guyBase(30, { s: .46, y: 1350, x: 495, emo: full ? 'determined' : 'curious', pose: mixPose(POSE.stand, POSE.fist, fist), look: full ? [0, 0] : [0, -1], blink: blinkAt(t), talk: talkAt(t) * .6 });
    w += guy(g);
    for (let i = 0; i < 18; i++) { const sk = seg(t, D.Vl + rnd(i) * .2, D.Vl + .6 + rnd(i) * .4); if (sk > 0 && sk < 1) w += `<circle cx="${f1(495 + (rnd(i * 5) - .5) * 900 * sk)}" cy="${f1(745 + (rnd(i * 7) - .6) * 700 * sk)}" r="${f1(6 * (1 - sk) + 2)}" fill="#FFD23F"/>`; }
    const sh = shakeXY(t, D.Vl, .35, 22);
    w = cam(w, { z: 1.02 + .04 * t + entry(t) * .14 + (full ? .06 * (1 - eOut(seg(t, D.Vl, D.Vl + .3))) : 0), fx: 540, fy: 940, sx: sh[0], sy: sh[1] });
    const fx = speedLines(t, entry(t) * .8) + flashRect(full ? .75 * (1 - seg(t, D.Vl, D.Vl + .2)) : 0);
    return { world: w, fx, hud: { day: this.dayAt(t), bar: lv, barFlash: full ? 1 - seg(t, D.Vl, D.Vl + .5) : 0, pop: Math.max(1 - seg(t, .45, .8), full ? 1 - seg(t, D.Vl, D.Vl + .3) : 0) } };
  },
};

/* ---- TAG 50: Stillstand ---- */
SC.d50 = {
  setup() { D.St = wt('stillstand'); D.Au = wt('aufzuhören'); },
  dayAt(t) { return rattle(t, 30, 50, .04, .6); },
  sfx() { return [{ t: 0, type: 'whoosh', gain: .6 }, { t: 0, type: 'rain', dur: D.duration + .2 }, { t: D.St, type: 'low' }]; },
  render(t) {
    let w = gym(t, { rain: true, glowK: .15, bag: [170, 1300, .85] });
    // Bank hinter der Figur
    w += `<rect x="${FX0 - 300}" y="${FY0 - 205 * FS0 - 6}" width="600" height="40" rx="16" fill="#2b2e36"/><rect x="${FX0 - 250}" y="${FY0 - 170 * FS0}" width="24" height="${170 * FS0}" fill="#3a3e48"/><rect x="${FX0 + 226}" y="${FY0 - 170 * FS0}" width="24" height="${170 * FS0}" fill="#3a3e48"/>`;
    const g = guyBase(50, { sit: 1, post: 0, emo: 'sad', pose: POSE.knees, look: [-.2, 1], tilt: -4 + Math.sin(t * 1.2) * 1.5, blink: blinkAt(t, .8), talk: talkAt(t) * .45 });
    w += guy(g);
    // Fortschritts-Chart flach
    const ck = eOut(seg(t, D.St - .1, D.St + .5));
    if (ck > 0) {
      let p = `M0 120`; const pts = [[0, 120], [60, 80], [120, 60], [180, 40], [240, 38], [300, 40], [360, 39], [420, 40]];
      const n = Math.max(1, Math.floor(ck * (pts.length - 1)));
      for (let i = 1; i <= n; i++) p += ` L${pts[i][0]} ${pts[i][1]}`;
      w += `<g transform="translate(110,560) scale(.78)" opacity="${f1(ck)}"><rect x="-30" y="-60" width="480" height="230" rx="20" fill="#0c0c0e" fill-opacity=".75" stroke="#fff" stroke-opacity=".25" stroke-width="3"/>
        <text x="0" y="-18" font-size="30" font-weight="800" fill="#fff" opacity=".8">FORTSCHRITT</text>
        <path d="${p}" stroke="#bbb" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M200 150 L420 150" stroke="#fff" stroke-opacity=".2" stroke-width="3"/></g>`;
      w += popText(t, D.St + .3, 250, 790, '= 0', { size: 70, fill: '#aaa', rot: -4 });
    }
    // Gewitterwolke über dem Kopf
    if (t >= D.Au) {
      const hd = headOf(g), ck2 = eBack(seg(t, D.Au, D.Au + .3));
      w += `<g transform="translate(${hd[0]},${hd[1] - 200}) scale(${f1(ck2)})"><ellipse cx="0" cy="0" rx="110" ry="50" fill="#5d6270"/><ellipse cx="-60" cy="-20" rx="60" ry="46" fill="#5d6270"/><ellipse cx="50" cy="-30" rx="70" ry="56" fill="#5d6270"/>`;
      for (let i = 0; i < 8; i++) w += `<path d="M${-80 + i * 22} ${40 + ((t * 600 + i * 40) % 90)} l-4 18" stroke="#9fb7ff" stroke-width="5" stroke-linecap="round"/>`;
      w += `</g>`;
    }
    w += dust(t, 14, '#9fb7ff', .25);
    w = cam(w, { z: 1.08 + .06 * t + entry(t) * .1, fx: FX0 + 10, fy: 980 - 20 * t, r: -.6 });
    return { world: w, fx: speedLines(t, entry(t) * .5) + `<rect width="1080" height="1920" fill="#1a2440" opacity=".22"/>`, sat: .12, bright: .78, hud: { day: this.dayAt(t), bar: 1, pop: 1 - seg(t, .55, .9), col: '#8892a8' } };
  },
};

/* ---- TAG 60: Wendepunkt ---- */
SC.d60 = {
  setup() { D.Kp = wt('kapiert'); D.Kz = wt('kein'); D.Jd = wt('jedem'); D.Es = wt('es'); },
  dayAt(t) { return rattle(t, 50, 60, .04, .5); },
  sfx() { return [{ t: 0, type: 'whoosh', gain: .6 }, { t: D.Kp, type: 'ding' }, { t: D.Kp + .05, type: 'riser', dur: .6 }, { t: D.Kz + .25, type: 'stamp' }, { t: D.Jd, type: 'hit', gain: .8 }]; },
  render(t) {
    const col = smooth(seg(t, D.Kp, D.Kp + .6));
    const up = eIO(seg(t, D.Kp + .1, D.Kp + .6));
    const training = t >= D.Es;
    let w = gym(t, { rain: col < .5, glowK: .15 + .65 * col, bag: [170, 1300, .85] });
    w += `<g opacity="${f1(1 - up)}"><rect x="${FX0 - 300}" y="${FY0 - 205 * FS0 - 6}" width="600" height="40" rx="16" fill="#2b2e36"/></g>`;
    if (col > .1) w += rays(t, FX0, 860, col * .8);
    const curl = training ? (Math.sin((t - D.Es) * 7) * .5 + .5) : 0;
    let pose = mixPose(POSE.knees, POSE.stand, up);
    if (training) pose = { l: [8, lerp(10, 140, curl)], r: [8, lerp(10, 140, 1 - curl)] };
    const g = guyBase(60, {
      sit: 1 - up, post: lerp(.1, postureOf(60), up), emo: col > .5 ? (training ? 'determined' : 'relieved') : 'sad', pose,
      look: col > .5 ? [0, 0] : [0, -.6], blink: blinkAt(t, .5), talk: talkAt(t) * .6,
      hold: training ? { r: 'dumbbell', l: 'dumbbell' } : null,
    });
    w += guy(g);
    const hd = headOf(g);
    // Glühbirne
    if (t >= D.Kp && t < D.Es + .2) {
      const bk = eBack(seg(t, D.Kp, D.Kp + .25));
      const out = 1 - seg(t, D.Es - .1, D.Es + .2);
      w += `<g transform="translate(${hd[0] + 210},${hd[1] - 40}) scale(${f1(bk * out)})"><circle r="120" fill="url(#gGlowW)"/><circle cy="-10" r="58" fill="#FFE27A" stroke="#fff" stroke-width="6"/><rect x="-26" y="40" width="52" height="40" rx="8" fill="#9aa0aa"/></g>`;
      w += burst(t, D.Kp, hd[0] + 210, hd[1] - 50, '#FFE27A', 16, 180);
    }
    // „kein Zauber“: Zauberstab durchgestrichen
    if (t >= D.Kz && t < D.Es + .05) {
      const zk = eBack(seg(t, D.Kz, D.Kz + .25));
      const xk = eOut(seg(t, D.Kz + .25, D.Kz + .45));
      w += `<g transform="translate(790,690) scale(${f1(zk)}) rotate(-10)"><rect x="-150" y="-12" width="250" height="24" rx="12" fill="#222"/><rect x="70" y="-12" width="40" height="24" fill="#fff"/>
        <path d="M150 -50 l14 30 32 4 -24 22 6 32 -28 -16 -28 16 6 -32 -24 -22 32 -4 Z" fill="#FFD23F" transform="translate(-40 10)"/>
        <path d="M-170 -90 L${f1(-170 + 360 * xk)} ${f1(-90 + 180 * xk)}" stroke="#FF3B55" stroke-width="22" stroke-linecap="round"/></g>`;
    }
    if (training) {
      const ik = seg(t, D.Es, D.duration);
      const icons = ['🏋️', '💪', '🔥', '⏱️'];
      for (let i = 0; i < 4; i++) {
        const ti = D.Es + .15 + i * .3; const k = eBack(seg(t, ti, ti + .25));
        if (k <= 0) continue;
        const x = [210, 790, 230, 780][i], y = [620, 600, 1000, 980][i];
        w += `<g transform="translate(${x},${f1(y + Math.sin(t * 3 + i) * 10)}) scale(${f1(k)})"><circle r="78" fill="#0c0c0e" fill-opacity=".8" stroke="${OR}" stroke-width="5"/><text y="28" text-anchor="middle" font-size="78">${icons[i]}</text></g>`;
      }
    }
    const sh = shakeXY(t, D.Jd, .3, 14);
    w = cam(w, { z: 1.06 + .03 * t + entry(t) * .1 + (training ? .04 * Math.sin((t - D.Es) * 3.5) : 0), fx: FX0 + 10, fy: 960, sx: sh[0], sy: sh[1] });
    const fx = speedLines(t, entry(t) * .5) + speedLines(t, training ? .35 + .3 * (1 - seg(t, D.Jd, D.Jd + .4)) : 0, FX0, 900, OR2)
      + flashRect(t >= D.Kp ? .55 * (1 - seg(t, D.Kp, D.Kp + .18)) : 0) + `<rect width="1080" height="1920" fill="#1a2440" opacity="${f1(.22 * (1 - col))}"/>`;
    return { world: w, fx, sat: lerp(.12, 1.08, col), bright: lerp(.78, 1.04, col), hud: { day: this.dayAt(t), bar: 1, pop: 1 - seg(t, .45, .8), col: col > .5 ? OR : '#8892a8' } };
  },
};

/* ---- TAG 80: Bestwert ---- */
SC.d80 = {
  setup() { D.Ud = wt('und'); D.Nw = wt('neuer'); },
  dayAt(t) { return rattle(t, 60, 80); },
  sfx() { return [{ t: 0, type: 'whoosh' }, { t: D.Ud, type: 'tension', dur: D.Nw - D.Ud }, { t: wEnd('passiert') + .05, type: 'heart' }, { t: wEnd('passiert') + .4, type: 'heart' }, { t: D.Nw, type: 'hit', gain: 1.2 }, { t: D.Nw, type: 'confetti' }]; },
  render(t) {
    const pb = t >= D.Nw;
    const ext = pb ? 1 : lerp(.05, .8, eIO(seg(t, .3, D.Nw)));
    const trem = pb ? 0 : noise1(t * 30) * 8 * seg(t, D.Ud, D.Nw);
    let w = gym(t, { glowK: pb ? 1 : .5 });
    if (pb) w += rays(t, 520, 760, 1);
    w += `<g transform="translate(150,1300) scale(.8)">${product(0, -40, 150)}</g>`;
    const L = liftGuy({ x: 540, y: 1140, s: 1.0, m: muscleOf(80), ext, strain: pb ? .1 : .3 + .6 * seg(t, D.Ud, D.Nw), plates: PL80, tremble: trem, sweat: 1, mouth: pb ? 'grin' : null });
    w += L.svg;
    if (pb) {
      w += confetti(t, D.Nw, 520, 900, 160, 1.1);
      const bk = eBack(seg(t, D.Nw, D.Nw + .3));
      w += `<g transform="translate(495,600) scale(${f1(bk)}) rotate(-4)"><rect x="-370" y="-90" width="740" height="180" rx="36" fill="${OR}" filter="url(#fOrGlow)"/>
       <text y="-20" text-anchor="middle" font-size="52" font-weight="900" fill="#111">🏆 NEUER</text><text y="56" text-anchor="middle" font-size="84" font-weight="900" fill="#fff" stroke="#111" stroke-width="3">BESTWERT!</text></g>`;
    }
    // Kamera: langsamer Zoom auf die Hantel, dann Pull-back
    let c;
    if (!pb) { const k = eIO(seg(t, .2, D.Nw)); c = { z: lerp(1.0, 1.75, k), fx: lerp(540, L.hand[0] + 40, k), fy: lerp(960, L.hand[1] + 120, k) }; }
    else { const k = eOut(seg(t, D.Nw, D.Nw + .35)); c = { z: lerp(1.75, 1.04, k), fx: lerp(L.hand[0] + 40, 540, k), fy: lerp(L.hand[1] + 120, 940, k) }; }
    const sh = shakeXY(t, D.Nw, .6, 40);
    const sh2 = pb ? [0, 0, 0] : [noise1(t * 25) * 6 * seg(t, D.Ud, D.Nw), noise1(t * 25 + 7) * 6 * seg(t, D.Ud, D.Nw), 0];
    c.z += entry(t) * .14; c.sx = sh[0] + sh2[0]; c.sy = sh[1] + sh2[1]; c.r = sh[2];
    w = cam(w, c);
    const fx = speedLines(t, entry(t) * .8) + speedLines(t, pb ? 1 - seg(t, D.Nw, D.Nw + .5) : 0, 540, 900, '#FFD23F') + flashRect(pb ? .8 * (1 - seg(t, D.Nw, D.Nw + .18)) : 0)
      + (pb ? '' : `<rect width="1080" height="1920" fill="#000" opacity="${f1(.25 * seg(t, D.Ud, D.Nw))}"/>`);
    return { world: w, fx, hud: { day: this.dayAt(t), bar: 1, pop: Math.max(1 - seg(t, .45, .8), pb ? 1 - seg(t, D.Nw, D.Nw + .3) : 0) } };
  },
};

/* ---- TAG 100: Vorher/Nachher ---- */
SC.d100 = {
  setup() { D.Vh = wt('vorher'); D.Nh = wt('nachher'); },
  dayAt(t) { return rattle(t, 80, 100); },
  sfx() { return [{ t: 0, type: 'whoosh' }, { t: D.Vh, type: 'swipe', gain: .6 }, { t: D.Nh - .05, type: 'swipe' }, { t: D.Nh + .1, type: 'hit', gain: .7 }]; },
  render(t) {
    let sx;
    if (t < D.Vh) sx = lerp(540, 860, eOut(seg(t, .1, D.Vh)));
    else if (t < D.Nh - .05) sx = 860 + Math.sin((t - D.Vh) * 6) * 10;
    else sx = lerp(860, 150, eIO(seg(t, D.Nh - .05, D.Nh + .35)));
    if (t > D.Nh + .5) sx = lerp(150, 470, eIO(seg(t, D.Nh + .5, D.duration + .1)));
    const before = guyBase(1, { emo: 'doubt', pose: POSE.stand, look: [.2, .2], blink: blinkAt(t, .4) });
    const after = guyBase(100, { emo: 'proud', pose: POSE.flexR, chest: 1, blink: blinkAt(t, 1.7) });
    const bgL = gym(t, { glowK: .15, bag: [170, 1300, .85] }) + guy(before) + `<rect x="-200" y="-200" width="1500" height="2400" fill="#1a2440" opacity=".25"/>`;
    const bgR = gym(t, { glowK: 1, bag: [170, 1300, .85] }) + rays(t, FX0, 880, .8) + guy(after) + dust(t, 20, OR2, .5);
    const z = 1.02 + .03 * t + entry(t) * .14;
    let w = `<clipPath id="cL"><rect x="-10" y="0" width="${f1(sx + 10)}" height="1920"/></clipPath><clipPath id="cR"><rect x="${f1(sx)}" y="0" width="${f1(1090 - sx)}" height="1920"/></clipPath>`;
    w += `<g clip-path="url(#cR)">${cam(bgR, { z, fx: 540, fy: 960 })}</g>`;
    w += `<g clip-path="url(#cL)" style="filter:saturate(.35)">${cam(bgL, { z, fx: 540, fy: 960 })}</g>`;
    // Slider
    w += `<rect x="${f1(sx - 4)}" y="0" width="8" height="1920" fill="#fff"/><g transform="translate(${f1(sx)},980)"><circle r="54" fill="${OR}" stroke="#fff" stroke-width="8"/><path d="M-14 -18 L-32 0 L-14 18 M14 -18 L32 0 L14 18" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    w += `<g opacity="${f1(clamp((sx - 120) / 120))}">${pill(Math.min(sx - 130, 200), 1230, 210, 76, 'TAG 1', { bg: '#3a3e48', fg: '#fff', fs: 40 })}</g>`;
    w += `<g opacity="${f1(clamp((920 - sx) / 120))}">${pill(Math.max(sx + 140, 780), 1230, 250, 76, 'TAG 100', { bg: OR, fg: '#111', fs: 40 })}</g>`;
    if (t >= D.Nh) w += burst(t, D.Nh + .1, 640, 760, OR, 20, 300);
    return { world: w, fx: speedLines(t, entry(t) * .8), hud: { day: this.dayAt(t), bar: 1, pop: Math.max(1 - seg(t, .45, .8), t > D.Nh ? 1 - seg(t, D.Nh, D.Nh + .3) : 0) } };
  },
};

/* ---- Vertrauen: Studien ---- */
SC.trust = {
  setup() { D.Bs = wt('besten'); D.Ub = wt('überhaupt'); },
  dayAt() { return 100; },
  sfx() {
    const s = [{ t: 0, type: 'whoosh' }];
    for (let i = 0; i < 7; i++) s.push({ t: .15 + i * .26, type: 'paper' });
    s.push({ t: D.Ub, type: 'ding' });
    return s;
  },
  render(t) {
    let w = gym(t, { glowK: .4 });
    w += `<rect x="-100" y="-100" width="1300" height="2200" fill="#08090b" opacity=".5"/>`;
    // Studien-Blätter fliegen rein und stapeln sich
    for (let i = 0; i < 7; i++) {
      const ti = .12 + i * .26, k = eOut(seg(t, ti, ti + .32));
      if (k <= 0) continue;
      const tx = 495 + (i - 3) * 36 + Math.sin(i * 2.3) * 40, ty = 860 - i * 10;
      const x = lerp(i % 2 ? 1400 : -400, tx, k), y = lerp(500 + i * 80, ty, k), r = lerp(i % 2 ? 50 : -50, (i - 3) * 4, k);
      w += `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(r)})" filter="url(#fShadow)">
        <rect x="-190" y="-250" width="380" height="500" rx="18" fill="#F4F4F6"/>
        <rect x="-150" y="-205" width="210" height="26" rx="8" fill="${OR}"/>
        <text x="-150" y="-140" font-size="26" font-weight="900" fill="#222">STUDIE #${i + 1}</text>
        ${[0, 1, 2, 3, 4].map(j => `<rect x="-150" y="${-110 + j * 34}" width="${280 - rnd(i * 9 + j) * 90}" height="14" rx="7" fill="#ccc"/>`).join('')}
        <path d="M-150 170 L-80 110 L-20 140 L60 60 L150 20" stroke="${OR}" stroke-width="10" fill="none" stroke-linecap="round"/>
        <circle cx="120" cy="-180" r="38" fill="#2BD67B"/><path d="M102 -180 L116 -166 L140 -194" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round"/></g>`;
    }
    // Lupe wandert
    const lk = seg(t, .4, D.duration);
    const lx = lerp(260, 760, (Math.sin(lk * 5) + 1) / 2), ly = 760 + Math.cos(lk * 4) * 80;
    w += `<g transform="translate(${f1(lx)},${f1(ly)}) rotate(-30)"><circle r="96" fill="#fff" fill-opacity=".12" stroke="#fff" stroke-width="16"/><rect x="-14" y="96" width="28" height="150" rx="12" fill="${OR}"/></g>`;
    if (t >= D.Bs) {
      w += popText(t, D.Bs, 495, 500, 'BESTENS ERFORSCHT', { size: 64, fill: OR, rot: -3 });
    }
    if (t >= D.Ub) w += burst(t, D.Ub, 495, 860, OR, 24, 380);
    // Erlaubter Health-Claim (EU-zugelassen)
    const ck = eOut(seg(t, .5, .9));
    w += `<g transform="translate(495,${f1(1210 + (1 - ck) * 30)})" opacity="${f1(ck)}"><rect x="-420" y="-62" width="840" height="124" rx="20" fill="#0c0c0e" fill-opacity=".85" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>
      <text y="-18" text-anchor="middle" font-size="26" font-weight="600" fill="#fff">Kreatin erhöht die körperliche Leistung bei Schnellkrafttraining</text>
      <text y="16" text-anchor="middle" font-size="26" font-weight="600" fill="#fff">im Rahmen kurzzeitiger intensiver körperlicher Betätigung.*</text>
      <text y="46" text-anchor="middle" font-size="20" font-weight="600" fill="#fff" opacity=".6">*bei einer täglichen Aufnahme von 3 g Kreatin</text></g>`;
    w = cam(w, { z: 1 + .04 * t + entry(t) * .14, fx: 540, fy: 960, r: Math.sin(t * 2) * .6 });
    return { world: w, fx: speedLines(t, entry(t) * .8), hud: { day: 100, bar: 1 } };
  },
};

/* ---- Packshot ---- */
const DISCLAIMER = `<text x="495" y="1522" text-anchor="middle" font-size="22" font-weight="600" fill="#fff" opacity=".75">Werbung | Ergebnisse variieren. Nur mit Training &amp; ausgewogener Ernährung.</text>`;
SC.pack = {
  setup() { D.Pf = wt('profuel'); D.Cp = wt('creaproof'); D.Vg = wt('vegan'); D.Md = wt('made'); D.Fm = wt('fünf'); },
  dayAt() { return 100; },
  sfx() { return [{ t: 0, type: 'whoosh' }, { t: .02, type: 'hit', gain: .9 }, { t: .05, type: 'shimmer', dur: 2.5 }, { t: D.Cp, type: 'pop' }, { t: D.Vg, type: 'pop' }, { t: D.Md, type: 'pop' }, { t: D.Fm, type: 'pop' }, { t: D.Fm + .02, type: 'ding' }]; },
  render(t) {
    let w = `<rect x="-200" y="-200" width="1500" height="2400" fill="url(#gBg)"/>`;
    const pk = eBack(seg(t, 0, .4));
    w += rays(t, 495, 860, 1, OR, 16);
    w += `<ellipse cx="495" cy="860" rx="${f1(520 + Math.sin(t * 3) * 30)}" ry="${f1(560 + Math.sin(t * 3) * 30)}" fill="url(#gGlow)"/>`;
    w += dust(t, 40, OR2, .8, 7);
    // Sockel + Spiegelung
    w += `<ellipse cx="495" cy="1150" rx="300" ry="40" fill="#000" opacity=".6"/><ellipse cx="495" cy="1146" rx="300" ry="34" fill="${OR}" opacity=".25" filter="url(#fBlur8)"/>`;
    const ph = 640, fy = 800 + Math.sin(t * 2.2) * 10;
    w += `<g transform="translate(495,${f1(fy)}) scale(${(pk * (1 + .025 * t)).toFixed(3)})">${product(0, 0, ph, 'filter="url(#fOrGlow)"')}</g>`;
    // Badges
    const B = [
      { t: D.Cp, x: 250, y: 540, w: 330, txt: 'CREAPROOF®', bg: '#1F5FB8', fg: '#fff', rot: -6 },
      { t: D.Vg, x: 780, y: 660, w: 250, txt: '🌱 VEGAN', bg: '#2BD67B', fg: '#0b2a18', rot: 6 },
      { t: D.Md, x: 265, y: 1000, w: 390, txt: '🇩🇪 MADE IN GERMANY', bg: '#111', fg: '#fff', rot: -4, stroke: '#fff' },
      { t: D.Fm, x: 750, y: 1010, w: 340, txt: '146 PORTIONEN', bg: OR, fg: '#111', rot: 5 },
    ];
    for (const b of B) {
      if (t < b.t) continue;
      const k = eBack(seg(t, b.t, b.t + .25));
      w += burst(t, b.t, b.x, b.y, b.bg === '#111' ? '#fff' : b.bg, 12, 230);
      w += pill(b.x, b.y + Math.sin(t * 3 + b.x) * 6, b.w, 84, b.txt, { bg: b.bg, fg: b.fg, fs: b.w > 360 ? 32 : 38, rot: b.rot, k, stroke: b.stroke, swd: 4, filter: 'fShadow' });
    }
    if (t >= D.Fm) w += popText(t, D.Fm + .2, 770, 1100, '≈ 5 Monate*', { size: 40, fill: '#fff', sw: 8 });
    w = cam(w, { z: 1.0 + .012 * t + entry(t) * .14, fx: 495, fy: 900 });
    const fx = speedLines(t, entry(t) * .8) + flashRect(.7 * (1 - seg(t, 0, .15))) + DISCLAIMER
      + `<text x="495" y="1490" text-anchor="middle" font-size="21" font-weight="600" fill="#fff" opacity=".55">*bei 1 Portion täglich</text>`;
    return { world: w, fx, hud: { day: 100, bar: 1, hide: seg(t, 0, .2) }, subY: 1345 };
  },
};

/* ---- CTA ---- */
SC.cta = {
  setup() { D.A = wt('a', 0); D.B = wt('b', 0); D.Km = wt('kommentare'); D.Lk = wt('link'); },
  dayAt() { return 100; },
  sfx() { return [{ t: 0, type: 'whoosh' }, { t: D.A, type: 'pop' }, { t: D.B, type: 'pop' }, { t: D.Km, type: 'bubble' }, { t: D.Lk, type: 'ding' }, { t: D.Lk + .1, type: 'pop' }]; },
  render(t) {
    let w = gym(t, { glowK: .8 });
    w += `<rect x="-200" y="-200" width="1500" height="2400" fill="#08090b" opacity=".35"/>`;
    // Figur zeigt auf die Karten
    const cardsIn = t >= D.A - .05;
    const g = guyBase(100, { x: lerp(FX0, 760, eIO(seg(t, D.A - .3, D.A + .1))), s: lerp(FS0, .45, eIO(seg(t, D.A - .3, D.A + .1))), y: FY0 - 20, emo: 'happy', pose: cardsIn ? POSE.flexR : POSE.pointR, chest: 1, blink: blinkAt(t), talk: talkAt(t) * .8 });
    if (!cardsIn) w += guy(g);
    // Karten A / B
    const cards = [
      { t: D.A, y: 560, bg: OR, fg: '#111', l: 'A', txt: 'Ich bin dabei 💪' },
      { t: D.B, y: 765, bg: '#24272F', fg: '#fff', l: 'B', txt: 'Brauch ich nicht' },
    ];
    for (const c of cards) {
      if (t < c.t) continue;
      const k = eBack(seg(t, c.t, c.t + .3));
      const pulse = 1 + .025 * Math.sin(t * 6 + c.y);
      const x = lerp(1400, 495, k);
      w += `<g transform="translate(${f1(x)},${c.y}) scale(${f1(pulse)})" filter="url(#fShadow)"><rect x="-400" y="-88" width="800" height="176" rx="40" fill="${c.bg}" stroke="#fff" stroke-width="${c.l === 'A' ? 0 : 4}" stroke-opacity=".3"/>
        <circle cx="-300" cy="0" r="58" fill="${c.l === 'A' ? '#111' : OR}"/><text x="-300" y="24" text-anchor="middle" font-size="70" font-weight="900" fill="${c.l === 'A' ? OR : '#111'}">${c.l}</text>
        <text x="-210" y="20" font-size="56" font-weight="800" fill="${c.fg}">${c.txt}</text></g>`;
    }
    if (cardsIn) w += guy(g);
    // Kommentar-Icon
    if (t >= D.Km) {
      const k = eBack(seg(t, D.Km, D.Km + .3));
      w += `<g transform="translate(170,925) scale(${f1(k)}) rotate(${f1(Math.sin(t * 8) * 4)})"><path d="M-80 -60 h160 a30 30 0 0 1 30 30 v70 a30 30 0 0 1 -30 30 h-80 l-40 36 v-36 h-40 a30 30 0 0 1 -30 -30 v-70 a30 30 0 0 1 30 -30 z" fill="#fff"/>
        <circle cx="-40" cy="5" r="12" fill="#111"/><circle cx="0" cy="5" r="12" fill="#111"/><circle cx="40" cy="5" r="12" fill="#111"/></g>`;
    }
    // Warenkorb
    if (t >= D.Lk) {
      const k = eBack(seg(t, D.Lk, D.Lk + .3));
      const bob = Math.abs(Math.sin((t - D.Lk) * 7)) * 26;
      w += `<g transform="translate(290,1140) scale(${f1(k)})"><rect x="-210" y="-70" width="420" height="140" rx="70" fill="${OR}" filter="url(#fOrGlow)"/>
        <text x="40" y="20" text-anchor="middle" font-size="50" font-weight="900" fill="#111">🛒 LINK</text>
        ${product(-150, 0, 120)}</g>`;
      w += `<g transform="translate(180,${f1(1250 + bob)})"><path d="M0 -40 L0 40 M-30 12 L0 44 L30 12" stroke="#fff" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    }
    w = cam(w, { z: 1.0 + .03 * t + entry(t) * .14, fx: 540, fy: 960 });
    return { world: w, fx: speedLines(t, entry(t) * .8) + DISCLAIMER, hud: { day: 100, bar: 1, hide: 1 }, subY: 1360 };
  },
};

/* ---- Loop-Ende ---- */
SC.loop = {
  setup() { },
  dayAt() { return 100; },
  sfx() { return [{ t: 0, type: 'whoosh', gain: .8 }]; },
  render(t) {
    const th = t - D.duration;  // endet exakt bei th = 0 -> erster Frame des Videos
    const h = heroWorld(th);
    const e = 1 - eOut(t / .35);
    const fx = speedLines(t, e) + flashRect(.5 * e);
    return { world: `<g transform="translate(540,960) scale(${f1(1 + e * .25)}) translate(-540,-960)">${h.world}</g>`, fx, hud: Object.assign(h.hud, { hide: 1 - eOut(seg(t, 0, .25)) }) };
  },
};

/* ---------------- API für den Renderer ---------------- */
let SCN = null;
window.setup = function (data) {
  D = JSON.parse(JSON.stringify(data));
  if (data.product) PRODUCT = data.product;
  SCN = SC[D.kind || D.id];
  SCN.setup.call(SCN);
  CH = buildChunks(D.words || []);
  return true;
};
window.info = function () {
  // SFX-Liste + Tick-Sounds aus dem Tageszähler
  const sfx = SCN.sfx.call(SCN).filter(s => s.t != null && !isNaN(s.t));
  let last = SCN.dayAt.call(SCN, 0), lastT = -1;
  for (let t = 0; t < D.duration; t += 1 / 120) {
    const d = SCN.dayAt.call(SCN, t);
    if (d !== last) { if (t - lastT > .045) { sfx.push({ t, type: 'tick' }); lastT = t; } last = d; }
  }
  return { sfx, chunks: CH.length };
};
window.renderFrame = function (t) {
  UID = 0;
  const r = SCN.render.call(SCN, t);
  const world = document.getElementById('world');
  let flt = '';
  if (r.sat != null) flt += `saturate(${r.sat}) brightness(${r.bright ?? 1}) `;
  world.style.filter = flt || 'none';
  let wsvg = defs() + r.world;
  if (r.rgbSplit) {
    const d = r.rgbSplit;
    wsvg = defs() + `<filter id="rgb" x="0" y="0" width="100%" height="100%"><feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="r"/><feOffset in="r" dx="${f1(d)}" result="r2"/>
      <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0" result="gb"/><feOffset in="gb" dx="${f1(-d)}" result="gb2"/><feBlend in="r2" in2="gb2" mode="screen"/></filter>
      <g filter="url(#rgb)">${r.world}</g>`;
  }
  world.innerHTML = wsvg;
  document.getElementById('fx').innerHTML = defs() + (r.fx || '') + vignette(.9) + grain(t);
  const hd = Object.assign({}, r.hud || {});
  document.getElementById('hud').innerHTML = defs() + hud(t, hd);
  document.getElementById('subs').innerHTML = subtitles(t, D.words || [], CH, r.subY || 1425, D.duration);
  return true;
};
window.guides = on => document.body.classList.toggle('guides', !!on);
