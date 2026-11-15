# -*- coding: utf-8 -*-
"""Erzeugt pro Szene eine Sprachdatei + Wort-Zeitstempel.

- Liegt stimme.mp3 im Projektordner: Whisper-Wortzeitstempel (faster-whisper / openai-whisper)
  und Aufteilung in Szenen anhand des Skripts.
- Sonst: edge-tts (de-DE-ConradNeural, +10 %), eine Datei pro Szene, Wort-Grenzen aus edge-tts.
Ausgabe: build/audio/<id>.wav (48 kHz mono) + build/audio/<id>.json
"""
import asyncio, json, os, re, subprocess, sys, hashlib
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from script_data import VOICE, RATE, PAD, SAY, HOOKS, SCENES

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "build", "audio")
SR = 48000
os.makedirs(OUT, exist_ok=True)


def norm(s):
    return re.sub(r"[^0-9a-zäöüß]", "", s.lower())


def tokens_of(segment_text):
    """-> list of dict(word, key) ; '…' wird an das vorige Wort gehängt."""
    toks = []
    for raw in segment_text.split():
        key = "*" in raw
        w = raw.replace("*", "")
        if not norm(w):  # reine Satzzeichen (z.B. …)
            if toks:
                toks[-1]["word"] += " " + w if w == "…" else w
            else:
                toks.append(dict(word=w, key=False, lead=True))
            continue
        toks.append(dict(word=w, key=bool(key)))
    return toks


def decode(path):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, dtype=np.float32).copy()


async def edge_segment(text, mp3_path):
    import edge_tts
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    com = edge_tts.Communicate(text, VOICE, rate=RATE, boundary="WordBoundary", proxy=proxy)
    bounds, audio = [], bytearray()
    async for chunk in com.stream():
        if chunk["type"] == "audio":
            audio += chunk["data"]
        elif chunk["type"] == "WordBoundary":
            bounds.append(dict(text=chunk["text"], start=chunk["offset"] / 1e7 + EDGE_LAT,
                               end=(chunk["offset"] + chunk["duration"]) / 1e7 + EDGE_LAT))
    with open(mp3_path, "wb") as f:
        f.write(audio)
    return bounds


def align(toks, bounds):
    """Ordnet Wortgrenzen den Untertitel-Wörtern zu (zeichengenau interpoliert,
    funktioniert auch wenn die TTS mehrere Wörter in einer Grenze zusammenfasst)."""
    times = []  # (t_start, t_end) pro normalisiertem Zeichen
    for b in bounds:
        nb = norm(b["text"])
        n = max(1, len(nb))
        for k in range(len(nb)):
            times.append((b["start"] + (b["end"] - b["start"]) * k / n,
                          b["start"] + (b["end"] - b["start"]) * (k + 1) / n))
    out, pos = [], 0
    total = sum(len(norm(t["say"])) for t in toks)
    if total != len(times):
        print(f"   [align] Zeichenzahl abweichend {total} vs {len(times)} -> proportional")
    for t in toks:
        n = len(norm(t["say"]))
        if n == 0:
            continue
        a = min(int(pos * len(times) / total), len(times) - 1)
        b = min(int((pos + n) * len(times) / total) - 1, len(times) - 1)
        out.append(dict(word=t["word"], key=t["key"], start=times[a][0], end=times[max(a, b)][1]))
        pos += n
    return out


# edge-tts-MP3s beginnen ~80 ms später als die gemeldeten Wortgrenzen (Encoder-Delay, gemessen)
EDGE_LAT = 0.09
MAXGAP = 0.17  # lange Satzpausen werden auf diesen Wert gekürzt (Jump-Cut-Tempo)


def tighten(pcm, words):
    """Schneidet Pausen nach Satzende (. ! ?) auf MAXGAP zusammen."""
    pieces, cut, last = [], 0.0, 0
    for i in range(len(words) - 1):
        w, nx = words[i], words[i + 1]
        gap = nx["start"] - w["end"]
        if gap > MAXGAP + 0.02 and w["word"].rstrip()[-1:] in ".!?:" and not w["word"].endswith("…"):
            a = w["end"] + MAXGAP / 2
            b = nx["start"] - MAXGAP / 2
            ia, ib = int(a * SR), int(b * SR)
            seg = pcm[last:ia].copy()
            f = int(0.006 * SR); seg[-f:] *= np.linspace(1, 0, f)
            pieces.append(seg)
            last = ib
            removed = b - a
            for v in words[i + 1:]:
                v["start"] -= removed; v["end"] -= removed
    seg = pcm[last:].copy()
    if pieces:
        f = int(0.006 * SR); seg[:f] *= np.linspace(0, 1, f)
    pieces.append(seg)
    return np.concatenate(pieces), words


def shorten_silences(pcm, words, min_len=0.42, keep=0.30):
    """Kürzt nur echte Stille (Energie gemessen, nicht Wortgrenzen) zwischen Sätzen auf `keep` Sekunden.
    Wörter werden dabei nie angeschnitten; Übergänge mit kurzem Crossfade."""
    e = np.convolve(np.abs(pcm), np.ones(480) / 480, "same")
    quiet = e < 0.004
    runs, i, n = [], 0, len(pcm)
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]:
                j += 1
            if (j - i) / SR > min_len and i > 0 and j < n:
                runs.append((i, j))
            i = j
        else:
            i += 1
    if not runs:
        return pcm, words
    out, pos, xf = [], 0, int(0.015 * SR)
    removed_total = 0
    for (i, j) in runs:
        cut_a = i + int(keep / 2 * SR)
        cut_b = j - int(keep / 2 * SR)
        out.append(pcm[pos:cut_a])
        pos = cut_b
        rem = (cut_b - cut_a) / SR
        # Zeitverschiebung für alle Wörter nach diesem Schnitt
        for w in words:
            if w.get("_orig") is None:
                w["_orig"] = w["start"]
            if w["_orig"] * SR >= cut_b - int(0.05 * SR):
                w["start"] -= rem; w["end"] -= rem
        removed_total += rem
    out.append(pcm[pos:])
    res = out[0]
    for seg in out[1:]:
        k = min(xf, len(res), len(seg))
        fade = np.linspace(0, 1, k, dtype=np.float32)
        res = np.concatenate([res[:-k], res[-k:] * (1 - fade) + seg[:k] * fade, seg[k:]])
    for w in words:
        w.pop("_orig", None)
    return res, words


def build_scene(sid, text, pauses, fixed=None):
    jpath = os.path.join(OUT, sid + ".json")
    wpath = os.path.join(OUT, sid + ".wav")
    sig = hashlib.md5(json.dumps([text, pauses, fixed, VOICE, RATE, SAY, PAD]).encode()).hexdigest()
    if os.path.exists(jpath) and os.path.exists(wpath):
        if json.load(open(jpath)).get("sig") == sig:
            return json.load(open(jpath))
    words, chunks, cursor = [], [], 0.0
    if text:
        segs = [s.strip() for s in text.split("|")]
        for si, seg in enumerate(segs):
            toks = tokens_of(seg)
            for t in toks:
                t["say"] = SAY.get(t["word"], t["word"])
            say = " ".join(t["say"] for t in toks)
            mp3 = os.path.join(OUT, f"{sid}_{si}.mp3")
            for attempt in range(4):
                try:
                    bounds = asyncio.run(edge_segment(say, mp3))
                    break
                except Exception as e:  # Netzwerk: Retry
                    print("   retry", e)
            pcm = decode(mp3)
            a = align(toks, bounds)
            pcm, a = shorten_silences(pcm, a)
            # Kein Herausschneiden von Pausen mehr (vermeidet abgehackte Wörter):
            # nur Stille am Anfang/Ende anhand der Signalenergie entfernen, mit großzügigem Ausklang.
            e = np.convolve(np.abs(pcm), np.ones(240) / 240, "same")
            loud = np.where(e > 0.006)[0]
            first = min(a[0]["start"], loud[0] / SR) if len(loud) else a[0]["start"]
            last = max(a[-1]["end"], loud[-1] / SR) if len(loud) else a[-1]["end"]
            lead = max(0.0, first - 0.05)
            tail = min(len(pcm) / SR, last + 0.18)
            seg_pcm = pcm[int(lead * SR):int(tail * SR)]
            # weicher Fade am Rand
            f = min(len(seg_pcm), int(0.01 * SR))
            seg_pcm[:f] *= np.linspace(0, 1, f); seg_pcm[-f:] *= np.linspace(1, 0, f)
            for w in a:
                w["start"] = round(w["start"] - lead + cursor, 3)
                w["end"] = round(w["end"] - lead + cursor, 3)
                words.append(w)
            chunks.append(seg_pcm)
            cursor += len(seg_pcm) / SR
            if si < len(segs) - 1:
                gap = pauses[si] if si < len(pauses) else 0.2
                chunks.append(np.zeros(int(gap * SR), np.float32))
                cursor += gap
    voice = np.concatenate(chunks) if chunks else np.zeros(0, np.float32)
    dur = fixed if fixed else len(voice) / SR + PAD
    voice = np.concatenate([voice, np.zeros(max(0, int(round(dur * SR)) - len(voice)), np.float32)])
    write_wav(wpath, voice)
    data = dict(id=sid, sig=sig, duration=round(dur, 3), words=words)
    json.dump(data, open(jpath, "w"), ensure_ascii=False, indent=1)
    return data


def write_wav(path, x):
    x16 = (np.clip(x, -1, 1) * 32767).astype("<i2")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-", path],
                   input=x16.tobytes(), check=True)


def main():
    stimme = os.path.join(ROOT, "stimme.mp3")
    if os.path.exists(stimme):
        import whisper_split  # eigene Datei, nur genutzt wenn stimme.mp3 vorhanden
        whisper_split.run(stimme)
        return
    total = 0
    for k, h in HOOKS.items():
        d = build_scene("hook" + k, h["text"], h["pauses"])
        print(f"hook{k}: {d['duration']:.2f}s")
    for s in SCENES:
        d = build_scene(s["id"], s["text"], s["pauses"], s.get("fixed"))
        total += d["duration"]
        print(f"{s['id']}: {d['duration']:.2f}s  " + " ".join(w["word"] for w in d["words"]))
    print(f"Hauptteil gesamt: {total:.2f}s")


if __name__ == "__main__":
    main()
