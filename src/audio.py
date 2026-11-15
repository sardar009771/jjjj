# -*- coding: utf-8 -*-
"""Musik (numpy-Beat), Sound-Effekte und Stimme -> build/mix_<Variante>.wav

Musik: 124 BPM, Kick, Hi-Hat, tiefer Bass-Drone (mit Sidechain-Pumpen), ~20 dB unter der Stimme.
  Tag 50: dumpf (Tiefpass) + leiser.  Ab Tag 60 („kapiert“): wieder offen, lauter, zusätzlich Clap.
SFX: aus build/scenes/<id>.sfx.json (von der Szenen-Engine erzeugt, dadurch bildgenau).
"""
import json, os, subprocess
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, "build")
SR = 48000
rng = np.random.default_rng(7)


def db(x):
    return 10 ** (x / 20)


def load_wav(p):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32).copy()


def env(n, a=0.002, d=0.1):
    t = np.arange(n) / SR
    e = np.exp(-t / d)
    na = max(1, int(a * SR))
    e[:na] *= np.linspace(0, 1, na)
    return e


def lowpass(x, fc):
    """One-Pole-Tiefpass (zeitvariabel möglich: fc als Array)."""
    fc = np.broadcast_to(np.asarray(fc, dtype=np.float64), x.shape)
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    s = 0.0
    for i in range(len(x)):  # bewusst einfach; Länge ~1 Min. -> ok
        s = (1 - a[i]) * x[i] + a[i] * s
        y[i] = s
    return y


def lp_fast(x, fc, order=2):
    # konstanter Tiefpass via FFT
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    H = 1 / np.sqrt(1 + (f / fc) ** (2 * order))
    return np.fft.irfft(X * H, len(x)).astype(np.float32)


def hp_fast(x, fc, order=2):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    H = 1 / np.sqrt(1 + (fc / np.maximum(f, 1e-3)) ** (2 * order))
    return np.fft.irfft(X * H, len(x)).astype(np.float32)


def bp_noise(n, lo, hi):
    return hp_fast(lp_fast(rng.standard_normal(n).astype(np.float32), hi), lo)


# ---------------- Instrumente ----------------
def kick():
    n = int(.42 * SR); t = np.arange(n) / SR
    f = 42 + 120 * np.exp(-t / .045)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * env(n, .001, .16)
    x[:int(.004 * SR)] += rng.standard_normal(int(.004 * SR)) * .4
    return np.tanh(x * 1.6) * .9


def hat(op=False):
    n = int((.16 if op else .045) * SR)
    return bp_noise(n, 7000, 14000) * env(n, .0005, .05 if op else .012) * 1.4


def clap():
    n = int(.25 * SR)
    x = bp_noise(n, 900, 5000)
    e = np.zeros(n)
    for o in (0, .011, .022):
        i = int(o * SR); e[i:] += env(n - i, .0005, .012 if o < .02 else .09)
    return x * e * .9


# ---------------- SFX ----------------
def sfx(kind, dur=None):
    if kind == "whoosh":
        n = int(.42 * SR); t = np.arange(n) / SR
        x = bp_noise(n, 300, 6000)
        fc = 400 + 5000 * np.sin(np.pi * t / t[-1]) ** 2
        x = lowpass(x, fc)
        return x * np.sin(np.pi * t / t[-1]) ** 1.5 * 2.2
    if kind == "swipe":
        return sfx("whoosh")[: int(.3 * SR)] * .8
    if kind == "zoom":
        n = int(.35 * SR); t = np.arange(n) / SR
        return np.sin(2 * np.pi * np.cumsum(200 + 1400 * t / t[-1]) / SR) * env(n, .01, .2) * .25 + sfx("whoosh")[:n] * .6
    if kind == "tick":
        n = int(.03 * SR); t = np.arange(n) / SR
        return (np.sin(2 * np.pi * 2600 * t) + .5 * np.sin(2 * np.pi * 5200 * t)) * env(n, .0003, .006) * .55
    if kind == "hit":
        n = int(1.4 * SR); t = np.arange(n) / SR
        f = 32 + 90 * np.exp(-t / .07)
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .55)
        x += bp_noise(n, 60, 2500) * env(n, .001, .05) * .6
        return np.tanh(x * 2.2) * .95
    if kind == "punch":
        return sfx("hit")[: int(.5 * SR)] * .6 * env(int(.5 * SR), .001, .15)
    if kind == "rewind":
        d = dur or 2.0; n = int(d * SR); t = np.arange(n) / SR
        # Bandsalat: schnelle, steigende Tonhöhen-Warble + Rauschen
        f = 300 + 900 * (t / d) + 220 * np.sin(2 * np.pi * 11 * t)
        x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .18
        x = lp_fast(x.astype(np.float32), 3500)
        x += bp_noise(n, 1500, 9000) * .25 * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * t))
        chirps = np.sin(2 * np.pi * np.cumsum(1800 + 1200 * np.sin(2 * np.pi * 7 * t)) / SR) * .12
        x = x + chirps
        fade = np.minimum(1, np.minimum(t / .05, (d - t) / .12))
        return x * fade * 1.3
    if kind == "glitch":
        n = int(.45 * SR); t = np.arange(n) / SR
        x = np.sign(np.sin(2 * np.pi * 70 * t)) * .5 + bp_noise(n, 200, 8000) * .6
        gate = (np.sin(2 * np.pi * 28 * t) > 0).astype(float)
        return x * gate * env(n, .001, .25) + sfx("hit")[:n] * .7
    if kind == "pop":
        n = int(.12 * SR); t = np.arange(n) / SR
        return np.sin(2 * np.pi * np.cumsum(500 + 900 * np.exp(-t / .02)) / SR) * env(n, .0005, .035) * .7
    if kind == "ding":
        n = int(1.0 * SR); t = np.arange(n) / SR
        return (np.sin(2 * np.pi * 1318 * t) + .6 * np.sin(2 * np.pi * 1975 * t) + .3 * np.sin(2 * np.pi * 2637 * t)) * env(n, .001, .3) * .28
    if kind == "pour":
        n = int(.7 * SR)
        return bp_noise(n, 1500, 6000) * env(n, .05, .3) * (1 + .5 * np.sin(np.arange(n) / SR * 2 * np.pi * 30)) * .35
    if kind == "crickets":
        d = dur or 2; n = int(d * SR); t = np.arange(n) / SR
        car = np.sin(2 * np.pi * 4300 * t)
        am = (np.sin(2 * np.pi * 32 * t) > .2).astype(float)
        chirp = ((t % .55) < .19).astype(float)
        x = car * am * chirp
        x += np.sin(2 * np.pi * 4700 * t) * (np.sin(2 * np.pi * 30 * t) > .3) * (((t + .27) % .7) < .15) * .6
        return lp_fast(x.astype(np.float32), 8000) * .12 * np.minimum(1, np.minimum(t / .1, (d - t) / .2))
    if kind == "stamp":
        return sfx("hit")[: int(.35 * SR)] * env(int(.35 * SR), .001, .08) * .9 + bp_noise(int(.35 * SR), 300, 3000) * env(int(.35 * SR), .001, .03)
    if kind == "water":
        d = dur or 1.5; n = int(d * SR); x = np.zeros(n)
        for k in range(14):
            i = int(rng.uniform(0, d - .15) * SR); m = int(.09 * SR); tt = np.arange(m) / SR
            f = rng.uniform(600, 1300) * (1 + 3 * tt / tt[-1])
            x[i:i + m] += np.sin(2 * np.pi * np.cumsum(f) / SR) * env(m, .002, .03)
        return x * .3
    if kind == "clank":
        n = int(.4 * SR); t = np.arange(n) / SR
        x = sum(np.sin(2 * np.pi * f * t) * a for f, a in [(820, 1), (1230, .7), (2310, .5), (3170, .3)])
        return x * env(n, .0005, .08) * .22 + bp_noise(n, 1000, 7000) * env(n, .0005, .01) * .4
    if kind == "boing":
        n = int(.5 * SR); t = np.arange(n) / SR
        return np.sin(2 * np.pi * np.cumsum(300 + 200 * np.sin(2 * np.pi * 12 * t) * np.exp(-t / .2)) / SR) * env(n, .002, .2) * .3
    if kind == "charge":
        d = dur or .6; n = int(d * SR); t = np.arange(n) / SR
        return np.sin(2 * np.pi * np.cumsum(220 + 900 * (t / d) ** 2) / SR) * (t / d) * .22
    if kind == "riser":
        d = dur or .6; n = int(d * SR); t = np.arange(n) / SR
        return (bp_noise(n, 2000, 10000) * .5 + np.sin(2 * np.pi * np.cumsum(400 + 1600 * t / d) / SR) * .3) * (t / d) * np.minimum(1, (d - t) / .05) * .6
    if kind == "tension":
        d = dur or 1.5; n = int(d * SR); t = np.arange(n) / SR
        x = np.sin(2 * np.pi * 55 * t) * .5 + np.sin(2 * np.pi * 58.3 * t) * .5 + np.sin(2 * np.pi * np.cumsum(300 + 500 * t / d) / SR) * .15
        return x * (t / d) * .5
    if kind == "heart":
        n = int(.45 * SR); x = np.zeros(n)
        for o, a in ((0, 1), (.16, .7)):
            i = int(o * SR); m = int(.14 * SR); tt = np.arange(m) / SR
            x[i:i + m] += np.sin(2 * np.pi * (48 + 30 * np.exp(-tt / .02)) * tt) * env(m, .002, .05) * a
        return np.tanh(x * 2) * .9
    if kind == "confetti":
        n = int(1.2 * SR); x = np.zeros(n)
        for k in range(40):
            i = int(rng.uniform(0, 1.0) * SR); m = int(.025 * SR)
            x[i:i + m] += bp_noise(m, 2000, 9000) * env(m, .0005, .006) * rng.uniform(.2, .6)
        return x
    if kind == "paper":
        n = int(.22 * SR)
        return bp_noise(n, 1500, 7000) * env(n, .005, .06) * .7
    if kind == "shimmer":
        d = dur or 2; n = int(d * SR); t = np.arange(n) / SR
        x = sum(np.sin(2 * np.pi * f * t + p) for f, p in [(1760, 0), (2217, 1), (2637, 2), (3520, .5)])
        return x * (0.5 + 0.5 * np.sin(2 * np.pi * 6 * t)) * np.exp(-t / (d * .5)) * .05
    if kind == "bubble":
        return sfx("pop") * 1.0
    if kind == "rain":
        d = dur or 3; n = int(d * SR); t = np.arange(n) / SR
        x = bp_noise(n, 400, 5000) * .22
        return x * np.minimum(1, np.minimum(t / .3, (d - t) / .3))
    if kind == "low":
        n = int(1.2 * SR); t = np.arange(n) / SR
        return np.sin(2 * np.pi * np.cumsum(90 - 50 * t / t[-1]) / SR) * env(n, .01, .5) * .35
    return np.zeros(1)


SFX_GAIN = {"tick": .5, "whoosh": .5, "hit": .9, "rewind": .55, "crickets": .9, "rain": .5, "pop": .55, "ding": .6,
            "stamp": .7, "clank": .6, "heart": .9, "confetti": .8, "glitch": .7, "tension": .5}


def music(total, timeline):
    """timeline: Liste (id, start, dur, words)."""
    bpm = 124; beat = 60 / bpm
    n = int(total * SR) + SR
    drums = np.zeros(n, np.float32); bass = np.zeros(n, np.float32); claps = np.zeros(n, np.float32)
    K, Hc, Ho, C = kick(), hat(), hat(True), clap()

    def put(buf, x, t, g=1.0):
        i = int(t * SR)
        if i >= len(buf): return
        m = min(len(x), len(buf) - i); buf[i:i + m] += x[:m] * g

    nb = int(total / beat) + 2
    duck = np.ones(n, np.float32)
    for b in range(nb):
        t = b * beat
        put(drums, K, t, 1.0)
        put(drums, Hc, t + beat / 2, .55)
        put(drums, Hc, t + beat / 4, .18); put(drums, Hc, t + 3 * beat / 4, .18)
        if b % 4 == 3: put(drums, Ho, t + beat / 2, .35)
        if b % 2 == 1: put(claps, C, t, .55)
        i = int(t * SR); m = int(.22 * SR)
        if i < n:
            mm = min(m, n - i); duck[i:i + mm] = np.minimum(duck[i:i + mm], 1 - .55 * np.exp(-np.arange(mm) / SR / .07))
    # Bass-Drone: Sägezahn A1 + Sub, Akkordwechsel alle 2 Takte (Am – F – C – G Feeling, tief)
    t = np.arange(n) / SR
    roots = [55.0, 43.65, 48.99, 41.2]
    bar = (t / (beat * 8)).astype(int) % 4
    f = np.array(roots)[bar]
    ph = 2 * np.pi * np.cumsum(f) / SR
    saw = 2 * ((ph / (2 * np.pi)) % 1) - 1
    drone = lp_fast((saw * .5 + np.sin(ph) * .8 + np.sin(ph * 2) * .15).astype(np.float32), 240)
    pulse = (np.sin(2 * np.pi * t / (beat / 2)) * .5 + .5) ** .5  # Achtel-Puls
    bass = drone * (0.55 + .45 * pulse) * duck
    # Spannungs-Pad (hohe Quinte), leise
    pad = (np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 659.3 * t)) * .03 * (0.5 + .5 * np.sin(2 * np.pi * t / 4))

    # Segmente: dumpf bei Tag 50, Rückkehr bei „kapiert“ in Tag 60
    open_k = np.ones(n, np.float32); loud = np.ones(n, np.float32); clap_on = np.zeros(n, np.float32)
    for sid, st, du, words in timeline:
        if sid == "d50":
            a, b = int(st * SR), int((st + du) * SR)
            open_k[a:b] = 0
            fade = int(.15 * SR); open_k[a:a + fade] = np.linspace(1, 0, fade)
            loud[a:b] = db(-4)
        if sid == "d60":
            kp = next((w["start"] for w in words if w["word"].lower().startswith("kapiert")), .8)
            a, b = int(st * SR), int((st + kp) * SR)
            open_k[a:b] = 0; loud[a:b] = db(-4)
            r = int(.5 * SR); open_k[b:b + r] = np.linspace(0, 1, r); loud[b:b + r] = np.linspace(db(-4), db(3), r)
            loud[b + r:] = db(3); clap_on[b:] = 1
    mus = drums + bass + pad + claps * clap_on
    muffled = lp_fast(mus, 350, 3)
    mus = mus * open_k + muffled * (1 - open_k) * 1.3
    return (mus * loud)[:int(total * SR)]


def rms(x):
    return float(np.sqrt(np.mean(x ** 2)) + 1e-9)


def build(variant, man):
    order = [f"hook{variant}"] + man["main"]
    scenes = {s["id"]: s for s in man["scenes"]}
    total = sum(scenes[i]["duration"] for i in order)
    n = int(round(total * SR))
    voice = np.zeros(n, np.float32); fx = np.zeros(n, np.float32)
    timeline, t0 = [], 0.0
    for sid in order:
        s = scenes[sid]
        v = load_wav(os.path.join(BUILD, "audio", sid + ".wav"))
        m = int(round(s["duration"] * SR)); v = v[:m]
        i = int(round(t0 * SR)); voice[i:i + len(v)] += v[: n - i]
        for e in json.load(open(os.path.join(BUILD, "scenes", sid + ".sfx.json"))):
            x = sfx(e["type"], e.get("dur"))
            g = e.get("gain", 1.0) * SFX_GAIN.get(e["type"], .6)
            j = int(round((t0 + max(0, e["t"])) * SR))
            if j >= n: continue
            mm = min(len(x), n - j); fx[j:j + mm] += np.asarray(x[:mm], np.float32) * g
        timeline.append((sid, t0, s["duration"], s["words"]))
        t0 += s["duration"]
    mus = music(total, timeline)[:n]
    # Pegel: Stimme normalisieren, Musik ~20 dB darunter (Basis), SFX ~8 dB darunter
    speech = voice[np.abs(voice) > .01]
    vr = rms(speech)
    voice *= .25 / vr
    mus_base = rms(mus[: int(8 * SR)])
    mus *= (.25 * db(-20)) / mus_base * 1.0
    fx *= db(-3)
    # Loop: Musik am Ende kurz ausblenden, am Anfang direkt voll -> nahtlos
    mix = voice + mus + fx
    mix = np.tanh(mix * 1.1) / 1.1
    mix /= max(1e-6, np.abs(mix).max()) / db(-1)
    out = os.path.join(BUILD, f"mix_{variant}.wav")
    x16 = (np.clip(mix, -1, 1) * 32767).astype("<i2")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), "-ac", "2", out], input=x16.tobytes(), check=True)
    print(f"{out}: {total:.2f}s  (Musik {20*np.log10(rms(mus)/rms(voice[np.abs(voice)>.01]*1)):.1f} dB rel. Stimme)")


if __name__ == "__main__":
    man = json.load(open(os.path.join(BUILD, "manifest.json")))
    for v in man["hooks"]:
        build(v, man)
