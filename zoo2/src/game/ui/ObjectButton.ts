import Phaser from 'phaser';
import { attachButtonTap } from '../utils/tap';

export interface ObjectButtonConfig {
  icon: string;
  label: string;
  size: number;
}

/** One card in the horizontal item tray (a single animal or decoration to place). */
export class ObjectButton extends Phaser.GameObjects.Container {
  private readonly background: Phaser.GameObjects.Graphics;
  private readonly size: number;
  private selected = false;

  constructor(scene: Phaser.Scene, x: number, y: number, config: ObjectButtonConfig, onTap: () => void) {
    super(scene, x, y);
    this.size = config.size;

    this.background = scene.add.graphics();
    this.redraw();

    const icon = scene.add.text(0, -4, config.icon, { fontSize: `${this.size * 0.46}px` }).setOrigin(0.5);
    const label = scene.add
      .text(0, this.size * 0.34, config.label, {
        fontSize: `${Math.max(11, this.size * 0.13)}px`,
        fontFamily: 'system-ui, sans-serif',
        color: '#6c737f',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add([this.background, icon, label]);
    this.setSize(this.size, this.size);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-this.size / 2, -this.size / 2, this.size, this.size),
      Phaser.Geom.Rectangle.Contains,
    );
    attachButtonTap(this, onTap);

    scene.add.existing(this);
  }

  setSelected(selected: boolean): void {
    if (this.selected === selected) return;
    this.selected = selected;
    this.redraw();
  }

  private redraw(): void {
    const s = this.size;
    this.background.clear();
    this.background.fillStyle(this.selected ? 0xeafaf0 : 0xffffff, 1);
    this.background.fillRoundedRect(-s / 2, -s / 2, s, s, 16);
    this.background.lineStyle(3, this.selected ? 0x1f8a4c : 0xc9ccd1, 1);
    this.background.strokeRoundedRect(-s / 2, -s / 2, s, s, 16);
  }
}
