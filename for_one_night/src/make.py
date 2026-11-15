# -*- coding: utf-8 -*-
"""python3 src/make.py [all|tts|product|manifest|render|audio|final]  ->  for_one_night.mp4"""
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
from script_data import SCENES
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, "build"); FPS = 30


def run(cmd):
    print("$", " ".join(cmd)); subprocess.run(cmd, check=True)


def manifest():
    sc = []
    for s in SCENES:
        d = json.load(open(os.path.join(BUILD, "audio", s["id"] + ".json")))
        sc.append(dict(id=s["id"], duration=round(d["duration"] * FPS) / FPS, words=d["words"]))
    json.dump(dict(scenes=sc), open(os.path.join(BUILD, "manifest.json"), "w"), ensure_ascii=False, indent=1)
    print(f"Gesamt: {sum(s['duration'] for s in sc):.2f} s")


def final():
    m = json.load(open(os.path.join(BUILD, "manifest.json")))
    lst = os.path.join(BUILD, "concat.txt")
    open(lst, "w").write("".join(f"file '{os.path.join(BUILD, 'scenes', s['id'] + '.mp4')}'\n" for s in m["scenes"]))
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", os.path.join(BUILD, "video.mp4")])
    run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(BUILD, "video.mp4"), "-i", os.path.join(BUILD, "mix.wav"), "-map", "0:v", "-map", "1:a",
         "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", "-movflags", "+faststart", os.path.join(ROOT, "for_one_night.mp4")])


if __name__ == "__main__":
    st = sys.argv[1] if len(sys.argv) > 1 else "all"
    if st in ("all", "tts"): run([sys.executable, os.path.join(ROOT, "src", "tts.py")])
    if st in ("all", "product"): run([sys.executable, os.path.join(ROOT, "src", "prep_product.py")])
    if st in ("all", "manifest"): manifest()
    if st in ("all", "render"): run(["node", os.path.join(ROOT, "src", "render.js")] + sys.argv[2:])
    if st in ("all", "audio"): run([sys.executable, os.path.join(ROOT, "src", "audio.py")])
    if st in ("all", "final"): final()
