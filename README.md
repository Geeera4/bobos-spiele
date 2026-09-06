# Bobos Farbenspiel

Ein kleines Lernspiel für GitHub Pages mit HTML, CSS und JavaScript.

## So funktioniert es

- Bobo gibt verbal eine Aufgabe, zum Beispiel: „Tippe auf das blaue Feld.“
- Farben: Blau, Rot, Grün, Weiß und Schwarz.
- Richtige Antworten werden verbal gelobt.
- Bei einer falschen Antwort nennt Bobo die gedrückte Farbe und wiederholt die gesuchte Farbe.
- Das Spiel merkt sich pro Farbe richtige und falsche Antworten im Browser.
- Farben, bei denen häufiger Fehler passieren, werden automatisch öfter abgefragt.
- Unter „Fortschritt anzeigen“ sieht man die Statistik.

## GitHub Pages veröffentlichen

1. Neues GitHub-Repository erstellen.
2. Alle Dateien aus diesem Ordner in das Repository hochladen.
3. In GitHub: Settings → Pages.
4. Source: „Deploy from a branch“.
5. Branch: `main`, Ordner: `/(root)`.
6. Speichern.

Danach ist das Spiel typischerweise unter
`https://DEIN-NAME.github.io/REPOSITORY-NAME/`
erreichbar.

## Hinweis zur Sprachausgabe

Die Sprachausgabe nutzt die im Browser eingebaute Web-Speech-Funktion. Auf Smartphones muss meist zuerst auf Bobo oder die Sprechblase getippt werden, bevor Audio abgespielt werden darf.
