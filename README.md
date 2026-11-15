# ProFuel – „100 Tage Creatin“ (TikTok-Ad, 1080×1920, 30 fps)

Ergebnis: `output/creatin_A.mp4`, `output/creatin_B.mp4`, `output/creatin_C.mp4` (nur der Hook unterscheidet sich).

## Pipeline
```
pip install edge-tts numpy pillow      # Playwright (Node) + ffmpeg müssen vorhanden sein
python3 src/make.py all                # TTS -> Produkt -> Manifest -> Szenen rendern -> Audio -> Final
```
Einzelschritte: `python3 src/make.py tts|product|manifest|render|audio|final`
Test-Frames: `node src/render.js --test d1:1.2,d80:2.9 --guides` (Safe Zones eingeblendet) -> `build/test/`

- `src/script_data.py` – Skript, Schlüsselwörter (`*Wort*`), Hooks, Stimme/Tempo
- `src/tts.py` – edge-tts (de-DE-ConradNeural) pro Szene, Wort-Zeitstempel; nutzt `stimme.mp3` + Whisper, falls vorhanden
- `src/stage.html` / `src/stage.js` – alle Szenen als SVG, deterministisch über die Zeit t
- `src/render.js` – Playwright rendert Frame für Frame, ffmpeg kodiert eine MP4 pro Szene
- `src/audio.py` – numpy-Beat, SFX (bildgenau aus der Szenen-Engine), Mix mit Stimme, Loudnorm −14 LUFS
- `src/prep_product.py` – stellt `produkt.png` frei (schwarzer Hintergrund); fehlt die Datei, wird ein Vektor-Platzhalter genutzt

**Echtes Produktbild:** `produkt.png` in den Projektordner legen und
`python3 src/make.py product && python3 src/make.py render && python3 src/make.py final` ausführen.
