# Bobos Farbenspiel – Version mit festen Audiodateien

Diese Version spielt vorbereitete MP3-Dateien aus dem Ordner `audio/` ab.
Dadurch klingt Bobo auf allen Geräten weitgehend gleich. Falls eine MP3 nicht geladen werden kann, fällt das Spiel automatisch auf die Browser-Sprachausgabe zurück.

## Dateien

- `index.html`
- `style.css`
- `script.js`
- `bobo.webp`
- `audio/*.mp3`

## Sprachlogik

- Aufgabe: „Tippe auf das blaue/rote/grüne/weiße/schwarze Feld.“
- Richtig: „Super! Richtig. Das ist …“
- Falsch: „Fast. Das war … Suche …“

Die Audiodateien sind synthetisch erzeugt und mit etwas höherer Tonlage/ruhigem Tempo auf eine kindlichere Lernspiel-Stimme abgestimmt. Es handelt sich nicht um die Aufnahme eines echten Kindes.

## Lernfunktion

Das Spiel speichert richtige und falsche Antworten pro Farbe im Browser. Farben, bei denen öfter Fehler passieren, werden häufiger abgefragt.

## GitHub Pages

Einfach alle Dateien und den kompletten Ordner `audio` in dein Repository hochladen. Danach unter `Settings → Pages` den Branch `main` und `/(root)` veröffentlichen.
