# -*- coding: utf-8 -*-
"""Skript: Szenen, Sprechertext (= Untertitel), Schlüsselwörter.

Syntax im Text:
  *Wort*   -> Schlüsselwort (orange im Untertitel)
  |        -> Trennung zwischen zwei Audio-Segmenten (Pause, Länge über `pauses`)
TTS-Aussprachehilfen stehen in SAY (gleiche Wortanzahl wie das Original!).
"""

VOICE = "de-DE-FlorianMultilingualNeural"  # warme, ruhige Erzählerstimme
RATE = "+10%"
PAD = 0.25  # Puffer am Szenenende

# Aussprache-Hilfen nur für die TTS (Untertitel zeigen das Original)
SAY = {
    "ProFuel:": "Pro Fuel:",
    "Creatin": "Kreatin",
    "Creatin.": "Kreatin.",
    "Creatin,": "Kreatin,",
}

HOOKS = {
    "A": dict(
        text="Das bin ich nach *100 Tagen* *Creatin.* | Aber *Tag 20* hat mich fast zum *Aufhören* gebracht.",
        pauses=[0.15],
        rewind_word="Aber",   # Rückspulen startet bei diesem Wort
        stutter_day=20, stutter_word="20",
    ),
    "B": dict(
        text="*Niemand* sagt dir, was an *Tag 20* mit *Creatin* passiert.",
        pauses=[],
        rewind_word=None,     # -> Rückspulen ab 1,0 s
        stutter_day=20, stutter_word="20",
    ),
    "C": dict(
        text="Ich hab *100 Tage* *Creatin* genommen, | und *Tag 80* hat *alles* verändert.",
        pauses=[0.1],
        rewind_word="und",
        stutter_day=80, stutter_word="80",
    ),
}

# Hauptszenen (für alle Varianten identisch, werden nur einmal gerendert)
SCENES = [
    dict(id="d1", day=1, text="*Tag 1.* Fünf *Gramm* in den *Shake.* | Ich spür … gar *nichts.*", pauses=[0.2]),
    dict(id="d20a", day=20, text="*Tag 20.* Die *Waage.* *Zwei Kilo* mehr?! Bin ich *fett* geworden?", pauses=[]),
    dict(id="d20b", day=20, text="*Nein.* Das ist *Wasser,* und zwar *IM* *Muskel.* Genau so soll es sein.", pauses=[]),
    dict(id="d25", day=25, text="*Tag 25.* Bankdrücken. Eine Wiederholung *mehr* als sonst. | *Zufall?*", pauses=[0.25]),
    dict(id="d30", day=30, text="*Tag 30.* Der *Speicher* ist *voll.* Ab jetzt *zählt’s.*", pauses=[]),
    dict(id="d50", day=50, text="*Tag 50.* *Stillstand.* Ich war kurz davor *aufzuhören.*", pauses=[]),
    dict(id="d60", day=60, text="Dann hab ich *kapiert:* Creatin ist *kein Zauber.* Es hilft dir, mehr aus *JEDEM* *Training* rauszuholen.", pauses=[]),
    dict(id="d80", day=80, text="*Tag 80.* Und dann passiert’s … | … *neuer* *Bestwert!*", pauses=[0.55]),
    dict(id="d100", day=100, text="*Tag 100.* Vorher … | *nachher.*", pauses=[0.3]),
    dict(id="trust", day=100, text="Creatin ist eines der am *besten* *untersuchten* Supplements *überhaupt.*", pauses=[]),
    dict(id="pack", day=100, text="Ich nehm *ProFuel:* reines *Creaproof,* *vegan,* *Made* *in* *Germany,* und die Packung hält fast *fünf Monate.*", pauses=[]),
    dict(id="cta", day=100, text="Würdest *du* die *100 Tage* durchziehen? *A* oder *B* in die *Kommentare.* | Link ist im *Warenkorb.*", pauses=[0.1]),
    dict(id="loop", day=100, text="", pauses=[], fixed=0.9),
]
