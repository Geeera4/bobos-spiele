# Bobos Zoo 2.0

Ein freies Zoo-Aufbauspiel für ganz kleine Kinder (ca. 3 Jahre), gebaut mit Phaser 3 + TypeScript + Vite. Kein Backend, keine Ressourcen, kein Game Over - unten ein Tier oder Objekt auswählen, auf die Wiese tippen, fertig.

## Starten

```bash
npm install
npm run dev
```

Öffnet das Spiel unter der von Vite angezeigten lokalen Adresse.

## Bauen

```bash
npm run build
```

Erzeugt eine statische Produktionsversion in `dist/`, die sich unverändert auf GitHub Pages hochladen lässt (relative Pfade, keine Server-Abhängigkeit).

## Struktur

- `src/game/scenes` – Boot- und Zoo-Szene
- `src/game/entities` – `Animal` (alle 8 Tierarten, datengetrieben) und `ZooObject` (alle Deko-/Zoo-Objekte, ebenfalls datengetrieben)
- `src/game/systems` – Platzieren, Tierverhalten, Kamera/Tap-Erkennung, Speichern
- `src/game/ui` – Toolbar am unteren Bildschirmrand
- `src/game/data` – Tier- und Objektdefinitionen (Emoji-Platzhaltergrafiken, leicht später durch Sprites ersetzbar)

Der Spielstand wird automatisch in `localStorage` gespeichert und beim Start wiederhergestellt.
