/* LASTAR – For One Night · „Zwei Männer. Einer lügt.“  ·  Szenen-Engine (deterministisch über t) */
'use strict';
const W = 1080, H = 1920, CX = 495;
const GOLD = '#D4AF37', GOLD2 = '#F3D77A', GOLD3 = '#8C6A12';
const NAVY = '#0b1426', NAVY2 = '#14213d', INK = '#111';
const SKIN = '#E6AE88', SKIN_D = '#C58A64';
const SKIN_W = '#EFC1A0', SKIN_WD = '#D19A78';
const SUIT = '#131c33', SUIT_D = '#0b1222', SUIT_L = '#1f2b4a';
const HAIR_M = '#17110d', HAIR_W = '#21110c';

/* ---------- Utils ---------- */
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const smooth = k => { k = clamp(k); return k * k * (3 - 2 * k); };
const eOut = k => 1 - Math.pow(1 - clamp(k), 3);
const eIn = k => Math.pow(clamp(k), 3);
const eIO = k => { k = clamp(k); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const eBack = k => { k = clamp(k); const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const noise1 = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(rnd(i) * 2 - 1, rnd(i + 1) * 2 - 1, u); };
const f1 = v => Math.round(v * 10) / 10;
const DEG = Math.PI / 180;
let UID = 0; const uid = p => p + (UID++);
const norm = s => s.toLowerCase().replace(/[^0-9a-zäöüß]/g, '');

function defs() {
  return `<defs>
  <linearGradient id="gBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1022"/><stop offset=".6" stop-color="#060a16"/><stop offset="1" stop-color="#020308"/></linearGradient>
  <radialGradient id="gGold"><stop offset="0" stop-color="${GOLD2}" stop-opacity=".75"/><stop offset=".4" stop-color="${GOLD}" stop-opacity=".25"/><stop offset="1" stop-color="${GOLD}" stop-opacity="0"/></radialGradient>
  <radialGradient id="gWarm"><stop offset="0" stop-color="#FFC877" stop-opacity=".8"/><stop offset=".5" stop-color="#E08A2E" stop-opacity=".18"/><stop offset="1" stop-color="#E08A2E" stop-opacity="0"/></radialGradient>
  <radialGradient id="gCold"><stop offset="0" stop-color="#8FB4FF" stop-opacity=".45"/><stop offset="1" stop-color="#8FB4FF" stop-opacity="0"/></radialGradient>
  <radialGradient id="gVig" cx=".5" cy=".46" r=".72"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".88"/></radialGradient>
  <linearGradient id="gSuit" x1="0" x2="1"><stop offset="0" stop-color="${SUIT_D}"/><stop offset=".45" stop-color="${SUIT_L}"/><stop offset="1" stop-color="${SUIT_D}"/></linearGradient>
  <linearGradient id="gGoldT" x1="0" x2="1"><stop offset="0" stop-color="#B8912A"/><stop offset=".5" stop-color="${GOLD2}"/><stop offset="1" stop-color="#A7801F"/></linearGradient>
  <linearGradient id="gDoor" x1="0" x2="1"><stop offset="0" stop-color="#1a1210"/><stop offset=".5" stop-color="#2a1d17"/><stop offset="1" stop-color="#140d0b"/></linearGradient>
  <filter id="fBlur6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="fBlur14" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="fBlur30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
  <filter id="fGlowG" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="0" stdDeviation="14" flood-color="${GOLD}" flood-opacity=".9"/></filter>
  <filter id="fShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#000" flood-opacity=".7"/></filter>
 </defs>`;
}

/* ---------- Gesichter ---------- */
const EMO = {
  neutral: { bl: [0, 0], br: [0, 0], lid: .16, eye: 1, mouth: 'flat' },
  calm: { bl: [-4, -2], br: [-4, -2], lid: .22, eye: 1, mouth: 'smile0' },
  smile: { bl: [-6, -4], br: [-6, -4], lid: .2, eye: 1, mouth: 'smile', happy: .15 },
  smirk: { bl: [-2, 2], br: [-12, -8], lid: .28, eye: 1, mouth: 'smirk' },
  cold: { bl: [-4, 12], br: [-4, 12], lid: .38, eye: .96, mouth: 'flat', pupil: .8 },
  suspicious: { bl: [-2, 14], br: [-16, -10], lid: .34, eye: 1, mouth: 'skew' },
  worried: { bl: [10, -14], br: [10, -14], lid: .12, eye: 1.05, mouth: 'smallO' },
  shock: { bl: [-30, -26], br: [-30, -26], lid: 0, eye: 1.16, pupil: .7, mouth: 'O' },
  laugh: { bl: [-14, -10], br: [-14, -10], lid: 0, eye: 1, mouth: 'open', happy: .5 },
  dreamy: { bl: [-10, -16], br: [-10, -16], lid: .45, eye: 1, mouth: 'smile', happy: .1 },
  warm: { bl: [-8, -10], br: [-8, -10], lid: .25, eye: 1, mouth: 'smile', happy: .25 },
  sniff: { bl: [-6, -12], br: [-6, -12], lid: .7, eye: 1, mouth: 'smallO' },
};
function face(o, hy, isW) {
  const E0 = EMO[o.emo || 'neutral'], E1 = EMO[o.emo2 || o.emo || 'neutral'], k = o.emoK || 0;
  const L = (a, b) => lerp(a || 0, b || 0, k);
  const E = { bl: [L(E0.bl[0], E1.bl[0]), L(E0.bl[1], E1.bl[1])], br: [L(E0.br[0], E1.br[0]), L(E0.br[1], E1.br[1])], lid: L(E0.lid, E1.lid), eye: L(E0.eye, E1.eye), pupil: L(E0.pupil || 1, E1.pupil || 1), happy: L(E0.happy, E1.happy), mouth: k < .5 ? E0.mouth : E1.mouth };
  const skin = isW ? SKIN_W : SKIN, skinD = isW ? SKIN_WD : SKIN_D, hair = isW ? HAIR_W : HAIR_M;
  const id = uid('e');
  const look = o.look || [0, 0];
  const blink = clamp(o.blink || 0);
  let s = '';
  for (const sd of [-1, 1]) {
    const ex = sd * 46, ey = hy + 4, rx = 33 * E.eye, ry = (isW ? 38 : 36) * E.eye;
    const cid = id + (sd > 0 ? 'r' : 'l');
    s += `<clipPath id="${cid}"><ellipse cx="${ex}" cy="${ey}" rx="${f1(rx)}" ry="${f1(ry)}"/></clipPath>`;
    s += `<ellipse cx="${ex}" cy="${ey}" rx="${f1(rx)}" ry="${f1(ry)}" fill="#F4F1EA"/>`;
    s += `<g clip-path="url(#${cid})">`;
    const ir = 21 * E.pupil, px = ex + look[0] * 12, py = ey + look[1] * 12 + 2;
    s += `<circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(ir)}" fill="${isW ? '#3E6A4C' : '#3B2A1C'}"/><circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(ir * .5)}" fill="#070707"/>`;
    s += `<circle cx="${f1(px + 7)}" cy="${f1(py - 8)}" r="${f1(5.5 * E.pupil + 1)}" fill="#fff"/>`;
    if (o.eyeGlint) s += `<circle cx="${f1(px - 6)}" cy="${f1(py + 6)}" r="3" fill="${GOLD2}" opacity="${o.eyeGlint}"/>`;
    const lid = Math.max(E.lid, blink), lidY = ey - ry + 2 * ry * lid;
    s += `<rect x="${f1(ex - rx - 2)}" y="${f1(ey - ry - 4)}" width="${f1(rx * 2 + 4)}" height="${f1(lidY - (ey - ry - 4))}" fill="${skin}"/>`;
    s += `<path d="M${f1(ex - rx)} ${f1(lidY)} Q${ex} ${f1(lidY - 6)} ${f1(ex + rx)} ${f1(lidY)}" stroke="${hair}" stroke-width="${isW ? 6 : 4}" fill="none" opacity=".85"/>`;
    if (E.happy > .02 && blink < .5) s += `<ellipse cx="${ex}" cy="${f1(ey + ry * 1.3)}" rx="${f1(rx * 1.3)}" ry="${f1(ry * (0.6 + E.happy))}" fill="${skin}"/>`;
    s += `</g>`;
    if (isW) s += `<path d="M${f1(ex + sd * rx * .55)} ${f1(lidY - 2)} l${sd * 14} -10 M${f1(ex + sd * rx * .85)} ${f1(lidY + 6)} l${sd * 14} -6" stroke="${hair}" stroke-width="4" stroke-linecap="round"/>`;
    const b = sd < 0 ? E.bl : E.br, by0 = hy - 52;
    s += `<path d="M${sd * 84} ${f1(by0 + b[0])} Q${sd * 52} ${f1(by0 - 12 + (b[0] + b[1]) / 2)} ${sd * 18} ${f1(by0 + b[1])}" stroke="${hair}" stroke-width="${isW ? 9 : 14}" fill="none" stroke-linecap="round"/>`;
  }
  s += `<path d="M-4 ${hy + 30} Q4 ${hy + 46} 13 ${hy + 41}" stroke="${skinD}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  const my = hy + 78, talk = o.talk || 0;
  let mouth = E.mouth;
  if (talk > .05 && ['flat', 'smile0', 'smile', 'smirk', 'skew', 'smallO'].includes(mouth)) mouth = 'talk';
  const lip = isW ? '#A8455A' : '#5a2a22';
  const M = {
    flat: `<path d="M-26 ${my} Q0 ${my + 4} 26 ${my}" stroke="${lip}" stroke-width="${isW ? 9 : 7}" fill="none" stroke-linecap="round"/>`,
    smile0: `<path d="M-28 ${my - 2} Q0 ${my + 12} 28 ${my - 2}" stroke="${lip}" stroke-width="${isW ? 9 : 7}" fill="none" stroke-linecap="round"/>`,
    smile: `<path d="M-34 ${my - 6} Q0 ${my + 20} 34 ${my - 6}" stroke="${lip}" stroke-width="${isW ? 10 : 7}" fill="none" stroke-linecap="round"/>`,
    smirk: `<path d="M-24 ${my + 2} Q8 ${my + 10} 32 ${my - 10}" stroke="${lip}" stroke-width="${isW ? 9 : 7}" fill="none" stroke-linecap="round"/>`,
    skew: `<path d="M-26 ${my + 6} Q0 ${my + 2} 28 ${my - 4}" stroke="${lip}" stroke-width="7" fill="none" stroke-linecap="round"/>`,
    smallO: `<ellipse cx="0" cy="${my + 6}" rx="11" ry="13" fill="#3b1414"/>${isW ? `<ellipse cx="0" cy="${my + 6}" rx="14" ry="16" fill="none" stroke="${lip}" stroke-width="5"/>` : ''}`,
    O: `<ellipse cx="0" cy="${my + 10}" rx="18" ry="26" fill="#3b1414"/>`,
    open: `<path d="M-38 ${my - 8} Q0 ${my} 38 ${my - 8} Q34 ${my + 40} 0 ${my + 44} Q-34 ${my + 40} -38 ${my - 8} Z" fill="#3b1414"/><path d="M-34 ${my - 6} Q0 ${my + 2} 34 ${my - 6} L30 ${my + 6} Q0 ${my + 12} -30 ${my + 6} Z" fill="#fff"/>${isW ? `<path d="M-38 ${my - 8} Q0 ${my} 38 ${my - 8}" stroke="${lip}" stroke-width="6" fill="none"/>` : ''}`,
    talk: `<ellipse cx="0" cy="${my + 4}" rx="${f1(22 + 3 * talk)}" ry="${f1(4 + 15 * talk)}" fill="#3b1414"/>${isW ? `<ellipse cx="0" cy="${my + 4}" rx="${f1(25 + 3 * talk)}" ry="${f1(7 + 15 * talk)}" fill="none" stroke="${lip}" stroke-width="6"/>` : ''}`,
  };
  s += M[mouth];
  return s;
}

/* ---------- Hand (mit optionalem Ring) ---------- */
function hand(x, y, rot, s, o = {}) {
  const sk = o.w ? SKIN_W : SKIN, skd = o.w ? SKIN_WD : SKIN_D;
  let g = `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(rot)}) scale(${s})">`;
  const fl = [44, 52, 50, 40];
  [-24, -8, 8, 24].forEach((fx, i) => {
    g += `<rect x="${fx - 8}" y="${-28 - fl[i]}" width="16" height="${fl[i] + 10}" rx="8" fill="${sk}"/>`;
  });
  g += `<ellipse cx="0" cy="0" rx="34" ry="36" fill="${sk}"/>`;
  g += `<rect x="24" y="-18" width="16" height="44" rx="8" fill="${sk}" transform="rotate(40 30 0)"/>`;
  g += `<path d="M-20 -26 L20 -26" stroke="${skd}" stroke-width="3" opacity=".4"/>`;
  if (o.ring) {
    g += `<rect x="-1" y="-44" width="18" height="8" rx="3" fill="url(#gGoldT)" stroke="#6b5010" stroke-width="1"/>`;
    if (o.glint) g += `<path d="M14 -48 l2 -7 2 7 7 2 -7 2 -2 7 -2 -7 -7 -2 Z" fill="#fff" opacity="${f1(o.glint)}"/>`;
  }
  return g + `</g>`;
}

/* ---------- Mann (Brustbild) ---------- */
function man(o) {
  const hy = -640;
  let s = '';
  // Jackett
  s += `<path d="M-268 0 L-258 -330 Q-252 -428 -172 -452 L-62 -478 L0 -350 L62 -478 L172 -452 Q252 -428 258 -330 L268 0 Z" fill="url(#gSuit)"/>`;
  s += `<path d="M-58 -476 L0 -170 L58 -476 L36 -488 L0 -462 L-36 -488 Z" fill="#E8EBF2"/>`;
  // Krawatte
  s += `<path d="M-17 -458 L17 -458 L12 -428 L-12 -428 Z" fill="#0a0a0d"/><path d="M-12 -428 L12 -428 L24 -220 L0 -190 L-24 -220 Z" fill="#0a0a0d"/>`;
  s += `<rect x="-26" y="-342" width="52" height="7" rx="3" fill="url(#gGoldT)"/>`;
  // Revers
  s += `<path d="M-62 -478 L-128 -446 L-80 -270 L0 -150 L-22 -330 Z" fill="${SUIT_D}"/><path d="M62 -478 L128 -446 L80 -270 L0 -150 L22 -330 Z" fill="${SUIT_D}"/>`;
  s += `<path d="M-128 -446 L-80 -270 L0 -150 M128 -446 L80 -270 L0 -150" stroke="#2c3a60" stroke-width="3" fill="none"/>`;
  // Einstecktuch gold
  s += `<path d="M138 -322 L196 -322 L188 -300 L146 -300 Z" fill="${SUIT_D}"/><path d="M146 -322 L160 -346 L172 -324 L184 -344 L192 -322 Z" fill="url(#gGoldT)"/>`;
  s += `<circle cx="0" cy="-118" r="9" fill="#0a0f1c"/><circle cx="0" cy="-58" r="9" fill="#0a0f1c"/>`;
  // Hals + Kopf
  s += `<rect x="-46" y="${hy + 100}" width="92" height="86" fill="${SKIN}"/><path d="M-46 ${hy + 132} Q0 ${hy + 156} 46 ${hy + 132}" stroke="${SKIN_D}" stroke-width="12" fill="none" opacity=".5"/>`;
  s += `<g transform="rotate(${f1(o.tilt || 0)} 0 ${hy + 120})">`;
  s += `<ellipse cx="-114" cy="${hy + 12}" rx="20" ry="30" fill="${SKIN}"/><ellipse cx="114" cy="${hy + 12}" rx="20" ry="30" fill="${SKIN}"/>`;
  s += `<path d="M-114 ${hy - 20} Q-118 ${hy + 86} -62 ${hy + 116} Q0 ${hy + 142} 62 ${hy + 116} Q118 ${hy + 86} 114 ${hy - 20} Q110 ${hy - 132} 0 ${hy - 134} Q-110 ${hy - 132} -114 ${hy - 20} Z" fill="${SKIN}"/>`;
  // Kiefer-Schatten
  s += `<path d="M-90 ${hy + 70} Q0 ${hy + 150} 90 ${hy + 70}" stroke="${SKIN_D}" stroke-width="10" fill="none" opacity=".25"/>`;
  // Haare: zurückgegelt, Seitenscheitel
  s += `<path d="M-120 ${hy - 6} C-132 ${hy - 120} -60 ${hy - 178} 20 ${hy - 172} C96 ${hy - 170} 136 ${hy - 110} 120 ${hy - 6} C114 ${hy - 60} 100 ${hy - 86} 70 ${hy - 96} C20 ${hy - 104} -30 ${hy - 110} -64 ${hy - 92} C-96 ${hy - 76} -112 ${hy - 50} -120 ${hy - 6} Z" fill="${HAIR_M}"/>`;
  s += `<path d="M-50 ${hy - 150} C0 ${hy - 172} 60 ${hy - 168} 98 ${hy - 132} M-30 ${hy - 120} C20 ${hy - 140} 70 ${hy - 132} 104 ${hy - 100}" stroke="#3a2a20" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/>`;
  s += `<path d="M-40 ${hy - 160} L-56 ${hy - 104}" stroke="#05040a" stroke-width="5" opacity=".6"/>`;
  s += face(o, hy, false);
  s += `</g>`;
  // linke Hand (Bildseite rechts)
  if (o.hand) {
    const P = {
      tie: { from: [250, 20], to: [40, -380], hand: [22, -410], rot: -58 },
      collar: { from: [270, 20], to: [120, -430], hand: [92, -470], rot: -30 },
      wave: { from: [262, 10], to: [262, -420], hand: [262, -470], rot: 8 },
      chest: { from: [262, 30], to: [120, -250], hand: [96, -280], rot: -50 },
    }[o.hand];
    s += `<path d="M${P.from[0]} ${P.from[1]} L${P.to[0]} ${P.to[1]}" stroke="url(#gSuit)" stroke-width="84" stroke-linecap="round"/>`;
    s += `<path d="M${P.to[0]} ${P.to[1]} L${P.to[0] + (P.hand[0] - P.to[0]) * .25} ${P.to[1] + (P.hand[1] - P.to[1]) * .25}" stroke="#E8EBF2" stroke-width="56" stroke-linecap="round"/>`;
    s += hand(P.hand[0], P.hand[1], P.rot, 1, { ring: o.ring, glint: o.glint });
  }
  return `<g transform="translate(${f1(o.x)},${f1(o.y)}) scale(${o.s ?? 1})">${s}</g>`;
}

/* ---------- Frau (Brustbild) ---------- */
function woman(o) {
  const hy = -640;
  let s = '';
  // Haare hinten
  s += `<path d="M-150 ${hy - 40} C-200 ${hy + 120} -230 ${hy + 300} -200 ${hy + 420} L200 ${hy + 420} C230 ${hy + 300} 200 ${hy + 120} 150 ${hy - 40} Z" fill="${HAIR_W}"/>`;
  // Oberteil (hochgeschlossen, schwarz) + Kette
  s += `<path d="M-238 0 L-228 -320 Q-222 -420 -150 -446 L-58 -470 Q0 -440 58 -470 L150 -446 Q222 -420 228 -320 L238 0 Z" fill="#0d0c12"/>`;
  s += `<path d="M-58 -470 Q0 -430 58 -470" stroke="#26232e" stroke-width="10" fill="none"/>`;
  s += `<rect x="-38" y="${hy + 100}" width="76" height="80" fill="${SKIN_W}"/>`;
  s += `<path d="M-40 -462 Q0 -380 40 -462" stroke="url(#gGoldT)" stroke-width="4" fill="none"/><path d="M0 -412 l9 14 -9 14 -9 -14 Z" fill="${GOLD2}"/>`;
  s += `<g transform="rotate(${f1(o.tilt || 0)} 0 ${hy + 120})">`;
  s += `<path d="M-108 ${hy - 20} Q-112 ${hy + 80} -58 ${hy + 112} Q0 ${hy + 136} 58 ${hy + 112} Q112 ${hy + 80} 108 ${hy - 20} Q104 ${hy - 128} 0 ${hy - 130} Q-104 ${hy - 128} -108 ${hy - 20} Z" fill="${SKIN_W}"/>`;
  // Ohrringe
  s += `<circle cx="-108" cy="${hy + 40}" r="7" fill="${GOLD2}"/><path d="M-108 ${hy + 46} l-7 20 7 8 7 -8 Z" fill="${GOLD}"/><circle cx="108" cy="${hy + 40}" r="7" fill="${GOLD2}"/><path d="M108 ${hy + 46} l-7 20 7 8 7 -8 Z" fill="${GOLD}"/>`;
  // Pony / Haare vorne
  s += `<path d="M-118 ${hy + 20} C-136 ${hy - 120} -40 ${hy - 186} 40 ${hy - 160} C110 ${hy - 140} 140 ${hy - 70} 116 ${hy + 40} C104 ${hy - 40} 76 ${hy - 86} 20 ${hy - 96} C-30 ${hy - 70} -84 ${hy - 70} -118 ${hy + 20} Z" fill="${HAIR_W}"/>`;
  s += `<path d="M-30 ${hy - 150} C30 ${hy - 160} 90 ${hy - 120} 110 ${hy - 40}" stroke="#4a2a1c" stroke-width="6" fill="none" opacity=".8"/>`;
  s += `<ellipse cx="-74" cy="${hy + 52}" rx="20" ry="11" fill="#E77A84" opacity=".3"/><ellipse cx="74" cy="${hy + 52}" rx="20" ry="11" fill="#E77A84" opacity=".3"/>`;
  s += face(o, hy, true);
  s += `</g>`;
  return `<g transform="translate(${f1(o.x)},${f1(o.y)}) scale(${o.s ?? 1})">${s}</g>`;
}

/* ---------- Goldener Rauch (Markenzeichen) ---------- */
function smoke(t, x0, y0, len, o = {}) {
  const k = o.k ?? 1, amp = o.amp ?? 70, seed = o.seed || 0, wd = o.w || 1, op = o.op ?? 1;
  if (k <= .01 || op <= .01) return '';
  const N = 46, pts = [];
  for (let i = 0; i < N; i++) {
    const s = i / (N - 1) * k;
    const x = x0 + amp * (s * .3 + s * s) * (Math.sin(s * 5.2 + t * 1.5 + seed) * .62 + Math.sin(s * 11.3 - t * 2.1 + seed * 2.1) * .38) + (o.dx || 0) * s;
    pts.push([x, y0 - s * len]);
  }
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 1; i < N - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q${f1(pts[i][0])} ${f1(pts[i][1])} ${f1(mx)} ${f1(my)}`;
  }
  const gid = uid('sg');
  let g = `<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${f1(y0 - len * k)}"><stop offset="0" stop-color="${GOLD2}" stop-opacity="${.95 * op}"/><stop offset=".6" stop-color="${GOLD}" stop-opacity="${.6 * op}"/><stop offset="1" stop-color="${GOLD}" stop-opacity="0"/></linearGradient>`;
  g += `<path d="${d}" stroke="${GOLD}" stroke-width="${f1(26 * wd)}" fill="none" stroke-linecap="round" opacity="${f1(.22 * op)}" filter="url(#fBlur6)"/>`;
  g += `<path d="${d}" stroke="url(#${gid})" stroke-width="${f1(6 * wd)}" fill="none" stroke-linecap="round"/>`;
  g += `<path d="${d}" stroke="#FFF6D6" stroke-width="${f1(1.6 * wd)}" fill="none" stroke-linecap="round" opacity="${f1(.7 * op)}"/>`;
  // Glitzerpartikel entlang des Fadens
  const M = o.sparks ?? 16;
  for (let i = 0; i < M; i++) {
    const sp = ((rnd(i + seed * 7) + t * (.12 + rnd(i * 3) * .1)) % 1);
    const idx = Math.min(N - 1, Math.floor(sp * (N - 1)));
    if (sp > k) continue;
    const p = pts[idx];
    const jx = (rnd(i * 5 + seed) - .5) * 40 * wd, jy = (rnd(i * 9) - .5) * 30;
    const tw = Math.abs(Math.sin(t * 5 + i * 1.7));
    const r = (3 + 6 * tw) * wd;
    const fade = op * (1 - sp * .7);
    g += `<path d="M${f1(p[0] + jx)} ${f1(p[1] + jy - r)} L${f1(p[0] + jx + r * .25)} ${f1(p[1] + jy - r * .25)} L${f1(p[0] + jx + r)} ${f1(p[1] + jy)} L${f1(p[0] + jx + r * .25)} ${f1(p[1] + jy + r * .25)} L${f1(p[0] + jx)} ${f1(p[1] + jy + r)} L${f1(p[0] + jx - r * .25)} ${f1(p[1] + jy + r * .25)} L${f1(p[0] + jx - r)} ${f1(p[1] + jy)} L${f1(p[0] + jx - r * .25)} ${f1(p[1] + jy - r * .25)} Z" fill="#FFF3C4" opacity="${f1(fade * (.4 + .6 * tw))}"/>`;
  }
  return g;
}
function smokeCloud(t, k, cx = CX, cy = 960) {
  if (k <= .01) return '';
  let s = '';
  for (let i = 0; i < 9; i++) {
    const a = i / 9 * Math.PI * 2 + t * .2;
    const r = 120 + 520 * k * (.5 + .5 * rnd(i));
    s += `<circle cx="${f1(cx + Math.cos(a) * r * .6)}" cy="${f1(cy + Math.sin(a) * r * .8)}" r="${f1(220 + 260 * k)}" fill="url(#gGold)" opacity="${f1(.35 * k)}"/>`;
  }
  for (let i = 0; i < 7; i++) s += smoke(t, cx - 360 + i * 120, cy + 700, 1500 * k, { amp: 160, seed: i * 3.3, w: 1.4, k: 1, op: k, sparks: 12 });
  return s;
}
function sparkleField(t, n, op, seed = 1, area = [60, 200, 900, 1300]) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const k = i + seed * 50;
    const x = area[0] + rnd(k) * area[2], y = area[1] + ((rnd(k * 3) * area[3] - t * (20 + 40 * rnd(k * 5))) % area[3] + area[3]) % area[3];
    const tw = Math.abs(Math.sin(t * 3 + k));
    s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(1.5 + 3 * tw)}" fill="${GOLD2}" opacity="${f1(op * tw)}"/>`;
  }
  return s;
}

/* ---------- Umgebungen ---------- */
function flick(t, seed = 0, amt = 1) {
  const n = noise1(t * 9 + seed * 13);
  const dip = (rnd(Math.floor(t * 12) + seed * 31) > .93) ? .45 : 0;
  return clamp(1 - amt * (Math.max(0, -n) * .25 + dip));
}
function hallway(t, o = {}) {
  const lamp = o.lamp ?? flick(t, 1, .8);
  let s = `<rect x="-300" y="-300" width="1680" height="2520" fill="#0a1020"/>`;
  s += `<rect x="-300" y="300" width="1680" height="1100" fill="#111a30"/>`;
  for (let x = -280; x < 1380; x += 64) s += `<rect x="${x}" y="300" width="3" height="1100" fill="${GOLD}" opacity=".06"/>`;
  s += `<rect x="-300" y="1150" width="1680" height="250" fill="#0c1324"/><rect x="-300" y="1150" width="1680" height="8" fill="${GOLD}" opacity=".25"/>`;
  s += `<rect x="-300" y="1400" width="1680" height="900" fill="#14090f"/>`;
  s += `<path d="M300 1400 L-200 2200 M780 1400 L1280 2200" stroke="${GOLD}" stroke-width="6" opacity=".25"/>`;
  // Wandleuchten
  for (const lx of [110, 970]) {
    s += `<ellipse cx="${lx}" cy="700" rx="${f1(260 * lamp)}" ry="${f1(340 * lamp)}" fill="url(#gWarm)" opacity="${f1(.9 * lamp)}"/>`;
    s += `<rect x="${lx - 24}" y="660" width="48" height="80" rx="10" fill="${GOLD3}"/><rect x="${lx - 18}" y="666" width="36" height="58" rx="8" fill="#FFE2A0" opacity="${f1(lamp)}"/>`;
  }
  // gegenüberliegende Tür
  s += `<rect x="410" y="420" width="260" height="740" rx="6" fill="#1a1214" stroke="#2c1f1f" stroke-width="10"/><circle cx="640" cy="800" r="9" fill="${GOLD}"/>`;
  s += `<text x="540" y="400" text-anchor="middle" font-family="Cormorant" font-size="54" font-weight="600" fill="${GOLD}" opacity=".6">12</text>`;
  return s;
}

/* Türspion: Inhalt -> Fischauge, Kreis-Maske, Linse */
const PEEP = { cx: CX, cy: 880, r: 420 };
function peephole(inner, t, o = {}) {
  const r = o.r ?? PEEP.r, cx = PEEP.cx, cy = PEEP.cy;
  const id = uid('pp');
  const fx = cx - r, fy = cy - r, sz = r * 2;
  let s = `<clipPath id="${id}c"><circle cx="${cx}" cy="${cy}" r="${f1(r)}"/></clipPath>`;
  s += `<filter id="${id}f" filterUnits="userSpaceOnUse" x="${fx}" y="${fy}" width="${sz}" height="${sz}" color-interpolation-filters="sRGB">
    <feImage href="../build/fisheye.png" x="${fx}" y="${fy}" width="${sz}" height="${sz}" preserveAspectRatio="none" result="m"/>
    <feDisplacementMap in="SourceGraphic" in2="m" scale="${f1(200 * sz / 1000)}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
  // Tür außen
  s += `<rect x="-200" y="-200" width="1480" height="2320" fill="url(#gDoor)"/>`;
  for (let i = 0; i < 26; i++) s += `<path d="M${-100 + i * 50} -200 Q${-80 + i * 50 + Math.sin(i) * 30} 960 ${-100 + i * 50} 2200" stroke="#000" stroke-width="${2 + rnd(i) * 4}" opacity=".25" fill="none"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${f1(r + 46)}" fill="#0a0706"/><circle cx="${cx}" cy="${cy}" r="${f1(r + 46)}" fill="none" stroke="${GOLD3}" stroke-width="14" opacity=".8"/>`;
  s += `<g clip-path="url(#${id}c)"><g filter="url(#${id}f)">${inner}</g>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${f1(r)}" fill="url(#gVig)" opacity=".95"/>`;
  s += `<path d="M${cx - r * .62} ${cy - r * .5} A${r * .8} ${r * .8} 0 0 1 ${cx + r * .2} ${cy - r * .78}" stroke="#fff" stroke-width="18" fill="none" opacity=".08" stroke-linecap="round"/>`;
  s += `</g>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${f1(r)}" fill="none" stroke="#000" stroke-width="30" opacity=".85"/>`;
  return s;
}

/* ---------- Effekte ---------- */
const vignette = (k = 1) => `<rect width="1080" height="1920" fill="url(#gVig)" opacity="${k}"/>`;
function grain(t, n = 70) {
  const fr = Math.floor(t * 30); let s = '';
  for (let i = 0; i < n; i++) s += `<rect x="${f1(rnd(i + fr * 61) * 1080)}" y="${f1(rnd(i * 3 + fr * 17) * 1920)}" width="3" height="3" fill="#fff" opacity=".06"/>`;
  return s;
}
function letterbox(k) { return k > 0 ? `<rect x="0" y="0" width="1080" height="${f1(150 * k)}" fill="#000"/><rect x="0" y="${f1(1920 - 380 * k)}" width="1080" height="${f1(380 * k)}" fill="#000" opacity=".0"/>` : ''; }
const flashRect = (k, col = '#fff') => k > .01 ? `<rect width="1080" height="1920" fill="${col}" opacity="${f1(clamp(k))}"/>` : '';
function shakeXY(t, t0, dur, amp, fq = 34) {
  if (t < t0 || t > t0 + dur) return [0, 0, 0];
  const k = 1 - seg(t, t0, t0 + dur), a = amp * k * k;
  return [noise1(t * fq) * a, noise1(t * fq + 50) * a, noise1(t * fq * .7 + 9) * a * .04];
}
function cam(inner, c) {
  const z = c.z ?? 1, fx = c.fx ?? 540, fy = c.fy ?? 960;
  return `<g transform="translate(${f1(540 + (c.sx || 0))},${f1(960 + (c.sy || 0))}) rotate(${f1(c.r || 0)}) scale(${z.toFixed(4)}) translate(${f1(-fx)},${f1(-fy)})">${inner}</g>`;
}
function label(x, y, txt, op = 1) {
  return `<g transform="translate(${x},${y})" opacity="${f1(op)}"><rect x="-46" y="-40" width="92" height="80" rx="16" fill="#000" fill-opacity=".55" stroke="${GOLD}" stroke-width="4"/><text y="22" text-anchor="middle" font-family="Cormorant" font-size="64" font-weight="700" fill="${GOLD2}">${txt}</text></g>`;
}
function bottleImg(cx, cy, h, extra = '') {
  const w = h * BOT.w / BOT.h;
  return `<image href="../build/bottle.png" x="${f1(cx - w / 2)}" y="${f1(cy - h / 2)}" width="${f1(w)}" height="${f1(h)}" ${extra}/>`;
}
function productImg(cx, cy, h, extra = '') {
  const w = h * PROD.w / PROD.h;
  return `<image href="../build/product.png" x="${f1(cx - w / 2)}" y="${f1(cy - h / 2)}" width="${f1(w)}" height="${f1(h)}" ${extra}/>`;
}
let BOT = { w: 445, h: 822 }, PROD = { w: 1011, h: 963 };

/* ---------- Untertitel ---------- */
const SUB_FS = 84, SUB_LH = 104, SUB_MAXW = 800, GAP = 44, SUB_CX = CX;
let mctx = null;
const tw = (s, fs = SUB_FS) => { if (!mctx) mctx = document.createElement('canvas').getContext('2d'); mctx.font = `800 ${fs}px Poppins`; return mctx.measureText(s).width; };
function buildChunks(words) {
  const chunks = []; let cur = [];
  const width = idx => idx.reduce((a, i) => a + tw(words[i].word), 0) + (idx.length - 1) * GAP;
  for (let i = 0; i < words.length; i++) {
    cur.push(i);
    const w = words[i].word, nx = words[i + 1];
    const end = /[.!?:…]$/.test(w) || (/[,–]$/.test(w) && cur.length >= 2) || (nx && nx.spk !== words[i].spk);
    if (end || cur.length >= 3 || (nx && width([...cur, i + 1]) > SUB_MAXW)) { chunks.push(cur); cur = []; }
  }
  if (cur.length) chunks.push(cur);
  return chunks.map(idx => {
    const lines = [[]]; let lw = 0;
    for (const i of idx) { const ww = tw(words[i].word); if (lines[lines.length - 1].length && lw + GAP + ww > SUB_MAXW) { lines.push([]); lw = 0; } lines[lines.length - 1].push(i); lw += (lw ? GAP : 0) + ww; }
    const pos = {};
    lines.forEach((ln, li) => { const tot = ln.reduce((a, i) => a + tw(words[i].word), 0) + (ln.length - 1) * GAP; let x = SUB_CX - tot / 2; for (const i of ln) { const ww = tw(words[i].word); pos[i] = { x: x + ww / 2, line: li }; x += ww + GAP; } });
    return { idx, lines: lines.length, pos, spk: words[idx[0]].spk };
  });
}
function subtitles(t, words, chunks, y0, dur) {
  let s = '';
  for (let c = 0; c < chunks.length; c++) {
    const ch = chunks[c];
    const st = words[ch.idx[0]].start - .05;
    const nx = c + 1 < chunks.length ? words[chunks[c + 1].idx[0]].start - .05 : dur + 1;
    const en = Math.min(nx, words[ch.idx[ch.idx.length - 1]].end + .7);
    if (t < st || t >= en) continue;
    const yTop = y0 - (ch.lines - 1) * SUB_LH / 2;
    if (ch.spk && ch.spk !== 'W') {
      const lab = ch.spk === 'AB' ? 'A + B' : 'B';
      const k = eBack(seg(t, st, st + .2));
      s += `<g transform="translate(${SUB_CX},${f1(yTop - 92)}) scale(${f1(k)})"><rect x="-80" y="-30" width="160" height="56" rx="28" fill="#000" fill-opacity=".6" stroke="${GOLD}" stroke-width="3"/><text y="11" text-anchor="middle" font-size="32" font-weight="800" fill="${GOLD2}">${lab}</text></g>`;
    }
    for (const i of ch.idx) {
      const w = words[i], age = t - (w.start - .03);
      if (age < 0) continue;
      const k = eBack(age / .18), sc = lerp(.55, 1, k) * (t >= w.start && t < w.end + .05 ? 1.05 : 1);
      const p = ch.pos[i], y = yTop + p.line * SUB_LH;
      s += `<g transform="translate(${f1(p.x)},${f1(y)}) scale(${sc.toFixed(3)})" opacity="${f1(clamp(age / .06))}">
       <text y="${SUB_FS * .35 + 6}" text-anchor="middle" font-size="${SUB_FS}" font-weight="800" fill="#000" opacity=".5">${w.word}</text>
       <text y="${SUB_FS * .35}" text-anchor="middle" font-size="${SUB_FS}" font-weight="800" fill="${w.key ? GOLD : '#fff'}" stroke="#000" stroke-width="16" stroke-linejoin="round" paint-order="stroke">${w.word}</text></g>`;
    }
  }
  return s;
}

/* ---------- Szenen-Helfer ---------- */
let D = null, CH = null;
function wt(key, occ = 0, fb = null) { const k = norm(key); let c = 0; for (const w of D.words) if (norm(w.word).startsWith(k)) { if (c === occ) return w.start; c++; } return fb; }
function wEnd(key, occ = 0, fb = null) { const k = norm(key); let c = 0; for (const w of D.words) if (norm(w.word).startsWith(k)) { if (c === occ) return w.end; c++; } return fb; }
function talkAt(t, spk) { for (const w of D.words) if ((!spk || spk.includes(w.spk)) && t >= w.start && t < w.end) return .4 + .6 * Math.abs(Math.sin((t - w.start) * 16)); return 0; }
function blinkAt(t, off = 0) { const p = (t + off) % 3.1; return p < .13 ? Math.sin(p / .13 * Math.PI) : 0; }
const entry = (t, d = .3) => 1 - eOut(t / d);

// Zwei identische Männer im Flur (Türspion-Perspektive)
function twoMen(t, o = {}) {
  const bl = blinkAt(t, .7);
  const base = { s: 1, emo: o.emo || 'calm', look: o.look || [0, -.1], blink: bl, talk: o.talk || 0 };
  return man(Object.assign({}, base, { x: 340, y: 1560 })) + man(Object.assign({}, base, { x: 740, y: 1560, ring: true, hand: o.handB || null }));
}
function peepFrame(t, z) {
  const inner = cam(hallway(t) + twoMen(t, { look: [0, -.2] }), { z: 1.02 * z, fx: 540, fy: 1060 });
  return peephole(inner, t);
}

const SC = {};

/* 1 – HOOK: Türspion, zwei identische Männer, Flasche blitzt auf */
SC.s01 = {
  setup() { D.Zw = wt('zweimal'); D.Fl0 = D.duration - .62; D.Fl1 = D.duration - .1; },
  sfx() { return [{ t: 0, type: 'doorbell' }, { t: D.Zw, type: 'hit' }, { t: D.Fl0, type: 'shimmer', dur: .6 }]; },
  render(t) {
    if (t >= D.Fl0 && t < D.Fl1) {
      // 0,5 s: Flasche im Dunkeln, nur das goldene Etikett leuchtet
      const k = seg(t, D.Fl0, D.Fl0 + .08) * (1 - seg(t, D.Fl1 - .08, D.Fl1));
      let w = `<rect width="1080" height="1920" fill="#010103"/>`;
      w += `<ellipse cx="${CX}" cy="1000" rx="260" ry="200" fill="url(#gGold)" opacity="${f1(.55 * k)}"/>`;
      w += `<g opacity="${f1(k)}" style="filter:brightness(.32)">${bottleImg(CX, 900, 760)}</g>`;
      // nur das Etikett leuchtet
      const bw = 760 * BOT.w / BOT.h, lx = CX - bw / 2 + bw * .38, ly = 900 - 380 + 760 * .66;
      w += `<ellipse cx="${f1(lx)}" cy="${f1(ly)}" rx="170" ry="200" fill="url(#gGold)" opacity="${f1(.55 * k)}"/>`;
      w += `<clipPath id="lab"><rect x="${f1(lx - 120)}" y="${f1(ly - 135)}" width="240" height="270"/></clipPath><g clip-path="url(#lab)" opacity="${f1(k)}" style="filter:brightness(1.1)">${bottleImg(CX, 900, 760)}</g>`;
      w += smoke(t, CX - 20, 560, 420, { amp: 60, k: seg(t, D.Fl0, D.Fl1), seed: 2, op: k });
      return { world: cam(w, { z: 1 + (t - D.Fl0) * .15, fx: CX, fy: 960 }), fx: '' };
    }
    const z = 1 + .05 * t + (t >= D.Zw ? .12 * (1 - eOut(seg(t, D.Zw, D.Zw + .35))) : 0);
    const sh = shakeXY(t, D.Zw, .35, 16);
    let w = `<rect width="1080" height="1920" fill="#000"/>` + peepFrame(t, z);
    return { world: `<g transform="translate(${f1(sh[0])},${f1(sh[1])})">${w}</g>`, fx: '' };
  },
};

/* 2 – Gleiches Gesicht / Anzug / Stimme: schnelle Schnitte A/B */
SC.s02 = {
  setup() { D.P = [D.words[0].start, D.words[2].start, D.words[4].start, D.duration]; },
  sfx() { const s = []; for (let x = .0; x < D.duration; x += .5) s.push({ t: x, type: 'tick' }); for (let i = 0; i < 3; i++) s.push({ t: D.P[i], type: 'cut' }, { t: (D.P[i] + D.P[i + 1]) / 2, type: 'cut' }); return s; },
  render(t) {
    let ph = 0; while (ph < 2 && t >= D.P[ph + 1]) ph++;
    const mid = (D.P[ph] + D.P[ph + 1]) / 2, isB = t >= mid;
    const lt = t - (isB ? mid : D.P[ph]);
    const x = 540, y = 1700;
    const m = man({ x, y, s: 1.0, emo: 'calm', look: [0, 0], blink: blinkAt(t, isB ? .3 : 1.4), ring: isB, hand: ph === 1 ? 'tie' : null, talk: ph === 2 ? (.4 + .5 * Math.abs(Math.sin(lt * 14))) : 0 });
    let w = `<rect width="1080" height="1920" fill="#060a16"/>` + `<ellipse cx="${isB ? 820 : 260}" cy="700" rx="420" ry="520" fill="url(#gWarm)" opacity=".5"/>` + m;
    let c;
    if (ph === 0) c = { z: 1.75 + lt * .12, fx: x, fy: y - 640 * 1.0 + 30 };
    else if (ph === 1) c = { z: 1.5 + lt * .1, fx: x + 30, fy: y - 330 };
    else c = { z: 2.4 + lt * .15, fx: x, fy: y - 560 };
    w = cam(w, c);
    let fx = label(isB ? 860 : 130, 260, isB ? 'B' : 'A');
    if (ph === 2) for (let i = 0; i < 3; i++) { const r = 60 + ((lt * 260 + i * 70) % 210); fx += `<circle cx="540" cy="1150" r="${f1(r)}" fill="none" stroke="${GOLD}" stroke-width="4" opacity="${f1(.5 * (1 - (r - 60) / 210))}"/>`; }
    fx += flashRect(.35 * (1 - seg(lt, 0, .07)));
    return { world: w, fx };
  },
};

/* 3/4 – Fragen an der Tür + synchrone Antwort A|B */
function askScene(q) {
  return {
    setup() { const a = D.words.find(w => w.spk === 'AB'); D.An = a ? a.start : D.duration * .6; },
    sfx() {
      const s = [{ t: 0, type: q === 1 ? 'knock' : 'whoosh' }, { t: D.An, type: 'hit', gain: q === 1 ? 1 : .8 }];
      for (let x = 0; x < D.duration; x += .5) s.push({ t: x, type: 'tick', gain: .6 });
      return s;
    },
    render(t) {
      let w = '', fx = '';
      if (t < D.An - .05) {
        // Sie flüstert durch die Tür; Licht vom Türspion auf ihrem Auge
        const lk = flick(t, q * 3, .6);
        w += `<rect width="1080" height="1920" fill="#05070f"/>`;
        w += `<rect x="-40" y="-100" width="${q === 1 ? 360 : 300}" height="2200" fill="url(#gDoor)"/><rect x="${q === 1 ? 300 : 240}" y="-100" width="16" height="2200" fill="#000" opacity=".6"/>`;
        w += `<circle cx="${q === 1 ? 250 : 200}" cy="${q === 1 ? 760 : 700}" r="12" fill="${GOLD2}" opacity="${f1(.8 * lk)}"/>`;
        w += woman({ x: q === 1 ? 640 : 610, y: 1720, s: 1.08, emo: q === 1 ? 'suspicious' : 'worried', look: [-.8, -.1], blink: blinkAt(t, .2), talk: talkAt(t, 'W') * .7, tilt: -4 });
        w += `<ellipse cx="${q === 1 ? 480 : 440}" cy="980" rx="200" ry="140" fill="url(#gWarm)" opacity="${f1(.35 * lk)}"/>`;
        w = cam(w, { z: (q === 1 ? 1.15 : 1.45) + t * .04 + entry(t) * .08, fx: q === 1 ? 600 : 570, fy: q === 1 ? 1050 : 1000 });
      } else {
        // Split-Screen: A | B sprechen exakt gleich
        const lt = t - D.An;
        const talk = talkAt(t, 'AB');
        const z = 1.25 + lt * .1, eyeZ = q === 1 ? eOut(seg(lt, .05, .5)) : 0;
        const mk = (ring) => man({ x: 540, y: 1700, s: 1, emo: q === 1 ? 'calm' : 'smile', look: [0, 0], blink: blinkAt(t, .9), talk, ring, hand: q === 2 ? 'tie' : null, glint: ring && q === 2 ? .35 * Math.max(0, Math.sin(lt * 3)) : 0 });
        const camA = { z: lerp(z, 2.3, eyeZ), fx: 540, fy: lerp(1300, 1075, eyeZ) };
        w += `<clipPath id="cl"><rect x="0" y="0" width="540" height="1920"/></clipPath><clipPath id="cr"><rect x="540" y="0" width="540" height="1920"/></clipPath>`;
        w += `<g clip-path="url(#cl)"><g transform="translate(-270,0)">${cam(`<rect width="1080" height="1920" fill="#070b18"/>` + hallway(t, { lamp: .8 }) + mk(false), camA)}</g></g>`;
        w += `<g clip-path="url(#cr)"><g transform="translate(270,0)">${cam(`<rect width="1080" height="1920" fill="#070b18"/>` + hallway(t, { lamp: .8 }) + mk(true), camA)}</g></g>`;
        w += `<rect x="536" y="0" width="8" height="1920" fill="${GOLD}" opacity=".8"/>`;
        const sh = shakeXY(t, D.An, .4, 18);
        w = `<g transform="translate(${f1(sh[0])},${f1(sh[1])})">${w}</g>`;
        fx += label(110, 250, 'A') + label(880, 250, 'B');
        fx += flashRect(.5 * (1 - seg(lt, 0, .12)), GOLD2);
      }
      return { world: w, fx };
    },
  };
}
SC.s03 = askScene(1);
SC.s04 = askScene(2);

/* 5 – Rückblende: Dachterrasse, warmes Gold */
function rooftop(t) {
  let s = `<rect width="1080" height="1920" fill="#120b10"/>`;
  s += `<rect x="-200" y="-200" width="1500" height="1300" fill="#24121a"/>`;
  for (let i = 0; i < 30; i++) {
    const bx = -100 + i * 44, bh = 160 + rnd(i * 3) * 360;
    s += `<rect x="${bx}" y="${1080 - bh}" width="40" height="${bh}" fill="#0d0710"/>`;
    for (let j = 0; j < 5; j++) if (rnd(i * 7 + j) > .5) s += `<rect x="${bx + 6 + (j % 2) * 16}" y="${1100 - bh + 20 + j * 34}" width="8" height="12" fill="#FFC877" opacity=".6"/>`;
  }
  // Lichterkette
  let p = 'M-50 360 Q540 560 1130 360';
  s += `<path d="${p}" stroke="#2a1a14" stroke-width="4" fill="none"/>`;
  for (let i = 0; i < 18; i++) { const u = i / 17, x = lerp(-50, 1130, u), y = 360 + 4 * 200 * u * (1 - u); const fl = .6 + .4 * Math.sin(t * 3 + i); s += `<circle cx="${f1(x)}" cy="${f1(y + 14)}" r="${f1(26 * fl)}" fill="url(#gWarm)"/><circle cx="${f1(x)}" cy="${f1(y + 14)}" r="7" fill="#FFE3A3"/>`; }
  s += `<rect x="-200" y="1080" width="1500" height="40" fill="#3a2418"/><rect x="-200" y="1120" width="1500" height="900" fill="#1a0f0c"/>`;
  return s;
}
SC.s05 = {
  setup() { D.Na = wt('nacht'); },
  sfx() { return [{ t: 0, type: 'memory' }, { t: D.Na, type: 'shimmer', dur: 1.2 }]; },
  render(t) {
    const warm = smooth(seg(t, 0, .5));
    let w = rooftop(t);
    w += woman({ x: 330, y: 1640, s: .95, emo: 'laugh', look: [.7, -.1], blink: 0, tilt: -6 + Math.sin(t * 5) * 2 });
    w += man({ x: 690, y: 1660, s: .95, emo: 'warm', look: [-.7, 0], blink: blinkAt(t, .5), ring: true, hand: 'chest', tilt: 4 });
    w += smoke(t, 720, 1100, 640, { amp: 90, k: seg(t, .2, 2.2), seed: 4, dx: -260 });
    w += sparkleField(t, 30, .6, 2);
    w = cam(w, { z: 1.08 + .05 * t + entry(t, .5) * .2, fx: 540, fy: 1060 });
    let fx = `<rect width="1080" height="1920" fill="#E0A040" opacity="${f1(.16 * warm)}" style="mix-blend-mode:overlay"/>`;
    fx += `<rect width="1080" height="1920" fill="#fff" opacity="${f1(.6 * (1 - seg(t, 0, .25)))}"/>`;
    // Erinnerungs-Rand (weich, golden)
    fx += `<rect x="0" y="0" width="1080" height="1920" fill="none" stroke="${GOLD}" stroke-width="60" opacity=".12" filter="url(#fBlur30)"/>`;
    return { world: w, fx, sepia: .35 * warm };
  },
};

/* 6 – Rückblende: Flasche auf seinem Regal, er sprüht */
SC.s06 = {
  setup() { D.Et = wt('etwas'); D.Sp = wt('vergessen') - .1; },
  sfx() { return [{ t: 0, type: 'whoosh', gain: .5 }, { t: D.Sp, type: 'spray' }, { t: .2, type: 'shimmer', dur: 2 }]; },
  render(t) {
    let w = `<rect width="1080" height="1920" fill="#120b0d"/>`;
    // Regal
    w += `<rect x="-100" y="300" width="1300" height="1400" fill="#1b1013"/>`;
    w += `<rect x="40" y="1040" width="900" height="34" fill="#3a2418"/><rect x="40" y="1074" width="900" height="12" fill="#000" opacity=".5"/>`;
    for (let i = 0; i < 7; i++) w += `<rect x="${70 + i * 34}" y="${800 + rnd(i) * 60}" width="28" height="${240 - rnd(i) * 60}" fill="${['#3b2a20', '#2a1c26', '#4a3424', '#1f2433'][i % 4]}"/>`;
    w += `<rect x="780" y="930" width="60" height="110" rx="8" fill="#e8dcc6"/><path d="M810 930 q-10 -30 0 -50 q10 20 0 50" fill="#FFB347" opacity="${f1(.7 + .3 * Math.sin(t * 9))}"/><ellipse cx="810" cy="880" rx="70" ry="90" fill="url(#gWarm)" opacity=".5"/>`;
    const spray = t >= D.Sp;
    if (!spray) {
      // Flasche auf dem Regal, Rauch steigt auf
      w += `<ellipse cx="520" cy="900" rx="240" ry="240" fill="url(#gGold)" opacity=".5"/>`;
      w += bottleImg(520, 868, 340, 'filter="url(#fShadow)"');
      w += smoke(t, 520, 690, 560, { amp: 80, k: seg(t, 0, 1.4), seed: 1 });
      w += smoke(t, 540, 690, 460, { amp: 60, k: seg(t, .3, 1.8), seed: 6, w: .7 });
      w = cam(w, { z: 1.25 + t * .06 + entry(t) * .1, fx: 520, fy: 860 });
    } else {
      // Er sprüht: rechte Hand mit Flasche, linke Hand mit Ring am Kragen
      const lt = t - D.Sp;
      w += man({ x: 520, y: 1700, s: 1.05, emo: 'calm', emo2: 'warm', emoK: seg(lt, .2, .6), look: [-.3, -.2], blink: 0, ring: true, hand: 'collar', tilt: -6 });
      w += `<g transform="translate(250,1000) rotate(-28)">${bottleImg(0, 0, 230)}</g>`;
      w += hand(232, 1100, -20, 1.05, {});
      for (let i = 0; i < 40; i++) { const pk = seg(lt, i * .006, .5 + i * .006); if (pk <= 0 || pk >= 1) continue; const a = -30 * DEG + (rnd(i) - .5) * .5; w += `<circle cx="${f1(300 + Math.cos(a) * 300 * eOut(pk))}" cy="${f1(880 + Math.sin(a) * 300 * eOut(pk))}" r="${f1(3 + 6 * pk)}" fill="${GOLD2}" opacity="${f1(.8 * (1 - pk))}"/>`; }
      w += smoke(t, 440, 1000, 520, { amp: 90, seed: 3, k: seg(lt, 0, .6), dx: 80 });
      w = cam(w, { z: 1.12 + lt * .06, fx: 520, fy: 1080 });
    }
    let fx = `<rect width="1080" height="1920" fill="#E0A040" opacity=".14"/>` + `<rect x="0" y="0" width="1080" height="1920" fill="none" stroke="${GOLD}" stroke-width="60" opacity=".12" filter="url(#fBlur30)"/>`;
    fx += flashRect(spray ? .3 * (1 - seg(t, D.Sp, D.Sp + .15)) : 0, GOLD2);
    return { world: w, fx, sepia: .35 };
  },
};

/* 7 – Tür einen Spalt öffnen */
SC.s07 = {
  setup() { D.Op = wt('tür') - .1; D.Sl = wt('spalt'); },
  sfx() { return [{ t: 0, type: 'whoosh', gain: .5 }, { t: D.Op, type: 'creak', dur: 1.6 }]; },
  render(t) {
    const gap = eIO(seg(t, D.Op, D.Op + 1.4)) * 90 + (t > D.Sl ? 6 * Math.sin((t - D.Sl) * 3) : 0);
    let w = `<rect width="1080" height="1920" fill="#03050b"/>`;
    // Wohnungsflur innen, Tür rechts
    w += `<rect x="560" y="300" width="${f1(gap)}" height="1200" fill="#FFD58A"/>`;
    w += `<clipPath id="gapc"><rect x="560" y="300" width="${f1(gap)}" height="1200"/></clipPath><g clip-path="url(#gapc)">${cam(hallway(t, { lamp: 1 }) + twoMen(t, {}), { z: 1.4, fx: 520, fy: 1100 })}<rect x="560" y="300" width="300" height="1200" fill="#FFD58A" opacity=".25"/></g>`;
    w += `<path d="M560 1500 L${f1(560 + gap)} 1500 L${f1(700 + gap * 5)} 1920 L${f1(300 - gap * 2)} 1920 Z" fill="#FFD58A" opacity="${f1(.25 * clamp(gap / 60))}"/>`;
    w += `<rect x="${f1(560 + gap)}" y="290" width="380" height="1220" fill="url(#gDoor)"/><rect x="${f1(560 + gap)}" y="290" width="14" height="1220" fill="#000" opacity=".5"/><circle cx="${f1(600 + gap)}" cy="900" r="16" fill="${GOLD}"/>`;
    w += `<rect x="100" y="290" width="460" height="1220" fill="#0b0d16"/>`;
    // ihre Silhouette im Lichtspalt
    w += `<g opacity="${f1(.9)}">${woman({ x: 300, y: 1900, s: .9, emo: 'worried', look: [1, 0], blink: 0, talk: talkAt(t) * .5 })}</g>`;
    w += `<rect x="0" y="0" width="560" height="1920" fill="#000" opacity="${f1(.55 - .3 * clamp(gap / 80))}"/>`;
    w = cam(w, { z: 1.05 + t * .05, fx: 520, fy: 1000 });
    return { world: w, fx: '' };
  },
};

/* 8 – Nah an A: nichts */
SC.s08 = {
  setup() { D.Ni = wt('nichts'); },
  sfx() { return [{ t: 0, type: 'whoosh', gain: .4 }, { t: .3, type: 'sniff' }, { t: D.Ni, type: 'low' }]; },
  render(t) {
    let w = `<rect width="1080" height="1920" fill="#05070f"/>` + hallway(t, { lamp: .55 });
    w += man({ x: 560, y: 1800, s: 1.1, emo: 'calm', look: [-.3, .1], blink: blinkAt(t, .3) });
    w += `<ellipse cx="560" cy="900" rx="500" ry="700" fill="url(#gCold)" opacity=".45"/>`;
    // ihr Profil im Vordergrund (links, unscharf)
    w += `<g opacity=".9" filter="url(#fBlur6)">${woman({ x: 60, y: 1900, s: 1.3, emo: 'sniff', look: [1, 0], blink: 0 })}</g>`;
    w = cam(w, { z: lerp(1.1, 2.0, eIO(seg(t, 0, D.Ni))) , fx: lerp(540, 560, seg(t, 0, D.Ni)), fy: lerp(1150, 1270, eIO(seg(t, 0, D.Ni))) });
    const fx = label(130, 250, 'A') + `<rect width="1080" height="1920" fill="#0b1a3a" opacity=".25"/>`;
    return { world: w, fx, sat: .55 };
  },
};

/* 9 – Nah an B: goldener Rauch */
SC.s09 = {
  setup() { },
  sfx() { return [{ t: 0, type: 'whoosh', gain: .4 }, { t: .3, type: 'sniff' }, { t: .5, type: 'shimmer', dur: 2 }, { t: .45, type: 'swell', dur: 1.9 }]; },
  render(t) {
    const k = seg(t, .45, 1.9);
    let w = `<rect width="1080" height="1920" fill="#07070c"/>` + hallway(t, { lamp: .7 + .3 * k });
    w += `<ellipse cx="560" cy="1000" rx="${f1(300 + 300 * k)}" ry="${f1(400 + 300 * k)}" fill="url(#gWarm)" opacity="${f1(.3 + .5 * k)}"/>`;
    w += man({ x: 560, y: 1800, s: 1.1, emo: 'calm', emo2: 'warm', emoK: seg(t, 1, 1.6), look: [-.3, .1], blink: blinkAt(t, 1.1), ring: true });
    w += smoke(t, 700, 1330, 900, { amp: 90, k, seed: 5, w: 1.2, dx: 140 });
    w += smoke(t, 420, 1340, 700, { amp: 70, k: seg(t, .7, 2.1), seed: 9, w: .8, dx: -150 });
    w += sparkleField(t, 40, .8 * k, 4);
    w += `<g opacity=".9" filter="url(#fBlur6)">${woman({ x: 60, y: 1900, s: 1.3, emo: 'dreamy', look: [1, 0], blink: 0 })}</g>`;
    w = cam(w, { z: lerp(1.1, 1.9, eIO(seg(t, 0, 1.5))), fx: 560, fy: lerp(1150, 1240, seg(t, 0, 1.5)) });
    return { world: w, fx: label(880, 250, 'B') };
  },
};

/* 10 – Twist: B rein, Tür knallt zu; draußen A, Licht geht aus */
SC.s10 = {
  setup() { D.Kn = wt('knall'); D.Out = wEnd('zu') + .15; D.Off = D.duration - .5; },
  sfx() { return [{ t: .1, type: 'whoosh' }, { t: D.Kn + .05, type: 'slam' }, { t: D.Kn + .05, type: 'hit', gain: 1.2 }, { t: D.Out + .3, type: 'buzz', dur: D.Off - D.Out - .3 }, { t: D.Off, type: 'mark_silence' }]; },
  render(t) {
    let w = '', fx = '';
    if (t < D.Kn + .05) {
      // sie zieht B rein (schnelle Bewegung), Tür schwingt
      const pk = eIO(seg(t, .15, .9));
      w += `<rect width="1080" height="1920" fill="#05060c"/>`;
      w += `<rect x="300" y="200" width="${f1(560 - 300 * seg(t, 1.0, D.Kn))}" height="1400" fill="#FFD58A" opacity=".35"/>`;
      w += man({ x: lerp(900, 420, pk), y: 1800, s: lerp(1.0, 1.25, pk), emo: 'smirk', look: [-.4, 0], blink: 0, ring: true, tilt: lerp(10, -4, pk) });
      for (let i = 0; i < 14; i++) w += `<rect x="${f1(lerp(1100, 500, pk) + rnd(i) * 300)}" y="${f1(300 + rnd(i * 3) * 1300)}" width="${f1(200 + rnd(i) * 300)}" height="4" fill="#fff" opacity="${f1(.25 * (1 - Math.abs(pk - .5) * 2))}"/>`;
      // Tür kommt von rechts
      const dk = eIn(seg(t, D.Kn - .35, D.Kn + .05));
      w += `<rect x="${f1(lerp(1180, -20, dk))}" y="-40" width="1200" height="2000" fill="url(#gDoor)"/>`;
      w = cam(w, { z: 1.05, fx: 540, fy: 1000 });
    } else if (t < D.Out) {
      // Tür zu: Knall
      const sh = shakeXY(t, D.Kn + .05, .5, 42);
      w += `<rect x="-60" y="-60" width="1200" height="2040" fill="url(#gDoor)"/>`;
      for (let i = 0; i < 26; i++) w += `<path d="M${-60 + i * 50} -60 Q${-40 + i * 50 + Math.sin(i) * 30} 960 ${-60 + i * 50} 2000" stroke="#000" stroke-width="${2 + rnd(i) * 4}" opacity=".25" fill="none"/>`;
      w += `<circle cx="${CX}" cy="880" r="40" fill="#0a0706" stroke="${GOLD3}" stroke-width="10"/>`;
      for (let i = 0; i < 30; i++) { const dk = seg(t, D.Kn, D.Kn + .8); w += `<circle cx="${f1(rnd(i) * 1080)}" cy="${f1(200 + rnd(i * 5) * 1400 + dk * 200)}" r="${f1(2 + rnd(i) * 3)}" fill="#c8b8a0" opacity="${f1(.5 * (1 - dk))}"/>`; }
      w = `<g transform="translate(${f1(sh[0])},${f1(sh[1])}) rotate(${f1(sh[2] * 20)} 540 960)">${w}</g>`;
      fx += flashRect(.5 * (1 - seg(t, D.Kn, D.Kn + .12)));
    } else {
      // Draußen: A allein, Lächeln verschwindet, Licht flackert und geht aus
      const lt = t - D.Out;
      const fade = seg(t, D.Out + .2, D.Off - .45);
      let lamp = 1;
      if (t > D.Off - .9) lamp = (Math.floor(t * 18) % 3 === 0) ? .15 : .9;
      if (t > D.Off - .35) lamp = (Math.floor(t * 24) % 2 === 0) ? .05 : .5;
      if (t >= D.Off) lamp = 0;
      w += hallway(t, { lamp });
      w += `<rect x="-60" y="1380" width="1200" height="40" fill="#000" opacity=".4"/>`;
      w += man({ x: 520, y: 1780, s: 1.05, emo: 'smile', emo2: 'cold', emoK: fade, look: [0, 0], blink: 0, eyeGlint: 0 });
      w += `<rect x="-100" y="-100" width="1300" height="2200" fill="#000" opacity="${f1(1 - (.25 + .75 * lamp))}"/>`;
      if (t >= D.Off) w = `<rect width="1080" height="1920" fill="#000"/>`;
      w = cam(w, { z: 1.25 + lt * .08, fx: 520, fy: 1200 });
      if (t < D.Off) fx += label(130, 250, 'A', 1 - seg(t, D.Off - .3, D.Off));
    }
    return { world: w, fx, noVig: t >= D.Off };
  },
};

/* 11 – Auflösung: B lächelt, Nahaufnahme Flasche, Sprühstoß, Gold füllt das Bild */
SC.s11 = {
  setup() { D.An = wt('an'); D.Du = wt('duft'); D.Sp = D.Du - .25; },
  sfx() { return [{ t: 0, type: 'mark_chord' }, { t: D.An - .1, type: 'whoosh', gain: .4 }, { t: D.Sp, type: 'spray' }, { t: D.Sp + .05, type: 'shimmer', dur: 2.5 }]; },
  render(t) {
    let w = '', fx = '';
    if (t < D.An - .1) {
      w += `<rect width="1080" height="1920" fill="#0d0809"/>`;
      w += `<ellipse cx="300" cy="700" rx="400" ry="500" fill="url(#gWarm)" opacity=".7"/><ellipse cx="860" cy="1100" rx="300" ry="400" fill="url(#gWarm)" opacity=".35"/>`;
      w += man({ x: 540, y: 1760, s: 1.1, emo: 'warm', look: [-.2, 0], blink: blinkAt(t, .6), talk: talkAt(t, 'B') * .8, ring: true });
      w += smoke(t, 700, 1250, 700, { amp: 80, seed: 8, k: 1, op: .7, w: .8 });
      w += sparkleField(t, 25, .5, 6);
      w = cam(w, { z: 1.5 + t * .05 + entry(t, .5) * .1, fx: 540, fy: 1100 });
      fx += flashRect(.25 * (1 - seg(t, 0, .4)), '#FFC877');
    } else {
      const lt = t - (D.An - .1);
      const sp = t >= D.Sp;
      const fill = seg(t, D.Sp, D.Sp + 1.2);
      w += `<rect width="1080" height="1920" fill="#060508"/>`;
      w += `<ellipse cx="${CX}" cy="960" rx="420" ry="520" fill="url(#gGold)" opacity="${f1(.35 + .3 * fill)}"/>`;
      w += bottleImg(CX, 1060, 900, 'filter="url(#fShadow)"');
      // Finger drückt Sprühkopf
      const press = sp ? Math.sin(clamp((t - D.Sp) / .25) * Math.PI) : 0;
      w += hand(CX + 30, 560 + press * 18, 180, 1.4, { w: true });
      if (sp) {
        const pk = seg(t, D.Sp, D.Sp + .8);
        for (let i = 0; i < 70; i++) { const q = seg(pk, rnd(i) * .3, 1); if (q <= 0 || q >= 1) continue; const a = -150 * DEG + (rnd(i * 3) - .5) * .7; const r = 640 * eOut(q); w += `<circle cx="${f1(CX - 120 + Math.cos(a) * r)}" cy="${f1(660 + Math.sin(a) * r * .6)}" r="${f1(2 + 7 * q)}" fill="${GOLD2}" opacity="${f1(.9 * (1 - q))}"/>`; }
        w += smokeCloud(t, fill, CX, 900);
      }
      w = cam(w, { z: 1.15 + lt * .08, fx: CX, fy: 980 });
      fx += flashRect(sp ? .4 * (1 - seg(t, D.Sp, D.Sp + .2)) : 0, GOLD2);
    }
    return { world: w, fx };
  },
};

/* 12 – Packshot */
SC.s12 = {
  setup() { D.Ve = wt('vergisst'); },
  sfx() { return [{ t: 0, type: 'shimmer', dur: 3 }, { t: .05, type: 'hit', gain: .5 }]; },
  render(t) {
    let w = `<rect width="1080" height="1920" fill="#030306"/>`;
    for (let i = 0; i < 10; i++) { const a = i * 36 + t * 6; w += `<path d="M${CX} 980 L${f1(CX + Math.cos(a * DEG) * 1400 - 40)} ${f1(980 + Math.sin(a * DEG) * 1400)} L${f1(CX + Math.cos(a * DEG) * 1400 + 40)} ${f1(980 + Math.sin(a * DEG) * 1400)} Z" fill="${GOLD}" opacity=".05"/>`; }
    w += `<ellipse cx="${CX}" cy="1000" rx="520" ry="460" fill="url(#gGold)" opacity=".55"/>`;
    w += smoke(t, CX - 300, 1300, 900, { amp: 120, seed: 2, op: .7 }) + smoke(t, CX + 320, 1300, 800, { amp: 110, seed: 7, op: .6 });
    w += `<ellipse cx="${CX}" cy="1270" rx="420" ry="40" fill="#000" opacity=".7"/><ellipse cx="${CX}" cy="1262" rx="380" ry="24" fill="${GOLD}" opacity=".25" filter="url(#fBlur14)"/>`;
    const pk = eOut(seg(t, 0, .6));
    w += `<g opacity="${f1(pk)}" transform="translate(${CX},1010) scale(${(0.92 + .06 * pk + .02 * t).toFixed(3)})">${productImg(0, 0, 560, 'filter="url(#fShadow)"')}</g>`;
    w += sparkleField(t, 60, .9, 9, [60, 300, 880, 1100]);
    // Titel
    const tk = eOut(seg(t, .2, .9));
    w += `<g opacity="${f1(tk)}" transform="translate(${CX},${f1(470 - 20 * tk)})"><text text-anchor="middle" font-family="Cormorant" font-size="130" font-weight="600" letter-spacing="26" fill="url(#gGoldT)">LASTAR</text></g>`;
    const tk2 = eOut(seg(t, .6, 1.2));
    w += `<g opacity="${f1(tk2)}"><rect x="${CX - 250}" y="530" width="500" height="2" fill="${GOLD}" opacity=".6"/><text x="${CX}" y="600" text-anchor="middle" font-size="44" font-weight="600" letter-spacing="14" fill="${GOLD2}">FOR ONE NIGHT</text></g>`;
    w = cam(w, { z: 1 + .025 * t, fx: CX, fy: 960 });
    return { world: w, fx: `<text x="${CX}" y="1528" text-anchor="middle" font-size="26" font-weight="600" fill="#fff" opacity=".7">Werbung</text>` };
  },
};

/* 13 – CTA */
SC.s13 = {
  setup() { D.Lk = wt('link'); },
  sfx() { return [{ t: D.Lk, type: 'ding' }, { t: 1.2, type: 'pop' }]; },
  render(t) {
    let w = `<rect width="1080" height="1920" fill="#030306"/>`;
    w += `<ellipse cx="${CX}" cy="1050" rx="420" ry="380" fill="url(#gGold)" opacity=".45"/>`;
    w += smoke(t + 5, CX + 10, 1200, 700, { amp: 100, seed: 3, op: .6 });
    w += `<g transform="translate(${CX},1010) scale(${(.72 + .015 * t).toFixed(3)})">${productImg(0, 0, 560, 'filter="url(#fShadow)"')}</g>`;
    w += sparkleField(t, 40, .8, 11, [60, 300, 880, 1100]);
    // Warenkorb-Pill
    const ck = eBack(seg(t, D.Lk, D.Lk + .3));
    w += `<g transform="translate(${CX},1300) scale(${f1(ck)})"><rect x="-190" y="-50" width="380" height="100" rx="50" fill="url(#gGoldT)" filter="url(#fGlowG)"/><text y="16" text-anchor="middle" font-size="44" font-weight="800" fill="#111">🛒 Warenkorb</text></g>`;
    // Kommentar-Frage
    const qk = eBack(seg(t, 1.2, 1.55));
    w += `<g transform="translate(${CX},440) scale(${f1(qk)})"><rect x="-400" y="-150" width="800" height="300" rx="36" fill="#000" fill-opacity=".7" stroke="${GOLD}" stroke-width="4"/>
      <text y="-58" text-anchor="middle" font-size="50" font-weight="800" fill="#fff">Hast du den <tspan fill="${GOLD2}">Hinweis</tspan></text>
      <text y="4" text-anchor="middle" font-size="50" font-weight="800" fill="#fff">gesehen? 👀</text>
      <text y="80" text-anchor="middle" font-size="34" font-weight="600" fill="${GOLD2}">Schreib die Sekunde in die Kommentare</text></g>`;
    w = cam(w, { z: 1 + .02 * t, fx: CX, fy: 960 });
    return { world: w, fx: `<text x="${CX}" y="1528" text-anchor="middle" font-size="26" font-weight="600" fill="#fff" opacity=".7">Werbung</text>` };
  },
};

/* Loop – Iris zurück in den Türspion (identisch mit Frame 0) */
SC.loop = {
  setup() { },
  sfx() { return [{ t: 0, type: 'whoosh', gain: .5 }]; },
  render(t) {
    const k = eIO(t / D.duration);  // 0..1, Ende = exakt Startbild
    const z = 1;  // s01 bei t=0
    let w = `<rect width="1080" height="1920" fill="#000"/>` + peepFrame(0, z);
    // vom Packshot (Gold) ins Schwarz des Türspions
    w += `<rect width="1080" height="1920" fill="#030306" opacity="${f1(1 - k)}"/>`;
    return { world: w, fx: '', noGrainEnd: true };
  },
};

/* ---------- Renderer-API ---------- */
let SCN = null;
window.setup = function (data) {
  D = JSON.parse(JSON.stringify(data));
  if (data.bottle) BOT = data.bottle;
  if (data.product) PROD = data.product;
  SCN = SC[D.id];
  SCN.setup.call(SCN);
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
  world.innerHTML = defs() + r.world;
  const isLoopEnd = D.id === 'loop';
  document.getElementById('fx').innerHTML = defs() + (r.fx || '') + (r.noVig ? '' : vignette(.75)) + (isLoopEnd ? '' : grain(t));
  document.getElementById('subs').innerHTML = subtitles(t, D.words || [], CH, r.subY || 1420, D.duration);
  return true;
};
window.guides = on => document.body.classList.toggle('guides', !!on);
