import Phaser from 'phaser';
import { Animal } from '../entities/Animal';
import { ZooObject } from '../entities/ZooObject';
import { floatEmoji } from '../utils/effects';

const INTERACTION_SCAN_INTERVAL = 4000;
const NEARBY_RADIUS = 150;
const INTERACTION_CHANCE = 0.4; // keep emergent moments rare and charming, not constant

/**
 * Owns the animal population and their per-frame updates, plus a light,
 * periodic scan for emergent mini-interactions. No pathfinding, no
 * simulation - just occasional charming touches as the spec asks for.
 */
export class AnimalSystem {
  private readonly animals: Animal[] = [];
  private nextScanAt = 0;

  constructor(
    private scene: Phaser.Scene,
    private getObjects: () => ZooObject[],
  ) {}

  add(animal: Animal): void {
    this.animals.push(animal);
  }

  getAll(): readonly Animal[] {
    return this.animals;
  }

  update(time: number): void {
    for (const animal of this.animals) {
      animal.update(time);
    }

    if (time >= this.nextScanAt) {
      this.nextScanAt = time + INTERACTION_SCAN_INTERVAL;
      this.runEmergentInteractions();
    }
  }

  private runEmergentInteractions(): void {
    if (Math.random() > INTERACTION_CHANCE) return;
    if (this.tryAttractionMoment()) return;
    this.tryAnimalGreeting();
  }

  private tryAttractionMoment(): boolean {
    const objects = this.getObjects();

    for (const animal of this.animals) {
      if (animal.currentState !== 'IDLE' || !animal.definition.attractedTo) continue;

      const nearby = objects.find(
        (o) =>
          o.definition.type === animal.definition.attractedTo &&
          Phaser.Math.Distance.Between(animal.x, animal.y, o.x, o.y) < NEARBY_RADIUS,
      );
      if (!nearby) continue;

      const emoji = animal.definition.attractedTo === 'teich' ? '💦' : '🍃';
      floatEmoji(this.scene, animal.x, animal.y - 40, emoji, { rise: 34, size: 18 });
      return true;
    }

    return false;
  }

  private tryAnimalGreeting(): boolean {
    for (let i = 0; i < this.animals.length; i++) {
      for (let j = i + 1; j < this.animals.length; j++) {
        const a = this.animals[i];
        const b = this.animals[j];
        if (a.currentState !== 'IDLE' || b.currentState !== 'IDLE') continue;
        if (Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y) >= NEARBY_RADIUS) continue;

        floatEmoji(this.scene, a.x, a.y - 40, '💗', { rise: 30, size: 18 });
        floatEmoji(this.scene, b.x, b.y - 40, '💗', { rise: 30, size: 18 });
        return true;
      }
    }
    return false;
  }
}
