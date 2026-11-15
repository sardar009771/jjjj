# -*- coding: utf-8 -*-
"""Stellt produkt.png frei (schwarzer Hintergrund -> transparent) und speichert build/product.png.
Fehlt produkt.png, wird ein Vektor-Platzhalter (src/product_fallback.html) per Playwright gerendert."""
import os, subprocess, sys
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "produkt.png")
OUT = os.path.join(ROOT, "build", "product.png")
os.makedirs(os.path.dirname(OUT), exist_ok=True)


def cutout(path):
    im = Image.open(path).convert("RGB")
    a = np.asarray(im).astype(np.float32)
    lum = a.max(axis=2)
    # Nur schwarze Bereiche, die mit dem Bildrand verbunden sind (dunkle Dose bleibt erhalten)
    dark = lum < 110  # weißer Beutel -> auch den grauen Schattenrand entfernen
    # Hintergrund = dunkle Pixel, die mit dem Bildrand verbunden sind (iterative Dilatation)
    bg = np.zeros_like(dark)
    bg[0, :] = dark[0, :]; bg[-1, :] = dark[-1, :]; bg[:, 0] = dark[:, 0]; bg[:, -1] = dark[:, -1]
    while True:
        g = bg.copy()
        g[1:, :] |= bg[:-1, :]; g[:-1, :] |= bg[1:, :]; g[:, 1:] |= bg[:, :-1]; g[:, :-1] |= bg[:, 1:]
        g &= dark
        if (g == bg).all():
            break
        bg = g
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    # weiche Kante: im Randbereich Alpha aus Helligkeit ableiten (Anti-Aliasing erhalten)
    al = Image.fromarray(alpha, "L").filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    al = np.asarray(al).astype(np.float32)
    soft = np.clip((lum - 110) / 80.0, 0, 1) * 255
    edge = (al > 0) & (al < 255)
    al = np.where(edge, np.maximum(al * 0.5, np.minimum(soft, al + 60)), al)
    rgba = np.dstack([a, al]).astype(np.uint8)
    out = Image.fromarray(rgba, "RGBA")
    bbox = out.getchannel("A").point(lambda v: 255 if v > 10 else 0).getbbox()
    out = out.crop(bbox)
    out.save(OUT)
    print("freigestellt:", out.size)


if __name__ == "__main__":
    if os.path.exists(SRC):
        cutout(SRC)
    else:
        print("produkt.png fehlt -> Vektor-Platzhalter")
        subprocess.run(["node", os.path.join(ROOT, "src", "render.js"), "--product"], check=True)
