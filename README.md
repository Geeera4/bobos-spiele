# Bobos Spiele

Eine kleine Sammlung von Lernspielen für GitHub Pages mit HTML, CSS und JavaScript.

## Übersicht

Die Startseite (`index.html`) zeigt eine Spieleübersicht im Stil eines iPad-Homescreens.
Jedes Spiel liegt in seinem eigenen Unterordner. Aktuell verfügbar:

- **Farbenspiel** (`farbenspiel/`)
- **Bobo räumt auf** (`aufraeumen/`) – weitere Spiele folgen.

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

## Bobo räumt auf

Ein Aufräumspiel für die Kleinsten (ab ca. 3 Jahren).

### So funktioniert es

- Pro Runde zeigt Bobo wenige große Gegenstände (z. B. Ball, Apfel, Zahnbürste, Teddy, Schuh) sowie die passenden Zielorte (Spielzeugkiste, Obstkorb, Badezimmer, Schuhregal).
- Bobo fragt per Sprachausgabe nach einem Gegenstand, z. B. „Wo ist der Ball?“.
- Das Kind tippt auf den gefragten Gegenstand. Danach werden die passenden Zielorte deutlich hervorgehoben.
- Das Kind tippt auf den passenden Zielort. Bei richtiger Auswahl gibt es eine fröhliche Animation und Bobo lobt das Kind.
- Bei einer falschen Auswahl gibt es keine Fehlermeldung: Das Element wackelt kurz, Bobo gibt einen freundlichen Hinweis und das Kind darf sofort erneut auswählen.
- Nach mehreren erfolgreichen Runden gibt es eine große Abschlussanimation mit der Möglichkeit, noch einmal zu spielen oder zur Spielauswahl zurückzukehren.
- Es gibt keine Punkte, kein Zeitlimit und kein „Game Over“.

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
- aufraeumen/
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
