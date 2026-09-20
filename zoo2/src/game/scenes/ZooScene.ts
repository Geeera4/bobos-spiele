import Phaser from 'phaser';
import { WORLD_HEIGHT, WORLD_WIDTH } from '../config';
import { Animal } from '../entities/Animal';
import { ZooObject } from '../entities/ZooObject';
import { ANIMAL_DEFINITIONS } from '../data/animals';
import { OBJECT_DEFINITIONS, ObjectType } from '../data/objects';
import { PlaceableSelection, PlacementSystem } from '../systems/PlacementSystem';
import { AnimalSystem } from '../systems/AnimalSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { SaveSystem, ZooSaveData } from '../systems/SaveSystem';
import { BuildMenu } from '../ui/BuildMenu';

const STARTER_OBJECTS: Array<{ type: ObjectType; x: number; y: number }> = [
  { type: 'teich', x: 620, y: 560 },
  { type: 'baum', x: 340, y: 460 },
  { type: 'baum', x: 940, y: 420 },
  { type: 'tanne', x: 1080, y: 600 },
  { type: 'busch', x: 800, y: 500 },
  { type: 'blume', x: 480, y: 660 },
  { type: 'blume', x: 740, y: 680 },
  { type: 'sonnenblume', x: 250, y: 640 },
];

export class ZooScene extends Phaser.Scene {
  private animalSystem!: AnimalSystem;
  private placementSystem!: PlacementSystem;
  private interactionSystem!: InteractionSystem;
  private readonly saveSystem = new SaveSystem();
  private readonly objects: ZooObject[] = [];
  private pendingSelection: PlaceableSelection | null = null;

  constructor() {
    super('Zoo');
  }

  create(): void {
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.centerOn(900, 620);

    this.createWorld();

    this.animalSystem = new AnimalSystem(this, () => this.objects);
    this.interactionSystem = new InteractionSystem(this, {
      onTap: (worldX, worldY) => this.handleWorldTap(worldX, worldY),
    });
    this.placementSystem = new PlacementSystem(
      this,
      () => this.objects,
      () => this.interactionSystem.isDragging(),
      (animal) => this.registerAnimal(animal),
      (obj) => this.registerObject(obj),
    );

    this.loadOrSeed();

    new BuildMenu(this, (selection) => {
      this.pendingSelection = selection;
    });
  }

  update(time: number): void {
    this.animalSystem.update(time);
  }

  private createWorld(): void {
    this.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'grass').setOrigin(0, 0).setDepth(-1000);

    this.add
      .text(220, 160, '🎪 Willkommen im Zoo!', {
        fontSize: '34px',
        fontFamily: 'system-ui, sans-serif',
        color: '#ffffff',
        stroke: '#2f3337',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(-500);
  }

  private isDragging = (): boolean => this.interactionSystem.isDragging();

  private handleWorldTap(worldX: number, worldY: number): void {
    if (!this.pendingSelection) return;

    if (this.pendingSelection.kind === 'animal') {
      this.placementSystem.placeAnimal(this.pendingSelection.species, worldX, worldY);
    } else {
      this.placementSystem.placeObject(this.pendingSelection.type, worldX, worldY);
    }
  }

  private registerAnimal(animal: Animal): void {
    this.animalSystem.add(animal);
    this.persist();
  }

  private registerObject(obj: ZooObject): void {
    this.objects.push(obj);
    this.persist();
  }

  private persist(): void {
    this.saveSystem.scheduleSave(() => this.buildSaveData());
  }

  private buildSaveData(): ZooSaveData {
    return {
      animals: this.animalSystem
        .getAll()
        .map((animal) => ({ species: animal.species, x: Math.round(animal.x), y: Math.round(animal.y) })),
      objects: this.objects.map((obj) => ({
        type: obj.definition.type,
        x: Math.round(obj.x),
        y: Math.round(obj.y),
      })),
      settings: { soundEnabled: true },
    };
  }

  private loadOrSeed(): void {
    const saved = this.saveSystem.load();

    if (saved && (saved.animals.length > 0 || saved.objects.length > 0)) {
      saved.objects.forEach((entry) => {
        const definition = OBJECT_DEFINITIONS[entry.type];
        if (!definition) return;
        this.registerObject(new ZooObject(this, entry.x, entry.y, definition, this.isDragging));
      });
      saved.animals.forEach((entry) => {
        const definition = ANIMAL_DEFINITIONS[entry.species];
        if (!definition) return;
        this.registerAnimal(new Animal(this, entry.x, entry.y, definition, this.isDragging));
      });
      return;
    }

    this.seedStarterZoo();
  }

  private seedStarterZoo(): void {
    STARTER_OBJECTS.forEach(({ type, x, y }) => {
      this.registerObject(new ZooObject(this, x, y, OBJECT_DEFINITIONS[type], this.isDragging));
    });
  }
}
