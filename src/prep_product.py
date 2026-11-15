# -*- coding: utf-8 -*-
"""Stellt produkt.png frei (schwarzer Hintergrund -> transparent) und speichert build/product.png.
Fehlt produkt.png, wird ein Vektor-Platzhalter (src/product_fallback.html) per Playwright gerendert."""
import os, subprocess, sys
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "produkt.png")
OUT = os.path.join(ROOT, "build", "product.png")
os.makedirs(os.path.dirname(OUT), exist_ok=True)


def cutout(path):
    im = Image.open(path).convert("RGB")
    a = np.asarray(im).astype(np.float32)
    lum = a.max(axis=2)
    # Nur schwarze Bereiche, die mit dem Bildrand verbunden sind (dunkle Dose bleibt erhalten)
    dark = (lum < 40).astype(np.uint8) * 255
    mask = Image.fromarray(dark, "L")
    w, h = mask.size
    for seed in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]:
        if mask.getpixel(seed) == 255:
            ImageDraw.floodfill(mask, seed, 128)
    bg = (np.asarray(mask) == 128)
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    # weiche Kante: im Randbereich Alpha aus Helligkeit ableiten (Anti-Aliasing erhalten)
    al = Image.fromarray(alpha, "L").filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    al = np.asarray(al).astype(np.float32)
    soft = np.clip((lum - 8) / 50.0, 0, 1) * 255
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
