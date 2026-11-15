# -*- coding: utf-8 -*-
"""„Zwei Männer. Einer lügt.“ – Skript für LASTAR For One Night.

Syntax:  *Wort* = Schlüsselwort (Gold)   |  = neues Audio-Segment (Pause aus `pauses`)
Sprecher-Präfix pro Segment:  {W} Erzählerin (Standard)   {B} Mann B allein   {AB} beide Männer gleichzeitig
"""
VOICE_W = "de-DE-KatjaNeural"      # Erzählerin
RATE_W, PITCH_W = "+5%", "-4Hz"    # ruhig, etwas tiefer -> intimer
VOICE_M = "de-DE-ConradNeural"     # die Männer (identische Stimme)
RATE_M, PITCH_M = "+0%", "-2Hz"
PAD = 0.25

SAY = {"LASTAR": "Lastar"}  # Rest englisch lassen: Katja spricht „For One Night“ korrekt

SCENES = [
    dict(id="s01", text="Mein *Date* steht vor der Tür. | *Zweimal.*", pauses=[0.25], extra=0.75),
    dict(id="s02", text="*Gleiches* Gesicht. *Gleicher* Anzug. *Gleiche* Stimme.", pauses=[]),
    dict(id="s03", text="Ich frag: Wo haben wir uns *kennengelernt?* | {AB} Auf der *Dachterrasse.*", pauses=[0.35]),
    dict(id="s04", text="Was hab ich an dem Abend *getrunken?* | {AB} *Nichts.* Du hast nur *gelacht.*", pauses=[0.35]),
    dict(id="s05", text="Dann fällt es mir ein. | Diese eine *Nacht.*", pauses=[0.2]),
    dict(id="s06", text="Er roch nach *etwas,* das ich nie *vergessen* hab.", pauses=[], extra=0.3),
    dict(id="s07", text="Ich öffne die *Tür.* | Nur einen *Spalt.*", pauses=[0.25]),
    dict(id="s08", text="Ich gehe nah an *A* … | … *nichts.*", pauses=[0.7]),
    dict(id="s09", text="Dann an *B* …", pauses=[], extra=1.0),
    dict(id="s10", text="Ich zieh *B* rein. | Und *knall* die Tür zu.", pauses=[0.15], extra=1.6),
    dict(id="s11", text="{B} Du hast dich *erinnert.* | An eine *Nacht.* Und an diesen *Duft.*", pauses=[0.35], extra=0.5),
    dict(id="s12", text="*LASTAR* – *For* *One* *Night.* | Ein Duft, den man nach einer Nacht nicht *vergisst.*", pauses=[0.2]),
    dict(id="s13", text="Link im *Warenkorb.*", pauses=[], extra=2.2),
    dict(id="loop", text="", pauses=[], fixed=0.5),
]
