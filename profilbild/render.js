// Rendert die Profilbild-Varianten als 1080x1080 PNG + Vorschau (rund, groß und klein wie in TikTok)
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 3300 } });
  await p.goto('file://' + path.join(__dirname, 'profilbild.html'));
  await p.evaluate(async () => { for (const w of ['700', '800', '900']) await document.fonts.load(`${w} 50px Poppins`); await document.fonts.ready; });
  for (const id of ['v1', 'v2', 'v3']) await p.locator('#' + id).screenshot({ path: path.join(__dirname, `profilbild_${id}.png`) });
  await b.close();
})();
