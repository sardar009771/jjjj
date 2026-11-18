# -*- coding: utf-8 -*-
"""Wort-Zeitstempel der eigenen Aufnahme (faster-whisper) dem Skript zuordnen, auf den Toneinsatz
einrasten und Szenengrenzen festlegen -> build/manifest.json (frame-genau, 30 fps)."""
import difflib, json, os, re, subprocess, sys
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from script_data import SCENES
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); B = os.path.join(ROOT, "build"); FPS = 30; SR = 16000
norm = lambda s: re.sub(r"[^0-9a-zäöüß]", "", s.lower())


def tokens(text):
    out = []
    for raw in text.split():
        w = raw.replace("*", "")
        if not norm(w):
            if out: out[-1]["word"] += " " + w
            continue
        out.append(dict(word=w, key="*" in raw))
    return out


def whisper_words(path):
    cache = os.path.join(B, "whisper_words.json")
    if os.path.exists(cache): return json.load(open(cache))
    os.environ.setdefault("HF_HUB_DISABLE_XET", "1")
    from faster_whisper import WhisperModel
    a = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True).stdout, np.float32)
    segs, _ = WhisperModel("small", compute_type="int8").transcribe(a, language="de", word_timestamps=True)
    ws = [dict(text=w.word.strip(), start=w.start, end=w.end) for s in segs for w in s.words]
    json.dump(ws, open(cache, "w")); return ws


def main():
    path = os.path.join(ROOT, "stimme.mp3")
    bw = whisper_words(path)
    toks, owner = [], []
    for sid, text in SCENES:
        for t in tokens(text): toks.append(t); owner.append(sid)
    A = [norm(t["word"]) for t in toks]; Bn = [norm(b["text"]) for b in bw]
    res = [None] * len(toks)
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, A, Bn, autojunk=False).get_opcodes():
        if op == "equal":
            for k in range(i2 - i1): res[i1 + k] = [bw[j1 + k]["start"], bw[j1 + k]["end"]]
        elif op == "replace":
            st, en = bw[j1]["start"], bw[j2 - 1]["end"]; L = [max(1, len(A[i])) for i in range(i1, i2)]; tot = sum(L); c = 0
            for k, i in enumerate(range(i1, i2)): res[i] = [st + (en - st) * c / tot, st + (en - st) * (c + L[k]) / tot]; c += L[k]
            print("  ersetzt:", [toks[i]["word"] for i in range(i1, i2)], "<-", [bw[j]["text"] for j in range(j1, j2)])
    for i in range(len(res)):
        if res[i] is None:
            p = next((res[k][1] for k in range(i - 1, -1, -1) if res[k]), 0); n = next((res[k][0] for k in range(i + 1, len(res)) if res[k]), p + .3)
            res[i] = [p, max(p + .05, n)]; print("  interpoliert:", toks[i]["word"])
    # Wortanfänge auf echten Toneinsatz einrasten
    a = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True).stdout, np.float32)
    e = np.convolve(np.abs(a), np.ones(160) / 160, "same"); thr = np.percentile(e, 70) * .25
    for r in res:
        i = int(r[0] * SR)
        if i < len(e) and e[i] < thr:
            hit = np.where(e[i:i + int(.3 * SR)] > thr * 2)[0]
            if len(hit): r[0] = (i + hit[0]) / SR - .01; r[1] = max(r[1], r[0] + .08)
    total = len(a) / SR
    # Szenengrenzen: kurz vor dem ersten Wort jeder Szene (in die Pause hinein)
    firsts = {}
    for t, r, o in zip(toks, res, owner): firsts.setdefault(o, (r[0], None))
    ids = [s for s, _ in SCENES]
    lastend = {}
    for r, o in zip(res, owner): lastend[o] = r[1]
    bounds = [0]
    for k in range(1, len(ids)):
        st = firsts[ids[k]][0]; pe = lastend[ids[k - 1]]
        cut = max(pe + .05, st - min(.3, (st - pe) * .6))
        bounds.append(round(cut * FPS))
    bounds.append(round((total + .8) * FPS))
    scenes = []
    for k, sid in enumerate(ids):
        b0, b1 = bounds[k], bounds[k + 1]
        ws = [dict(word=t["word"], key=t["key"], spk="W", start=round(r[0] - b0 / FPS, 3), end=round(r[1] - b0 / FPS, 3)) for t, r, o in zip(toks, res, owner) if o == sid]
        scenes.append(dict(id=sid, start=b0 / FPS, duration=(b1 - b0) / FPS, words=ws))
        print(f"{sid}: {b0 / FPS:6.2f}s  +{(b1 - b0) / FPS:.2f}s  {' '.join(w['word'] for w in ws)}")
    json.dump(dict(scenes=scenes, audio_total=total), open(os.path.join(B, "manifest.json"), "w"), ensure_ascii=False, indent=1)
    print(f"Gesamt {bounds[-1] / FPS:.2f}s (Stimme {total:.2f}s)")


if __name__ == "__main__":
    main()
