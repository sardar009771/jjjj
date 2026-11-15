# -*- coding: utf-8 -*-
"""Sprachdateien + Wort-Zeitstempel pro Szene -> build/audio/<id>.wav/.json

- Liegt stimme.mp3 im Projektordner: faster-whisper liefert Wort-Zeitstempel, Aufteilung anhand des Skripts.
- Sonst edge-tts: Erzählerin de-DE-KatjaNeural (+5 %), Männer de-DE-ConradNeural.
  {AB}-Zeilen (beide Männer gleichzeitig) werden gedoppelt: zweite Spur minimal verstimmt + 18 ms versetzt.
Keine Schnitte an Wortgrenzen: nur echte Stille (Energie) wird gekürzt -> keine abgehackten Wörter.
"""
import asyncio, json, os, re, subprocess, sys, hashlib
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from script_data import VOICE_W, RATE_W, PITCH_W, VOICE_M, RATE_M, PITCH_M, PAD, SAY, SCENES

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "build", "audio")
SR = 48000
EDGE_LAT = 0.09   # edge-tts-MP3 beginnt ~90 ms nach der gemeldeten Wortgrenze (gemessen)
os.makedirs(OUT, exist_ok=True)


def norm(s):
    return re.sub(r"[^0-9a-zäöüß]", "", s.lower())


def tokens_of(seg):
    toks = []
    for raw in seg.split():
        w = raw.replace("*", "")
        if not norm(w):
            if toks:
                toks[-1]["word"] += (" " if w in ("…", "–") else "") + w
            continue
        toks.append(dict(word=w, key="*" in raw))
    return toks


def decode(path):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32).copy()


def write_wav(path, x):
    x16 = (np.clip(x, -1, 1) * 32767).astype("<i2")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-", path],
                   input=x16.tobytes(), check=True)


async def edge_segment(text, voice, rate, pitch, mp3):
    import edge_tts
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    com = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary", proxy=proxy)
    bounds, audio = [], bytearray()
    async for ch in com.stream():
        if ch["type"] == "audio":
            audio += ch["data"]
        elif ch["type"] == "WordBoundary":
            bounds.append(dict(text=ch["text"], start=ch["offset"] / 1e7 + EDGE_LAT,
                               end=(ch["offset"] + ch["duration"]) / 1e7 + EDGE_LAT))
    open(mp3, "wb").write(audio)
    return bounds


def align(toks, bounds):
    """Zeichengenaue Interpolation (TTS fasst manchmal mehrere Wörter zu einer Grenze zusammen)."""
    times = []
    for b in bounds:
        nb = norm(b["text"]); n = max(1, len(nb))
        for k in range(len(nb)):
            times.append((b["start"] + (b["end"] - b["start"]) * k / n, b["start"] + (b["end"] - b["start"]) * (k + 1) / n))
    total = sum(len(norm(t["say"])) for t in toks)
    out, pos = [], 0
    for t in toks:
        n = len(norm(t["say"]))
        a = min(int(pos * len(times) / total), len(times) - 1)
        b = min(int((pos + n) * len(times) / total) - 1, len(times) - 1)
        out.append(dict(word=t["word"], key=t["key"], start=times[a][0], end=times[max(a, b)][1]))
        pos += n
    return out


def shorten_silences(pcm, words, min_len=0.5, keep=0.34):
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
    orig = [w["start"] for w in words]
    parts, pos = [], 0
    for (i, j) in runs:
        ca, cb = i + int(keep / 2 * SR), j - int(keep / 2 * SR)
        parts.append(pcm[pos:ca]); pos = cb
        rem = (cb - ca) / SR
        for w, o in zip(words, orig):
            if o * SR >= cb - int(0.05 * SR):
                w["start"] -= rem; w["end"] -= rem
    parts.append(pcm[pos:])
    res, xf = parts[0], int(0.015 * SR)
    for p in parts[1:]:
        k = min(xf, len(res), len(p)); f = np.linspace(0, 1, k, dtype=np.float32)
        res = np.concatenate([res[:-k], res[-k:] * (1 - f) + p[:k] * f, p[k:]])
    return res, words


def snap_onsets(pcm, words):
    e = np.convolve(np.abs(pcm), np.ones(480) / 480, "same")
    for w in words:
        i = int(w["start"] * SR)
        if i < len(e) and e[i] < 0.01:
            hit = np.where(e[i:i + int(0.3 * SR)] > 0.02)[0]
            if len(hit):
                w["start"] = round((i + hit[0]) / SR - 0.01, 3); w["end"] = max(w["end"], w["start"] + 0.08)


def double_voice(x):
    """Zwei identische Männer sprechen gleichzeitig: zweite Spur 1,5 % tiefer, 18 ms später."""
    n = len(x); idx = np.arange(n) * 0.985
    y = np.interp(idx, np.arange(n), x).astype(np.float32)
    d = int(0.018 * SR)
    y = np.concatenate([np.zeros(d, np.float32), y])[:n]
    return (x * 0.62 + y * 0.55).astype(np.float32)


def build_scene(s):
    sid, text, pauses = s["id"], s["text"], s.get("pauses", [])
    jpath, wpath = os.path.join(OUT, sid + ".json"), os.path.join(OUT, sid + ".wav")
    sig = hashlib.md5(json.dumps([s, VOICE_W, RATE_W, PITCH_W, VOICE_M, RATE_M, PITCH_M, SAY, PAD, EDGE_LAT]).encode()).hexdigest()
    if os.path.exists(jpath) and os.path.exists(wpath) and json.load(open(jpath)).get("sig") == sig:
        return json.load(open(jpath))
    words, chunks, cursor = [], [], 0.0
    segs = [x.strip() for x in text.split("|")] if text else []
    for si, seg in enumerate(segs):
        spk = "W"
        m = re.match(r"\{(W|B|AB)\}\s*", seg)
        if m:
            spk, seg = m.group(1), seg[m.end():]
        toks = tokens_of(seg)
        for t in toks:
            t["say"] = SAY.get(t["word"], t["word"])
        say = " ".join(t["say"] for t in toks)
        voice, rate, pitch = (VOICE_W, RATE_W, PITCH_W) if spk == "W" else (VOICE_M, RATE_M, PITCH_M)
        mp3 = os.path.join(OUT, f"{sid}_{si}.mp3")
        for attempt in range(4):
            try:
                bounds = asyncio.run(edge_segment(say, voice, rate, pitch, mp3)); break
            except Exception as e:
                print("   retry", e)
        pcm = decode(mp3)
        a = align(toks, bounds)
        pcm, a = shorten_silences(pcm, a)
        e = np.convolve(np.abs(pcm), np.ones(240) / 240, "same")
        loud = np.where(e > 0.006)[0]
        first = min(a[0]["start"], loud[0] / SR) if len(loud) else a[0]["start"]
        last = max(a[-1]["end"], loud[-1] / SR) if len(loud) else a[-1]["end"]
        lead, tail = max(0.0, first - 0.05), min(len(pcm) / SR, last + 0.2)
        sp = pcm[int(lead * SR):int(tail * SR)].copy()
        f = min(len(sp), int(0.01 * SR)); sp[:f] *= np.linspace(0, 1, f); sp[-f:] *= np.linspace(1, 0, f)
        if spk == "AB":
            sp = double_voice(sp)
        for w in a:
            w["start"] = round(w["start"] - lead + cursor, 3); w["end"] = round(w["end"] - lead + cursor, 3)
            w["spk"] = spk
            words.append(w)
        chunks.append(sp); cursor += len(sp) / SR
        if si < len(segs) - 1:
            gap = pauses[si] if si < len(pauses) else 0.2
            chunks.append(np.zeros(int(gap * SR), np.float32)); cursor += gap
    voice = np.concatenate(chunks) if chunks else np.zeros(0, np.float32)
    if len(voice):
        snap_onsets(voice, words)
    dur = s.get("fixed") or (len(voice) / SR + PAD + s.get("extra", 0))
    voice = np.concatenate([voice, np.zeros(max(0, int(round(dur * SR)) - len(voice)), np.float32)])
    write_wav(wpath, voice)
    d = dict(id=sid, sig=sig, duration=round(dur, 3), words=words)
    json.dump(d, open(jpath, "w"), ensure_ascii=False, indent=1)
    return d


def from_recording(path):
    """stimme.mp3: faster-whisper Wortzeitstempel, Schnitt an den Szenengrenzen."""
    os.environ.setdefault("HF_HUB_DISABLE_XET", "1")
    from faster_whisper import WhisperModel
    pcm = decode(path)
    a16 = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True, check=True).stdout
    segs, _ = WhisperModel("small", compute_type="int8").transcribe(np.frombuffer(a16, np.float32), language="de", word_timestamps=True)
    bounds = [dict(text=w.word.strip(), start=w.start, end=w.end) for sg in segs for w in sg.words]
    toks, owner = [], []
    for s in SCENES:
        for seg in (s["text"] or "").split("|"):
            m = re.match(r"\{(W|B|AB)\}\s*", seg.strip()); spk = m.group(1) if m else "W"
            for t in tokens_of(seg.strip()[m.end():] if m else seg):
                t["say"] = t["word"]; t["spk"] = spk; toks.append(t); owner.append(s["id"])
    allw = align(toks, bounds)
    for s in SCENES:
        ws = [dict(w, spk=t["spk"]) for w, t, o in zip(allw, toks, owner) if o == s["id"]]
        if not ws:
            dur = s.get("fixed", 0.5); write_wav(os.path.join(OUT, s["id"] + ".wav"), np.zeros(int(dur * SR), np.float32))
            json.dump(dict(id=s["id"], duration=dur, words=[]), open(os.path.join(OUT, s["id"] + ".json"), "w")); continue
        a, b = max(0, ws[0]["start"] - .05), ws[-1]["end"] + .2
        seg = pcm[int(a * SR):int(b * SR)]
        for w in ws:
            w["start"] = round(w["start"] - a, 3); w["end"] = round(w["end"] - a, 3)
        dur = len(seg) / SR + PAD + s.get("extra", 0)
        write_wav(os.path.join(OUT, s["id"] + ".wav"), np.concatenate([seg, np.zeros(int((dur - len(seg) / SR) * SR), np.float32)]))
        json.dump(dict(id=s["id"], duration=round(dur, 3), words=ws), open(os.path.join(OUT, s["id"] + ".json"), "w"), ensure_ascii=False)


def main():
    rec = os.path.join(ROOT, "stimme.mp3")
    if os.path.exists(rec):
        from_recording(rec); return
    tot = 0
    for s in SCENES:
        d = build_scene(s); tot += d["duration"]
        print(f"{s['id']}: {d['duration']:.2f}s  " + " ".join(("" if w["spk"] == "W" else f"[{w['spk']}]") + w["word"] for w in d["words"]))
    print(f"Gesamt: {tot:.2f}s")


if __name__ == "__main__":
    main()
