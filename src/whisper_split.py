# -*- coding: utf-8 -*-
"""Nur aktiv, wenn stimme.mp3 im Projektordner liegt.
Whisper (faster-whisper oder openai-whisper) liefert Wort-Zeitstempel; diese werden dem Skript
(Hook A + alle Szenen, in Reihenfolge) zugeordnet und die Aufnahme an den Szenengrenzen geschnitten.
Hooks B/C werden dann nicht neu vertont (gleiche Aufnahme -> nur Variante A ist vertont)."""
import json, os
import numpy as np
from tts import OUT, SR, PAD, tokens_of, align, decode, write_wav, norm
from script_data import HOOKS, SCENES, SAY


def transcribe(path):
    try:
        from faster_whisper import WhisperModel
        model = WhisperModel("small", compute_type="int8")
        segs, _ = model.transcribe(path, language="de", word_timestamps=True)
        return [dict(text=w.word.strip(), start=w.start, end=w.end) for s in segs for w in s.words]
    except ImportError:
        import whisper
        r = whisper.load_model("small").transcribe(path, language="de", word_timestamps=True)
        return [dict(text=w["word"].strip(), start=w["start"], end=w["end"]) for s in r["segments"] for w in s["words"]]


def run(path):
    pcm = decode(path)
    bounds = transcribe(path)
    plan = [("hookA", HOOKS["A"]["text"], None)] + [(s["id"], s["text"], s.get("fixed")) for s in SCENES]
    toks, owner = [], []
    for sid, text, _ in plan:
        for seg in (text or "").split("|"):
            for t in tokens_of(seg):
                if norm(t["word"]):
                    t["say"] = t["word"]
                    toks.append(t); owner.append(sid)
    words = align(toks, bounds)
    for (sid, text, fixed) in plan:
        ws = [w for w, o in zip(words, owner) if o == sid]
        if not ws:
            dur = fixed or 0.9
            write_wav(os.path.join(OUT, sid + ".wav"), np.zeros(int(dur * SR), np.float32))
            json.dump(dict(id=sid, duration=dur, words=[]), open(os.path.join(OUT, sid + ".json"), "w"))
            continue
        a, b = max(0, ws[0]["start"] - .04), ws[-1]["end"] + .1
        seg = pcm[int(a * SR):int(b * SR)]
        for w in ws:
            w["start"] = round(w["start"] - a, 3); w["end"] = round(w["end"] - a, 3)
        dur = len(seg) / SR + PAD
        seg = np.concatenate([seg, np.zeros(int(PAD * SR), np.float32)])
        write_wav(os.path.join(OUT, sid + ".wav"), seg)
        json.dump(dict(id=sid, duration=round(dur, 3), words=ws), open(os.path.join(OUT, sid + ".json"), "w"), ensure_ascii=False)
        print(sid, f"{dur:.2f}s")
