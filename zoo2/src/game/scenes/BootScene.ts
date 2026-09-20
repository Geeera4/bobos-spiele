import Phaser from 'phaser';

/**
 * Generates simple placeholder textures at runtime so the game runs
 * end-to-end with zero external art. Swapping these for real sprite sheets
 * later only means changing this scene, nothing that depends on them.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    this.createGrassTexture();
    this.scene.start('Zoo');
  }

  private createGrassTexture(): void {
    const size = 128;
    const g = this.add.graphics();

    g.fillStyle(0x7ec850, 1);
    g.fillRect(0, 0, size, size);

    g.fillStyle(0x8fd968, 0.5);
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(0, size);
      const y = Phaser.Math.Between(0, size);
      g.fillEllipse(x, y, Phaser.Math.Between(18, 34), Phaser.Math.Between(8, 16));
    }

    g.fillStyle(0x6bb43f, 0.35);
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(0, size);
      const y = Phaser.Math.Between(0, size);
      g.fillEllipse(x, y, Phaser.Math.Between(14, 26), Phaser.Math.Between(6, 12));
    }

    g.generateTexture('grass', size, size);
    g.destroy();
  }
}
