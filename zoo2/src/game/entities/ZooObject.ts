import Phaser from 'phaser';
import { ObjectDefinition } from '../data/objects';
import { attachEntityTap } from '../utils/tap';

/**
 * Covers every decoration/building. They only differ by data (emoji, idle
 * animation, solid radius), so one class is enough instead of one per type.
 */
export class ZooObject extends Phaser.GameObjects.Container {
  readonly definition: ObjectDefinition;
  private readonly visual: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    definition: ObjectDefinition,
    isDragging: () => boolean,
  ) {
    super(scene, x, y);
    this.definition = definition;

    this.visual = scene.add
      .text(0, 0, definition.emoji, { fontSize: `${definition.fontSize}px` })
      .setOrigin(0.5, 0.85);

    this.add(this.visual);
    this.setSize(definition.fontSize, definition.fontSize * 1.2);
    this.setInteractive();
    attachEntityTap(this, isDragging, () => this.triggerReaction());

    scene.add.existing(this);
    this.setDepth(y);
    this.startIdleAnimation(scene);
  }

  private startIdleAnimation(scene: Phaser.Scene): void {
    const delay = Phaser.Math.Between(0, 1200);

    if (this.definition.idle === 'sway') {
      scene.tweens.add({
        targets: this.visual,
        angle: { from: -4, to: 4 },
        duration: Phaser.Math.Between(1800, 2600),
        delay,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    } else if (this.definition.idle === 'shimmer') {
      scene.tweens.add({
        targets: this.visual,
        alpha: { from: 0.85, to: 1 },
        scale: { from: 0.97, to: 1.03 },
        duration: Phaser.Math.Between(1600, 2200),
        delay,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  triggerReaction(): void {
    const scene = this.scene;
    if (!scene) return;

    if (this.definition.type === 'teich') {
      for (let i = 0; i < 3; i++) {
        scene.time.delayedCall(i * 180, () => this.spawnRipple());
      }
    } else {
      scene.tweens.add({
        targets: this.visual,
        angle: { from: -10, to: 10 },
        scale: { from: 1, to: 1.1 },
        duration: 140,
        yoyo: true,
        repeat: 2,
        onComplete: () => this.visual.setAngle(0),
      });
    }
  }

  private spawnRipple(): void {
    const scene = this.scene;
    const ring = scene.add.circle(this.x, this.y + 12, 8, 0xffffff, 0);
    ring.setStrokeStyle(2, 0xffffff, 0.8);
    ring.setDepth(this.depth + 1);
    scene.tweens.add({
      targets: ring,
      radius: 40,
      alpha: { from: 0.8, to: 0 },
      duration: 900,
      ease: 'Sine.easeOut',
      onComplete: () => ring.destroy(),
    });
  }
}
