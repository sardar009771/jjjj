# -*- coding: utf-8 -*-
"""Stellt produkt.png frei (heller Studio-Hintergrund -> transparent).
Ausgabe: build/product.png (Flasche + Box) und build/bottle.png (nur Flasche)."""
import os
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = os.path.join(ROOT, "build")
os.makedirs(B, exist_ok=True)


def connected_bg(mask):
    bg = np.zeros_like(mask)
    bg[0, :] = mask[0, :]; bg[-1, :] = mask[-1, :]; bg[:, 0] = mask[:, 0]; bg[:, -1] = mask[:, -1]
    while True:
        g = bg.copy()
        g[1:, :] |= bg[:-1, :]; g[:-1, :] |= bg[1:, :]; g[:, 1:] |= bg[:, :-1]; g[:, :-1] |= bg[:, 1:]
        g &= mask
        if (g == bg).all():
            return bg
        bg = g


def main():
    im = Image.open(os.path.join(ROOT, "produkt.png")).convert("RGB")
    a = np.asarray(im).astype(np.float32)
    mx, mn = a.max(axis=2), a.min(axis=2)
    # heller, ungesättigter Hintergrund (Studio-Weiß + Bodenspiegelung); Goldkanten bleiben (gesättigt)
    light = (mn > 196) & ((mx - mn) < 28)
    bg = connected_bg(light)
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    al = Image.fromarray(alpha, "L").filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.0))
    al = np.asarray(al).astype(np.float32)
    # Kantenpixel: Deckkraft aus Dunkelheit (helle Halo-Reste werden transparent)
    edge = (al > 0) & (al < 255)
    dark = np.clip((252 - mn) / 60, 0, 1) * 255
    al = np.where(edge, np.minimum(al, dark + 40), al)
    # Bodenreflexion unter den Objekten abschneiden (Fotostudio-Spiegelung)
    rgba = np.dstack([a, al]).astype(np.uint8)
    out = Image.fromarray(rgba, "RGBA")
    bbox = out.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox()
    out = out.crop(bbox)
    out.save(os.path.join(B, "product.png"))
    # Nur die Flasche (rechter Teil), Box-Reste ausblenden
    x0, y0 = bbox[0], bbox[1]
    arr = np.asarray(out).copy()
    H, W = arr.shape[:2]
    xs = np.arange(W)[None, :] + x0
    ys = np.arange(H)[:, None] + y0
    keep = (xs >= 596) & ~((xs < 640) & (ys < 420))
    arr[..., 3] = np.where(keep, arr[..., 3], 0)
    bot = Image.fromarray(arr, "RGBA")
    bb = bot.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox()
    bot.crop(bb).save(os.path.join(B, "bottle.png"))
    print("product", out.size, "bottle", bot.crop(bb).size)


if __name__ == "__main__":
    main()
