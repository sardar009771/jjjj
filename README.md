# ProFuel – „100 Tage Creatin“ (TikTok-Ad, 1080×1920, 30 fps)

Ergebnis: `output/creatin_A|B|C.mp4` (mit Stimme) und `output/creatin_A|B|C_ohne_stimme.mp4` (nur Musik + SFX). Nur der Hook unterscheidet sich.
Ältere Version mit Microsoft-Stimme „Florian“: `output/florian/`.

## Pipeline
```
pip install piper-tts faster-whisper edge-tts numpy pillow   # Playwright (Node) + ffmpeg müssen vorhanden sein
python3 src/make.py all                # TTS -> Produkt -> Manifest -> Szenen rendern -> Audio -> Final
```
Einzelschritte: `python3 src/make.py tts|product|manifest|render|audio|final`
Test-Frames: `node src/render.js --test d1:1.2,d80:2.9 --guides` (Safe Zones eingeblendet) -> `build/test/`

- `src/script_data.py` – Skript, Schlüsselwörter (`*Wort*`), Hooks, Stimme/Tempo
- `src/tts.py` – Stimme pro Szene. Standard: **Piper „Thorsten“** (kostenlos, Open Source, auch für Werbung frei); Wort-Zeitstempel per faster-whisper, Wortanfänge auf den echten Toneinsatz eingerastet. Alternativ `ENGINE = "edge"` in `src/script_data.py`. Die Stimmdatei (~114 MB) wird beim ersten Lauf nach `assets/piper/` geladen.
- `src/stage.html` / `src/stage.js` – alle Szenen als SVG, deterministisch über die Zeit t
- `src/render.js` – Playwright rendert Frame für Frame, ffmpeg kodiert eine MP4 pro Szene
- `src/audio.py` – numpy-Beat, SFX (bildgenau aus der Szenen-Engine), Mix mit Stimme, Loudnorm −14 LUFS
- `src/prep_product.py` – stellt `produkt.png` frei (schwarzer Hintergrund); fehlt die Datei, wird ein Vektor-Platzhalter genutzt

**Echtes Produktbild:** `produkt.png` in den Projektordner legen und
`python3 src/make.py product && python3 src/make.py render && python3 src/make.py final` ausführen.
