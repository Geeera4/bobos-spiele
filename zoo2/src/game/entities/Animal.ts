import Phaser from 'phaser';
import { AnimalDefinition, AnimalSpecies } from '../data/animals';
import { WORLD_HEIGHT, WORLD_WIDTH } from '../config';
import { floatEmoji } from '../utils/effects';
import { attachEntityTap } from '../utils/tap';

export type AnimalState = 'IDLE' | 'WALKING' | 'SPECIAL';

const HORIZON_Y = 220;

/**
 * A single class covers every species. The eight animals only differ in
 * their data (emoji, speed, special reaction) which keeps this from turning
 * into eight near-identical subclasses.
 */
export class Animal extends Phaser.GameObjects.Container {
  readonly species: AnimalSpecies;
  readonly definition: AnimalDefinition;

  currentState: AnimalState = 'IDLE';
  private idleTimer: number;
  private facing = 1;
  private readonly visual: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    definition: AnimalDefinition,
    isDragging: () => boolean,
  ) {
    super(scene, x, y);
    this.definition = definition;
    this.species = definition.species;

    const shadow = scene.add.ellipse(0, 20, 50, 16, 0x14231a, 0.2);
    this.visual = scene.add
      .text(0, 0, definition.emoji, { fontSize: `${definition.fontSize}px` })
      .setOrigin(0.5, 0.82);

    this.add([shadow, this.visual]);
    this.setSize(80, 90);
    this.setInteractive(new Phaser.Geom.Rectangle(-40, -70, 80, 90), Phaser.Geom.Rectangle.Contains);
    attachEntityTap(this, isDragging, () => this.triggerSpecial());

    scene.add.existing(this);
    this.setDepth(y);

    this.idleTimer = scene.time.now + Phaser.Math.Between(1500, 4500);
  }

  /** Called once per frame by AnimalSystem. */
  update(time: number): void {
    this.setDepth(this.y);
    if (this.currentState === 'IDLE' && time >= this.idleTimer) {
      this.startWalking();
    }
  }

  private startWalking(): void {
    const scene = this.scene;
    if (!scene) return;

    const angle = Math.random() * Math.PI * 2;
    const distance = Phaser.Math.Between(50, 140);
    const targetX = Phaser.Math.Clamp(this.x + Math.cos(angle) * distance, 90, WORLD_WIDTH - 90);
    const targetY = Phaser.Math.Clamp(this.y + Math.sin(angle) * distance, HORIZON_Y, WORLD_HEIGHT - 90);

    const dx = targetX - this.x;
    if (Math.abs(dx) > 3) {
      this.facing = dx < 0 ? -1 : 1;
      this.visual.setScale(this.facing, 1);
    }

    const travelDistance = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
    const duration = Math.max(600, (travelDistance / this.definition.moveSpeed) * 1000);

    this.currentState = 'WALKING';
    scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      duration,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.currentState = 'IDLE';
        this.idleTimer = scene.time.now + Phaser.Math.Between(2500, 6000);
      },
    });
  }

  /** Immediate, self-resetting reaction to being tapped. Never errors out or blocks idle life. */
  triggerSpecial(): void {
    const scene = this.scene;
    if (!scene || this.currentState === 'SPECIAL') return;

    if (this.currentState === 'WALKING') {
      scene.tweens.killTweensOf(this);
    }
    this.currentState = 'SPECIAL';

    const finish = () => {
      this.currentState = 'IDLE';
      this.idleTimer = scene.time.now + Phaser.Math.Between(2000, 5000);
    };

    this.playSpecialAnimation(finish);
  }

  private playSpecialAnimation(onComplete: () => void): void {
    const scene = this.scene;
    const visual = this.visual;

    switch (this.definition.special) {
      case 'spray':
        scene.tweens.add({
          targets: visual,
          scaleX: 1.1,
          scaleY: 1.15,
          duration: 220,
          yoyo: true,
          repeat: 1,
          onComplete,
        });
        floatEmoji(scene, this.x + 18, this.y - 40, '💦', { rise: 40, size: 22 });
        floatEmoji(scene, this.x - 12, this.y - 40, '💦', { rise: 44, size: 20 });
        break;

      case 'yawn':
        scene.tweens.add({
          targets: visual,
          angle: { from: 0, to: -8 },
          duration: 350,
          yoyo: true,
          repeat: 1,
          onComplete,
        });
        floatEmoji(scene, this.x, this.y - 50, '💤', { rise: 50, size: 22 });
        break;

      case 'nod':
        scene.tweens.add({
          targets: visual,
          angle: { from: 0, to: -10 },
          duration: 220,
          yoyo: true,
          repeat: 2,
          onComplete,
        });
        break;

      case 'jump':
        scene.tweens.add({
          targets: this,
          y: this.y - 34,
          duration: 220,
          ease: 'Sine.easeOut',
          yoyo: true,
          onComplete,
        });
        break;

      case 'slide':
        scene.tweens.add({
          targets: this,
          x: this.x + 26 * this.facing,
          duration: 260,
          ease: 'Sine.easeOut',
          yoyo: true,
          onComplete,
        });
        break;

      case 'shake':
        scene.tweens.add({
          targets: visual,
          angle: { from: -8, to: 8 },
          duration: 90,
          yoyo: true,
          repeat: 4,
          onComplete: () => {
            visual.setAngle(0);
            onComplete();
          },
        });
        break;

      case 'sit':
        scene.tweens.add({
          targets: visual,
          scaleY: 0.8,
          duration: 260,
          yoyo: true,
          hold: 260,
          onComplete,
        });
        break;

      case 'snap':
        scene.tweens.add({
          targets: visual,
          scaleX: 1.25,
          duration: 160,
          yoyo: true,
          repeat: 1,
          onComplete,
        });
        break;

      default:
        onComplete();
    }

    floatEmoji(scene, this.x, this.y - 30, '⭐', { rise: 40, size: 22 });
  }
}
