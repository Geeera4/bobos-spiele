# Bobos Spiele

Eine kleine Sammlung von Lernspielen für GitHub Pages mit HTML, CSS und JavaScript.

## Übersicht

Die Startseite (`index.html`) zeigt eine Spieleübersicht im Stil eines iPad-Homescreens.
Jedes Spiel liegt in seinem eigenen Unterordner. Aktuell verfügbar:

- **Farbenspiel** (`farbenspiel/`)
- **Was gehört wohin?** (`kuechen-bad/`)
- **Mehr oder weniger?** (`mehr-oder-weniger/`)
- **Bobo Feuerwehr** (`feuerwehr/`) – weitere Spiele folgen.

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

Ein Gegenstand (z. B. Pfanne, Zahnbürste, Handtuch …) erscheint in der Mitte zwischen Küche und Bad.

### So funktioniert es

- Bobo nennt den Gegenstand über die Browser-Sprachausgabe, z. B. „Wohin gehört die Pfanne?“
- Der Gegenstand wird per Drag & Drop (Maus, Finger/Touch) zur Küche oder zum Bad gezogen. Jedes Mal, wenn man ihn anfasst, wird er erneut angesagt.
- Bei richtiger Zuordnung lacht Bobo, macht seinen Salto und es geht direkt weiter zum nächsten Gegenstand.
- Bei falscher Zuordnung springt der Gegenstand zurück, Bobo sagt an, wohin er stattdessen gehört.
- Auf Bobo oder die Sprechblase tippen wiederholt die Ansage.

## Mehr oder weniger?

Links und rechts erscheint jeweils eine zufällige Anzahl Bobos (in zufälligen Posen aus 10 Varianten).

### So funktioniert es

- Bobo fragt über die Sprechblase (inkl. Sprachausgabe), ob die linke oder rechte Seite mehr oder weniger Bobos hat, z. B. „Wo hat es mehr Bobos?“
- Auf die Seite tippen, die die Antwort ist.
- Bei richtiger Antwort wird die gewählte Seite grün markiert und es geht direkt weiter.
- Bei falscher Antwort wird die gewählte Seite rot und die richtige Seite grün markiert; Bobo nennt beide Anzahlen.
- Im Admin-Bereich lässt sich einstellen, wie viele Bobos pro Seite höchstens vorkommen und wie groß der Unterschied zwischen den Seiten höchstens sein darf.
- Unter „Statistik“ sieht man, wie oft die Fragen „mehr“ und „weniger“ richtig bzw. falsch beantwortet wurden.

## Bobo Feuerwehr

Bobo wird Schritt für Schritt als Feuerwehrmann angezogen und rückt danach zu einem Löscheinsatz aus.

### So funktioniert es

- **Anziehen:** Bobo startet in Unterhose. Zuerst wählt man Oberteil oder Hose (Reihenfolge egal), danach Helm oder Stiefel (Reihenfolge egal), dann die Handschuhe und zum Schluss die Sauerstoffflasche.
- Jede Auswahl wird über die Browser-Sprachausgabe angesagt; Bobo feiert mit einer kleinen Animation, sobald er vollständig angezogen ist.
- **Löscheinsatz:** Bobo steht links mit dem Schlauch bereit, rechts steht ein Haus mit mehreren Fenstern. Immer nur ein Fenster brennt wirklich.
- Klickt man auf das brennende Fenster, spritzt Wasser aus dem Schlauch und der Brand wird gelöscht; klickt man daneben, sagt Bobo, dass es dort nicht brennt.
- Nach 6 bis 8 gelöschten Bränden ist der Einsatz geschafft und man kann das Spiel erneut starten.

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
- kuechen-bad/
  - index.html
  - style.css
  - script.js
  - 01_kueche.png, 02_badezimmer.png (Hintergründe)
  - 03_pfanne.png … 18_haarbuerste.png (Gegenstände)
- mehr-oder-weniger/
  - index.html
  - style.css
  - script.js
  - bobos/
    - bobo_pose_01.png … bobo_pose_10.png (Bobo-Posen)
- feuerwehr/
  - index.html
  - style.css
  - script.js
  - bobo-unterhose.jpg … bobo-oberteil-hose-schuhe-helm-handschuhe-oxygenflasche.jpg (Anzieh-Schritte)
  - oberteil.png, hose.png, helm.png, stiefel.png, handschuhe.png, oxygen-tank.png (Kleidungsstück-Icons)
  - loeschender-bobo.jpg, haus-bobo.png (Löscheinsatz)
  - feuer-transparent-1.png, feuer-transparent-2.png, wasser-transparent-1.png (Effekte)

Danach unter Settings → Pages:
- Source: Deploy from a branch
- Branch: main
- Ordner: /(root)

Es werden keine zusätzlichen Audiodateien benötigt.
