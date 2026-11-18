# -*- coding: utf-8 -*-
"""Musik + SFX unter die eigene Stimme (stimme.mp3) -> build/mix.wav
Musik: emotionales Klavier (a-Moll, 72 BPM) mit Pad. Ab der Wende (s08) wärmer, ab dem Produkt (s09)
setzt ein sanfter Beat ein (C – G – Am – F). Musik ca. 16 dB unter der Stimme."""
import json, os, subprocess
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); B = os.path.join(ROOT, "build"); SR = 48000
rng = np.random.default_rng(5); db = lambda x: 10 ** (x / 20)


def load(p):
    return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout, np.float32).copy()


def env(n, a=.002, d=.1):
    t = np.arange(n) / SR; e = np.exp(-t / d); na = max(1, int(a * SR)); e[:na] *= np.linspace(0, 1, na); return e


def filt(x, lo=None, hi=None, o=2):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); H = np.ones_like(f)
    if hi: H /= np.sqrt(1 + (f / hi) ** (2 * o))
    if lo: H /= np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** (2 * o))
    return np.fft.irfft(X * H, len(x)).astype(np.float32)


sine = lambda f, n, p=0: np.sin(2 * np.pi * f * np.arange(n) / SR + p).astype(np.float32)
noise = lambda n: rng.standard_normal(n).astype(np.float32)


def reverb(x, dec=1.8, mix=.3):
    n = int(dec * SR); ir = noise(n) * np.exp(-np.arange(n) / SR / (dec / 5)); ir = filt(ir, hi=5000); ir /= np.sqrt((ir ** 2).sum()) * 4
    y = np.fft.irfft(np.fft.rfft(x, len(x) + n) * np.fft.rfft(ir, len(x) + n))[:len(x)]
    return (x * (1 - mix) + y.astype(np.float32) * mix * 2).astype(np.float32)


def piano(f, dur=1.6, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * h * t) * a * np.exp(-t * (1.2 + h * .9)) for h, a in ((1, 1), (2, .45), (3, .22), (4, .12), (5, .06)))
    x *= np.minimum(1, t / .004)
    return (x * vel * .35).astype(np.float32)


NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)


def sfx(kind, dur=None):
    if kind == "room": n = int(4 * SR); return filt(noise(n), 60, 400) * .03
    if kind == "sigh": n = int(1.0 * SR); t = np.arange(n) / SR; return filt(noise(n), 300, 2500) * np.sin(np.pi * t / t[-1]) ** 2 * .05
    if kind == "alarm":
        d = dur or 1.5; n = int(d * SR); t = np.arange(n) / SR
        gate = ((t % .5) < .32) * ((t % .08) < .05); return (sine(1900, n) * .5 + sine(3800, n) * .2) * gate * .25
    if kind == "train": d = dur or 2; n = int(d * SR); t = np.arange(n) / SR; x = filt(noise(n), 40, 500) * .35 * (1 + .3 * np.sin(2 * np.pi * 1.6 * t)); return x * np.minimum(1, np.minimum(t / .2, (d - t) / .3))
    if kind in ("notif", "ping"):
        n = int(.5 * SR); return reverb(((sine(1568, n) + sine(2093, n) * .6) * env(n, .001, .12) * (.25 if kind == "ping" else .15)).astype(np.float32), .6, .25)
    if kind == "clockspin": n = int(.8 * SR); t = np.arange(n) / SR; return (sine(3000, n) * ((t * 40 % 1) < .1)) * .12 * np.exp(-t / .5)
    if kind == "door": n = int(.6 * SR); return filt(noise(n), 80, 1200) * env(n, .001, .05) * .5
    if kind == "type": n = int(.04 * SR); return filt(noise(n), 1500, 7000) * env(n, .0005, .006) * (.25 + .15 * rng.random())
    if kind == "send": n = int(.3 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(500 + 1500 * t / t[-1]) / SR) * env(n, .005, .1) * .25
    if kind in ("whoosh", "swipe", "pocket"): n = int(.45 * SR); t = np.arange(n) / SR; return filt(noise(n), 300, 5000) * np.sin(np.pi * t / t[-1]) ** 2 * .3
    if kind == "tickT": n = int(.06 * SR); return sine(2500, n) * env(n, .0005, .01) * .25
    if kind == "chime": n = int(1.8 * SR); return reverb(((sine(1318.5, n) + .5 * sine(1975.5, n)) * env(n, .002, .6) * .1).astype(np.float32), 1.5, .4)
    if kind == "riser": d = dur or 2; n = int(d * SR); t = np.arange(n) / SR; return reverb(((filt(noise(n), 1500, 9000) * .3 + sine(440, n) * .1 + sine(660, n) * .06) * (t / d) ** 2).astype(np.float32), 1.2, .3)
    if kind == "zap":
        n = int(.5 * SR); t = np.arange(n) / SR
        x = filt(noise(n), 1200, 9000) * ((rng.random(n) > .6).astype(np.float32)) * env(n, .001, .12) + np.sin(2 * np.pi * np.cumsum(2000 * np.exp(-t / .05) + 100) / SR) * env(n, .001, .08) * .4
        return x * .45
    if kind == "hit":
        n = int(1.4 * SR); t = np.arange(n) / SR
        return reverb((np.tanh(2 * np.sin(2 * np.pi * np.cumsum(38 + 80 * np.exp(-t / .06)) / SR) * env(n, .001, .45))).astype(np.float32), 1.4, .25) * .8
    if kind == "stamp": n = int(.3 * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * np.cumsum(60 + 120 * np.exp(-t / .02)) / SR) * env(n, .001, .08) + filt(noise(n), 300, 3000) * env(n, .001, .02)) * .55
    if kind == "strike": n = int(.25 * SR); return filt(noise(n), 2000, 8000) * env(n, .002, .07) * .3
    if kind == "cash":
        n = int(1.0 * SR); x = np.zeros(n, np.float32)
        for k, f in enumerate((1568, 2093, 2637)): i = int(k * .07 * SR); m = n - i; x[i:] += sine(f, m) * env(m, .001, .25) * .15
        return reverb(x, .8, .3)
    if kind == "pop": n = int(.12 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(400 + 700 * np.exp(-t / .02)) / SR) * env(n, .0005, .035) * .3
    if kind == "ding": n = int(1.2 * SR); return reverb(((sine(1174.7, n) + .5 * sine(1760, n)) * env(n, .001, .4) * .18).astype(np.float32), 1.2, .3)
    return np.zeros(1, np.float32)


def main():
    man = json.load(open(os.path.join(B, "manifest.json"))); sc = man["scenes"]
    T = sc[-1]["start"] + sc[-1]["duration"]; n = int(round(T * SR)); t = np.arange(n) / SR
    voice = np.zeros(n, np.float32); v = load(os.path.join(ROOT, "stimme.mp3")); voice[:min(n, len(v))] = v[:n]
    fx = np.zeros(n, np.float32); marks = {}
    for s in sc:
        for e in json.load(open(os.path.join(B, "scenes", s["id"] + ".sfx.json"))):
            if e["type"].startswith("mark_"): marks[e["type"]] = s["start"] + e["t"]; continue
            x = sfx(e["type"], e.get("dur")) * e.get("gain", 1); j = int(round((s["start"] + max(0, e["t"])) * SR))
            if j < n: m = min(len(x), n - j); fx[j:j + m] += x[:m]
    TURN, DROP = marks["mark_turn"], marks["mark_drop"]
    # --- Musik ---
    bpm = 72; beat = 60 / bpm; bar = beat * 4
    sad = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [55, 60, 64]), (55, [55, 59, 62])]      # Am F C G
    hap = [(48, [60, 64, 67]), (55, [59, 62, 67]), (57, [60, 64, 69]), (53, [57, 60, 65])]      # C G Am F
    mus = np.zeros(n + SR * 8, np.float32); pad = np.zeros_like(mus)
    nb = int(T / bar) + 1
    for b in range(nb):
        t0 = b * bar
        prog = hap if t0 >= DROP - .01 else sad
        root, ch = prog[b % 4]
        bright = 1.0 if t0 >= TURN else .8
        # Bass-Ton + Arpeggio (Achtel), sanft
        i = int(t0 * SR); x = piano(NOTE(root - 12), 3.2, .9); mus[i:i + len(x)] += x
        arp = ch + [ch[1] + 12, ch[2]] + ch[::-1][:3]
        for k in range(8):
            tt = t0 + k * beat / 2
            if tt >= T: break
            if int(tt * SR) + int(1.4 * SR) >= len(mus): break
            vel = (.55 if k % 2 else .7) * bright
            x = piano(NOTE(arp[k % len(arp)] + (12 if t0 >= DROP else 0)), 1.4, vel); j = int(tt * SR); mus[j:j + len(x)] += x
        # Pad
        m = int(bar * SR) + int(.6 * SR); tt = np.arange(m) / SR
        p = sum(np.sin(2 * np.pi * NOTE(c) * tt) * .12 + np.sin(2 * np.pi * NOTE(c) * 1.003 * tt) * .08 for c in ch)
        p *= np.minimum(1, tt / .5) * np.minimum(1, (m / SR - tt) / .5)
        pad[i:i + m] += p.astype(np.float32)
    mus, pad = mus[:n], pad[:n]
    pad = filt(pad, hi=1800) * (np.where(t < TURN, .6, .9))
    music = reverb(mus + pad, 2.2, .35)
    # Beat ab dem Produkt (sanfter Kick, Clap, Hi-Hat)
    drums = np.zeros(n, np.float32)
    kn = int(.35 * SR); kt = np.arange(kn) / SR; kick = (np.sin(2 * np.pi * np.cumsum(45 + 90 * np.exp(-kt / .04)) / SR) * env(kn, .001, .15)).astype(np.float32)
    hn = int(.05 * SR); hat = filt(noise(hn), 7000, 14000) * env(hn, .0005, .012)
    cn = int(.25 * SR); clap = filt(noise(cn), 900, 5000) * env(cn, .001, .08)
    tb = DROP
    k = 0
    while tb < T - .5:
        for x, g, o in ((kick, .9, 0), (hat, .35, beat / 2)):
            j = int((tb + o) * SR); m = min(len(x), n - j)
            if m > 0: drums[j:j + m] += x[:m] * g
        if k % 2 == 1:
            j = int(tb * SR); m = min(cn, n - j)
            if m > 0: drums[j:j + m] += clap[:m] * .45
        tb += beat; k += 1
    music = music + drums
    # Lautstärke-Verlauf: leise und intim -> ab Wende etwas voller -> ab Produkt präsent; Ende ausblenden
    lvl = np.where(t < TURN, .75, np.where(t < DROP, .75 + .35 * (t - TURN) / max(.1, DROP - TURN), 1.15))
    lvl *= np.clip((T - t) / 1.2, 0, 1)
    music *= lvl
    sp = voice[np.abs(voice) > .01]; voice *= .25 / (np.sqrt(np.mean(sp ** 2)) + 1e-9)
    music *= (.25 * db(-19)) / (np.sqrt(np.mean(music[: int(20 * SR)] ** 2)) + 1e-9)
    mix = voice + music + fx
    mix = np.tanh(mix * 1.05) / 1.05; mix /= np.abs(mix).max() / db(-1)
    x16 = (np.clip(mix, -1, 1) * 32767).astype("<i2")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
                    "-ar", str(SR), "-ac", "2", os.path.join(B, "mix.wav")], input=x16.tobytes(), check=True)
    print(f"mix.wav {T:.2f}s | Wende {TURN:.2f}s | Beat ab {DROP:.2f}s")


if __name__ == "__main__":
    main()
