import Phaser from 'phaser';
import { Animal } from '../entities/Animal';
import { ZooObject } from '../entities/ZooObject';
import { ANIMAL_DEFINITIONS, AnimalSpecies } from '../data/animals';
import { OBJECT_DEFINITIONS, ObjectType } from '../data/objects';
import { WORLD_HEIGHT, WORLD_WIDTH } from '../config';
import { bouncePlacement, starBurst } from '../utils/effects';

export type PlaceableSelection =
  | { kind: 'animal'; species: AnimalSpecies }
  | { kind: 'object'; type: ObjectType };

const MIN_Y = 210;
const MARGIN = 60;

/**
 * The one place placement decisions get made. There are deliberately no
 * error states here: a requested spot is always honoured, nudged only
 * enough to avoid sitting exactly on top of another solid object.
 */
export class PlacementSystem {
  constructor(
    private scene: Phaser.Scene,
    private getSolidObjects: () => ZooObject[],
    private isDragging: () => boolean,
    private onAnimalPlaced: (animal: Animal) => void,
    private onObjectPlaced: (obj: ZooObject) => void,
  ) {}

  placeAnimal(species: AnimalSpecies, x: number, y: number): void {
    const definition = ANIMAL_DEFINITIONS[species];
    const spot = this.resolveSpot(x, y, 30);
    const animal = new Animal(this.scene, spot.x, spot.y, definition, this.isDragging);
    bouncePlacement(this.scene, animal);
    starBurst(this.scene, spot.x, spot.y - 30);
    this.onAnimalPlaced(animal);
  }

  placeObject(type: ObjectType, x: number, y: number): void {
    const definition = OBJECT_DEFINITIONS[type];
    const spot = this.resolveSpot(x, y, definition.solidRadius);
    const obj = new ZooObject(this.scene, spot.x, spot.y, definition, this.isDragging);
    bouncePlacement(this.scene, obj);
    starBurst(this.scene, spot.x, spot.y - definition.fontSize * 0.5);
    this.onObjectPlaced(obj);
  }

  private resolveSpot(x: number, y: number, radius: number): { x: number; y: number } {
    let px = Phaser.Math.Clamp(x, MARGIN, WORLD_WIDTH - MARGIN);
    let py = Phaser.Math.Clamp(y, MIN_Y, WORLD_HEIGHT - MARGIN);

    const solids = this.getSolidObjects().filter((o) => o.definition.solidRadius > 0);
    let attempt = 0;
    while (attempt < 12 && this.overlapsAny(px, py, radius, solids)) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + attempt * 14;
      px = Phaser.Math.Clamp(x + Math.cos(angle) * distance, MARGIN, WORLD_WIDTH - MARGIN);
      py = Phaser.Math.Clamp(y + Math.sin(angle) * distance, MIN_Y, WORLD_HEIGHT - MARGIN);
      attempt++;
    }

    return { x: px, y: py };
  }

  private overlapsAny(x: number, y: number, radius: number, solids: ZooObject[]): boolean {
    return solids.some(
      (o) => Phaser.Math.Distance.Between(x, y, o.x, o.y) < radius + o.definition.solidRadius,
    );
  }
}
