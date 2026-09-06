# Bobos Spiele

Eine kleine Sammlung von Lernspielen für GitHub Pages mit HTML, CSS und JavaScript.

## Übersicht

Die Startseite (`index.html`) zeigt eine Spieleübersicht im Stil eines iPad-Homescreens.
Jedes Spiel liegt in seinem eigenen Unterordner. Aktuell verfügbar:

- **Farbenspiel** (`farbenspiel/`)
- **Was gehört wohin?** (`kueche-bad/`) – weitere Spiele folgen.

## Farbenspiel

### Farben

Blau, Rot, Grün, Weiß, Schwarz, Pink, Violett, Orange, Gelb, Braun, Grau und Türkis.

### So funktioniert es

- Bobo gibt die Aufgabe über die Browser-Sprachausgabe aus, z. B. „Tippe auf das blaue Feld.“
- Auf Bobo oder die Sprechblase tippen, um die Aufgabe erneut zu hören.
- Bei einer richtigen Antwort gratuliert Bobo verbal und macht einen animierten Salto.
- Bei einer falschen Antwort nennt Bobo die gedrückte Farbe und wiederholt die gesuchte Farbe.
- Nach jeder richtigen Antwort wechselt nicht nur die gesuchte Farbe, sondern auch die Anordnung der Farbfelder.
- Das Spiel merkt sich richtige und falsche Antworten im Browser.
- Farben, bei denen häufiger Fehler passieren, werden automatisch etwas öfter abgefragt.
- Unter „Fortschritt anzeigen“ sieht man die Statistik pro Farbe.

## Was gehört wohin?

- In der Mitte erscheint ein Gegenstand. Er wird per Sprachausgabe genannt.
- Der Gegenstand wird per Drag & Drop (Finger oder Maus) zur Küche oder zum Bad gezogen.
- Bei einer richtigen Zuordnung lacht Bobo, macht einen Salto und es geht direkt weiter zum nächsten Gegenstand.
- Bei einer falschen Zuordnung springt der Gegenstand zurück und Bobo sagt, wohin er wirklich gehört.
- Auf Bobo oder die Sprechblase tippen, um die Aufgabe erneut zu hören.

## GitHub Pages

Das gesamte Repository (inklusive Unterordner) direkt hochladen, die Struktur sieht so aus:

- index.html (Spieleübersicht)
- style.css
- README.md
- farbenspiel/
  - index.html
  - style.css
  - script.js
  - bobo.webp
  - bobo-lachen.mp3
- kueche-bad/
  - index.html
  - style.css
  - script.js
  - bobo.webp
  - bobo-lachen.mp3

Danach unter Settings → Pages:
- Source: Deploy from a branch
- Branch: main
- Ordner: /(root)

Es werden keine zusätzlichen Audiodateien benötigt.
