# -*- coding: utf-8 -*-
"""Stellt die drei Dosen aus produkt.png frei (GrabCut, initialisiert mit Ellipsen je Dose).
Ausgabe: build/tins.png (alle drei) + build/tin_watermelon.png / tin_strawberry.png / tin_blueberry.png"""
import os
import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = os.path.join(ROOT, "build"); os.makedirs(B, exist_ok=True)
img = cv2.imread(os.path.join(ROOT, "produkt.png"))
H, W = img.shape[:2]
TINS = {"watermelon": (222, 228, 184, 180), "strawberry": (590, 205, 180, 178), "blueberry": (957, 196, 184, 179)}

full = np.zeros((H, W), np.uint8)
for name, (cx, cy, rx, ry) in TINS.items():
    mask = np.full((H, W), cv2.GC_BGD, np.uint8)
    cv2.ellipse(mask, (cx, cy), (rx + 18, ry + 22), 0, 0, 360, cv2.GC_PR_BGD, -1)
    cv2.ellipse(mask, (cx, cy), (rx - 4, ry - 4), 0, 0, 360, cv2.GC_PR_FGD, -1)
    cv2.ellipse(mask, (cx, cy), (rx - 40, ry - 40), 0, 0, 360, cv2.GC_FGD, -1)
    bg, fg = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(img, mask, None, bg, fg, 6, cv2.GC_INIT_WITH_MASK)
    m = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    # nur die zusammenhängende Komponente, die die Dosenmitte enthält
    n, lab = cv2.connectedComponents(m)
    m = np.where(lab == lab[cy, cx], 255, 0).astype(np.uint8)
    # Deckelrand (weiß auf hellgrau) ergänzt die Ellipse; GrabCut liefert die Seitenwand unten
    ell = np.zeros_like(m); cv2.ellipse(ell, (cx, cy), (rx - 2, ry - 2), 0, 0, 360, 255, -1)
    m = np.maximum(m, ell)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    a = cv2.GaussianBlur(m, (5, 5), 1.2)
    full = np.maximum(full, a)
    rgba = np.dstack([img, a])
    x, y, w, h = cv2.boundingRect(m)
    cv2.imwrite(os.path.join(B, f"tin_{name}.png"), rgba[y:y + h, x:x + w])
rgba = np.dstack([img, full])
x, y, w, h = cv2.boundingRect((full > 20).astype(np.uint8))
cv2.imwrite(os.path.join(B, "tins.png"), rgba[y:y + h, x:x + w])
print("ok")
