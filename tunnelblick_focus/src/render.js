// Rendert Szenen Frame für Frame mit Playwright (Chromium) und kodiert sie mit ffmpeg.
//   node render.js --product                 -> Platzhalter-Produktbild
//   node render.js --test d1:1.2,d30:1.9     -> Test-Frames als PNG (build/test)
//   node render.js [--only id1,id2]          -> Szenen-MP4s (build/scenes)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BUILD = path.join(ROOT, 'build');
const FPS = 30;
const args = process.argv.slice(2);
const arg = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };

function pngSize(p) {
  const b = fs.readFileSync(p);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

async function newPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(__dirname, 'stage.html'));
  await page.evaluate(async () => {
    await Promise.all(['600', '700', '800', '900'].map(w => document.fonts.load(`${w} 50px Poppins`)));
    await document.fonts.load('50px "Noto Color Emoji"', '💪🛒');
    await document.fonts.ready;
  });
  for (const src of ['../build/tins.png', '../build/tin_watermelon.png', '../build/tin_strawberry.png', '../build/tin_blueberry.png'])
    await page.evaluate(src => new Promise(r => { const i = new Image(); i.onload = r; i.onerror = r; i.src = src; }), src);
  await page.evaluate(async () => { for (const w of ['500', '600', '700']) await document.fonts.load(`${w} 50px Cormorant`); });
  return page;
}

function sceneData(s, prod) { return Object.assign({}, s, prod); }

async function renderScene(page, s, prod) {
  await page.evaluate(d => window.setup(d), sceneData(s, prod));
  const info = await page.evaluate(() => window.info());
  fs.writeFileSync(path.join(BUILD, 'scenes', s.id + '.sfx.json'), JSON.stringify(info.sfx, null, 1));
  const n = Math.round(s.duration * FPS);
  const out = path.join(BUILD, 'scenes', s.id + '.mp4');
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-g', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg ' + c))));
  const t0 = Date.now();
  for (let f = 0; f < n; f++) {
    await page.evaluate(t => window.renderFrame(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await done;
  console.log(`  ${s.id}: ${n} Frames in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}

(async () => {
  const browser = await chromium.launch();
  const manifest = JSON.parse(fs.readFileSync(path.join(BUILD, 'manifest.json'), 'utf8'));
  const dim = n => { const z = pngSize(path.join(BUILD, n + '.png')); return { w: z.w, h: z.h }; };
  const prod = { tins: { all: dim('tins'), watermelon: dim('tin_watermelon'), strawberry: dim('tin_strawberry'), blueberry: dim('tin_blueberry') } };
  fs.mkdirSync(path.join(BUILD, 'scenes'), { recursive: true });

  const test = arg('--test');
  if (test) {
    fs.mkdirSync(path.join(BUILD, 'test'), { recursive: true });
    const page = await newPage(browser);
    if (args.includes('--guides')) await page.evaluate(() => window.guides(true));
    for (const item of test.split(',')) {
      const [id, ts] = item.split(':');
      const s = manifest.scenes.find(x => x.id === id);
      await page.evaluate(d => window.setup(d), sceneData(s, prod));
      await page.evaluate(t => window.renderFrame(t), parseFloat(ts));
      const p = path.join(BUILD, 'test', `${id}_${ts}.png`);
      await page.screenshot({ path: p });
      console.log(p);
    }
    await browser.close();
    return;
  }

  const only = arg('--only');
  const list = manifest.scenes.filter(s => !only || only.split(',').includes(s.id));
  const workers = parseInt(arg('--workers') || '3', 10);
  // längste zuerst für bessere Auslastung
  const queue = list.slice().sort((a, b) => b.duration - a.duration);
  const T0 = Date.now();
  await Promise.all(Array.from({ length: Math.min(workers, queue.length) }, async () => {
    const page = await newPage(browser);
    while (queue.length) await renderScene(page, queue.shift(), prod);
  }));
  console.log(`Fertig in ${((Date.now() - T0) / 1000).toFixed(1)} s`);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
