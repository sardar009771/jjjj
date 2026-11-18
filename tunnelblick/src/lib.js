/* Gemeinsame Bibliothek (aus dem For-One-Night-Projekt übernommen): Utils, Gesichter, Hände, Rauch/Partikel, Effekte, Untertitel */
'use strict';
const W = 1080, H = 1920, CX = 495;
const GOLD = '#D2EE4E', GOLD2 = '#EEFFAA', GOLD3 = '#6F8420';  // hier: Energie-Limette (Sorte Energy Drink)
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
let BOT = { w: 1, h: 1 }, PROD = { w: 1, h: 1 };

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

