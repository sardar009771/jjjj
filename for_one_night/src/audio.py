# -*- coding: utf-8 -*-
"""Thriller-Sound: dunkler Drone, Herzschlag (wird schneller bis zur Auflösung), 0,5 s Stille,
dann warmer, eleganter Akkord. SFX bildgenau aus build/scenes/<id>.sfx.json. -> build/mix.wav"""
import json, os, subprocess
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, "build"); SR = 48000
rng = np.random.default_rng(3)
db = lambda x: 10 ** (x / 20)


def load(p):
    return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout, np.float32).copy()


def env(n, a=.002, d=.1):
    t = np.arange(n) / SR; e = np.exp(-t / d); na = max(1, int(a * SR)); e[:na] *= np.linspace(0, 1, na); return e


def filt(x, lo=None, hi=None, order=2):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); H = np.ones_like(f)
    if hi: H /= np.sqrt(1 + (f / hi) ** (2 * order))
    if lo: H /= np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** (2 * order))
    return np.fft.irfft(X * H, len(x)).astype(np.float32)


noise = lambda n: rng.standard_normal(n).astype(np.float32)
sine = lambda f, n, ph=0: np.sin(2 * np.pi * f * np.arange(n) / SR + ph)


def reverb(x, dec=1.2, mix=.25):
    n = int(dec * SR); ir = noise(n) * np.exp(-np.arange(n) / SR / (dec / 5)); ir = filt(ir, hi=5000); ir /= np.abs(ir).sum() ** .5 * 6
    y = np.fft.irfft(np.fft.rfft(x, len(x) + n) * np.fft.rfft(ir, len(x) + n))[:len(x)]
    return (x * (1 - mix) + y.astype(np.float32) * mix * 3).astype(np.float32)


def sfx(kind, dur=None):
    if kind == "doorbell":
        out = np.zeros(int(1.6 * SR), np.float32)
        for t0, f in ((0, 659.3), (.42, 523.3)):
            n = int(1.1 * SR); x = (sine(f, n) + .5 * sine(f * 2.76, n) + .25 * sine(f * 5.4, n)) * env(n, .002, .45)
            i = int(t0 * SR); out[i:i + n] += x[:len(out) - i]
        return reverb(out * .35, 1.5, .35)
    if kind == "hit":
        n = int(1.8 * SR); t = np.arange(n) / SR
        x = np.sin(2 * np.pi * np.cumsum(30 + 70 * np.exp(-t / .08)) / SR) * env(n, .001, .7)
        x += filt(noise(n), 40, 1500) * env(n, .001, .06) * .5
        return reverb(np.tanh(x * 2.2).astype(np.float32) * .9, 2.0, .3)
    if kind == "tick":
        n = int(.04 * SR); return (sine(3200, n) * .6 + sine(5100, n) * .3) * env(n, .0003, .006) * .4
    if kind in ("cut", "whoosh"):
        n = int(.45 * SR); t = np.arange(n) / SR; x = filt(noise(n), 300, 4000) * np.sin(np.pi * t / t[-1]) ** 2
        return x * (.35 if kind == "cut" else .5)
    if kind == "knock":
        out = np.zeros(int(.9 * SR), np.float32)
        for i, t0 in enumerate((0, .2, .4)):
            n = int(.18 * SR); x = (filt(noise(n), 80, 900) * 1.2 + sine(110, n) * .8) * env(n, .001, .03)
            j = int(t0 * SR); out[j:j + n] += x
        return reverb(out * .8, .8, .3)
    if kind == "shimmer":
        d = dur or 1.5; n = int(d * SR); t = np.arange(n) / SR
        x = sum(sine(f, n, p) for f, p in ((1568, 0), (1975.5, 1), (2349.3, 2), (2960, .5), (3136, 1.3)))
        x *= (.5 + .5 * np.sin(2 * np.pi * 7 * t)) * np.minimum(1, t / .3) * np.minimum(1, (d - t) / .5)
        return reverb(x.astype(np.float32) * .03, 1.5, .4)
    if kind == "memory":
        n = int(1.2 * SR); t = np.arange(n) / SR
        x = filt(noise(n), 500, 6000) * (t / t[-1]) ** 2 * .25 + sine(880, n) * (t / t[-1]) ** 3 * .06
        return reverb(x[::-1].copy() * 0 + x, 1.5, .5)
    if kind == "spray":
        n = int(.75 * SR); t = np.arange(n) / SR
        x = filt(noise(n), 2500, 11000) * np.minimum(1, t / .02) * np.exp(-np.maximum(0, t - .35) / .12)
        return x * .45
    if kind == "creak":
        d = dur or 1.5; n = int(d * SR); t = np.arange(n) / SR
        f = 160 + 90 * np.sin(2 * np.pi * .7 * t) + 40 * np.sin(2 * np.pi * 3.1 * t)
        pulses = (np.sin(2 * np.pi * np.cumsum(f) / SR) > .7).astype(np.float32)
        x = filt(pulses * filt(noise(n), 300, 3000), 200, 2500) * np.minimum(1, t / .2) * np.minimum(1, (d - t) / .3)
        return reverb(x * .5, 1.0, .35)
    if kind == "sniff":
        n = int(.5 * SR); t = np.arange(n) / SR
        x = filt(noise(n), 1500, 7000) * (np.sin(np.pi * np.clip(t / .22, 0, 1)) + np.sin(np.pi * np.clip((t - .26) / .2, 0, 1)) * (t > .26))
        return x * .14
    if kind == "low":
        n = int(1.4 * SR); return sine(46, n) * env(n, .05, .6) * .35
    if kind == "swell":
        d = dur or 2; n = int(d * SR); t = np.arange(n) / SR
        x = (sine(293.7, n) + sine(440, n) + sine(587.3, n) * .6) * (t / d) ** 2 * .07
        return reverb(x.astype(np.float32), 1.5, .4)
    if kind == "slam":
        n = int(1.6 * SR); t = np.arange(n) / SR
        x = filt(noise(n), 60, 3000) * env(n, .001, .05) * 1.4 + np.sin(2 * np.pi * np.cumsum(55 + 60 * np.exp(-t / .03)) / SR) * env(n, .001, .25)
        x += filt(noise(n), 2000, 7000) * env(n, .001, .015) * .5  # Schloss-Klick
        return reverb(np.tanh(x * 1.8).astype(np.float32), 1.6, .4)
    if kind == "buzz":
        d = dur or 1; n = int(d * SR); t = np.arange(n) / SR
        on = (np.sin(2 * np.pi * (3 + 9 * t / d) * t) > -.2).astype(np.float32)
        x = filt((np.sign(np.sin(2 * np.pi * 100 * t)) * .3 + filt(noise(n), 2000, 6000) * .2).astype(np.float32), 80, 3000) * on
        return x * .16
    if kind == "ding":
        n = int(1.2 * SR); return reverb(((sine(1174.7, n) + .5 * sine(1760, n)) * env(n, .001, .4) * .2).astype(np.float32), 1.2, .3)
    if kind == "pop":
        n = int(.12 * SR); t = np.arange(n) / SR
        return np.sin(2 * np.pi * np.cumsum(400 + 700 * np.exp(-t / .02)) / SR) * env(n, .0005, .035) * .4
    return np.zeros(1, np.float32)


def heartbeat_track(n, t_beats):
    out = np.zeros(n, np.float32)
    m = int(.16 * SR); tt = np.arange(m) / SR
    thump = (np.sin(2 * np.pi * (44 + 36 * np.exp(-tt / .02)) * tt) * env(m, .002, .05)).astype(np.float32)
    for tb, g in t_beats:
        for o, a in ((0, 1), (.17, .65)):
            i = int((tb + o) * SR)
            if 0 <= i < n - m: out[i:i + m] += thump * a * g
    return np.tanh(out * 1.6)


def main():
    man = json.load(open(os.path.join(BUILD, "manifest.json")))
    sc = man["scenes"]; T = sum(s["duration"] for s in sc); n = int(round(T * SR))
    voice = np.zeros(n, np.float32); fx = np.zeros(n, np.float32)
    off, t0 = {}, 0.0
    marks = {}
    for s in sc:
        off[s["id"]] = t0
        v = load(os.path.join(BUILD, "audio", s["id"] + ".wav"))[:int(round(s["duration"] * SR))]
        i = int(round(t0 * SR)); voice[i:i + len(v)] += v[:n - i]
        for e in json.load(open(os.path.join(BUILD, "scenes", s["id"] + ".sfx.json"))):
            if e["type"].startswith("mark_"):
                marks[e["type"]] = t0 + e["t"]; continue
            x = sfx(e["type"], e.get("dur")) * e.get("gain", 1)
            j = int(round((t0 + max(0, e["t"])) * SR))
            if j < n: m = min(len(x), n - j); fx[j:j + m] += x[:m]
        t0 += s["duration"]
    S0 = marks["mark_silence"]; C0 = marks["mark_chord"]
    t = np.arange(n) / SR
    # Dunkler Drone (D-Moll-Cluster, tief), langsam atmend
    dr = (sine(36.7, n) * .6 + sine(55.0, n) * .45 + sine(73.4, n) * .3 + sine(77.8, n) * .12 + sine(110, n) * .08).astype(np.float32)
    dr = dr * (0.75 + .25 * np.sin(2 * np.pi * t / 7)) + filt(noise(n), 40, 220) * .25
    glass = (sine(1174.7, n) * .025 + sine(1244.5, n) * .015) * (0.5 + .5 * np.sin(2 * np.pi * t * .3))
    # Spannungsverlauf: steigt bis zur Stille, Delle bei „nichts“ (s08), Anschwellen bei B (s09)
    tens = np.clip(t / S0, 0, 1)
    lvl = .55 + .45 * tens
    a8, b8 = off["s08"], off["s09"]
    lvl = np.where((t >= a8) & (t < b8), lvl * .45, lvl)
    lvl = np.where((t >= b8) & (t < off["s10"]), lvl * (0.8 + .5 * np.clip((t - b8) / 2, 0, 1)), lvl)
    drone = (dr + glass) * lvl
    # Herzschlag: 60 -> 140 bpm bis zur Stille
    beats, tb = [], .2
    while tb < S0 - .25:
        bpm = 60 + 80 * (tb / S0) ** 1.6
        g = .45 if a8 <= tb < b8 else 1.0
        beats.append((tb, g)); tb += 60 / bpm
    heart = heartbeat_track(n, beats)
    music = drone * .9 + heart * .8
    # Loop-Rückkehr: in den letzten 0,6 s den Drone wieder einblenden (Video startet mit Drone)
    L0 = T - .6
    # Warmer, eleganter Akkord ab der Auflösung (Dmaj9), mit Glocken-Arpeggio
    ch = np.zeros(n, np.float32); i0 = int(C0 * SR); m = n - i0; tt = np.arange(m) / SR
    for f, a in ((146.8, .5), (220, .4), (277.2, .32), (329.6, .3), (440, .22), (554.4, .14)):
        ch[i0:] += (np.sin(2 * np.pi * f * tt) + .3 * np.sin(2 * np.pi * f * 2.003 * tt)) * a
    ch[i0:] *= np.minimum(1, tt / .6) * (0.85 + .15 * np.sin(2 * np.pi * tt * .5))
    for k, f in enumerate((587.3, 740, 880, 1108.7, 880, 740, 1174.7, 1108.7) * 3):
        j = i0 + int((.4 + k * .55) * SR); mm = int(1.2 * SR)
        if j + mm < n: ch[j:j + mm] += (sine(f, mm) + .3 * sine(f * 3, mm)) * env(mm, .002, .5) * .12
    ch = reverb(filt(ch, hi=6000), 2.2, .35)
    ch *= np.clip((T - .1 - t) / .6, 0, 1)  # vor dem Loop ausblenden
    music = np.where(t < S0, music, 0) + ch * .55
    music = music + np.where(t >= L0, drone * np.clip((t - L0) / .6, 0, 1) * .9 * (dr.std() > 0), 0)
    # 0,5 s komplette Stille vor der Auflösung
    sil = (t >= S0) & (t < C0)
    # Pegel: Stimme vorne, Musik ~ -17 dB, SFX ~ -6 dB
    sp = voice[np.abs(voice) > .01]; voice *= .25 / (np.sqrt(np.mean(sp ** 2)) + 1e-9)
    music *= (.25 * db(-17)) / (np.sqrt(np.mean(music[: int(10 * SR)] ** 2)) + 1e-9)
    fx *= .9
    mix = voice + music + fx
    mix[sil] = 0; voice_check = np.abs(voice[sil]).max() if sil.any() else 0
    mix = np.tanh(mix * 1.05) / 1.05; mix /= np.abs(mix).max() / db(-1)
    out = os.path.join(BUILD, "mix.wav")
    x16 = (np.clip(mix, -1, 1) * 32767).astype("<i2")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-af", "loudnorm=I=-14:TP=-1.5:LRA=14", "-ar", str(SR), "-ac", "2", out], input=x16.tobytes(), check=True)
    print(f"mix.wav {T:.2f}s | Stille {S0:.2f}-{C0:.2f}s (Stimme dort max {voice_check:.4f}) | Herzschläge {len(beats)}")


if __name__ == "__main__":
    main()
