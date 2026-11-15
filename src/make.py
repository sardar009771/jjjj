# -*- coding: utf-8 -*-
"""Orchestrierung:  python3 src/make.py [all|manifest|render|audio|final|test]

1. tts.py          -> Sprachdateien + Wort-Zeitstempel pro Szene
2. prep_product.py -> freigestelltes Produktbild
3. manifest        -> build/manifest.json (Szenen, auf Frames quantisierte Dauer)
4. render.js       -> eine MP4 pro Szene (Hooks A/B/C einzeln, Rest nur einmal)
5. audio.py        -> Musik + SFX + Stimme pro Variante
6. final           -> concat der Szenen + Ton -> creatin_A/B/C.mp4
"""
import json, os, subprocess, sys

sys.path.insert(0, os.path.dirname(__file__))
from script_data import HOOKS, SCENES

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, "build")
FPS = 30


def run(cmd, **kw):
    print("$", " ".join(cmd))
    subprocess.run(cmd, check=True, **kw)


def manifest():
    scenes = []
    for k, h in HOOKS.items():
        d = json.load(open(os.path.join(BUILD, "audio", f"hook{k}.json")))
        scenes.append(dict(id=f"hook{k}", kind="hook", day=100, duration=round(d["duration"] * FPS) / FPS,
                           words=d["words"], extra=dict(rewind_word=h["rewind_word"], stutter_day=h["stutter_day"], stutter_word=h["stutter_word"])))
    for s in SCENES:
        d = json.load(open(os.path.join(BUILD, "audio", f"{s['id']}.json")))
        scenes.append(dict(id=s["id"], kind=s["id"], day=s["day"], duration=round(d["duration"] * FPS) / FPS, words=d["words"]))
    m = dict(scenes=scenes, main=[s["id"] for s in SCENES], hooks=list(HOOKS))
    json.dump(m, open(os.path.join(BUILD, "manifest.json"), "w"), ensure_ascii=False, indent=1)
    for k in HOOKS:
        tot = sum(s["duration"] for s in scenes if s["id"] == f"hook{k}" or s["id"] in m["main"])
        print(f"Variante {k}: {tot:.2f} s")
    return m


def final():
    m = json.load(open(os.path.join(BUILD, "manifest.json")))
    os.makedirs(os.path.join(ROOT, "output"), exist_ok=True)
    for k in m["hooks"]:
        lst = os.path.join(BUILD, f"concat_{k}.txt")
        with open(lst, "w") as f:
            for sid in [f"hook{k}"] + m["main"]:
                f.write(f"file '{os.path.join(BUILD, 'scenes', sid + '.mp4')}'\n")
        silent = os.path.join(BUILD, f"video_{k}.mp4")
        run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", silent])
        out = os.path.join(ROOT, "output", f"creatin_{k}.mp4")
        run(["ffmpeg", "-v", "error", "-y", "-i", silent, "-i", os.path.join(BUILD, f"mix_{k}.wav"),
             "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
             "-shortest", "-movflags", "+faststart", out])
        print("->", out)


if __name__ == "__main__":
    step = sys.argv[1] if len(sys.argv) > 1 else "all"
    if step in ("all", "tts"):
        run([sys.executable, os.path.join(ROOT, "src", "tts.py")])
    if step in ("all", "product"):
        run([sys.executable, os.path.join(ROOT, "src", "prep_product.py")])
    if step in ("all", "manifest"):
        manifest()
    if step in ("all", "render"):
        run(["node", os.path.join(ROOT, "src", "render.js")] + sys.argv[2:])
    if step in ("all", "audio"):
        run([sys.executable, os.path.join(ROOT, "src", "audio.py")])
    if step in ("all", "final"):
        final()
