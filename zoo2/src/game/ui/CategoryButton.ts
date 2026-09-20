import Phaser from 'phaser';
import { attachButtonTap } from '../utils/tap';

export interface CategoryButtonConfig {
  icon: string;
  label: string;
  width: number;
  height: number;
}

/** One big bottom-bar category button (🐾 Tiere, 🌳 Natur, ...). */
export class CategoryButton extends Phaser.GameObjects.Container {
  private readonly background: Phaser.GameObjects.Graphics;
  private readonly width_: number;
  private readonly height_: number;
  private active = false;

  constructor(scene: Phaser.Scene, x: number, y: number, config: CategoryButtonConfig, onTap: () => void) {
    super(scene, x, y);
    this.width_ = config.width;
    this.height_ = config.height;

    this.background = scene.add.graphics();
    this.redraw();

    const icon = scene.add
      .text(0, -this.height_ * 0.16, config.icon, { fontSize: `${this.height_ * 0.42}px` })
      .setOrigin(0.5);
    const label = scene.add
      .text(0, this.height_ * 0.32, config.label, {
        fontSize: `${Math.max(12, this.height_ * 0.15)}px`,
        fontFamily: 'system-ui, sans-serif',
        color: '#4a4f57',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add([this.background, icon, label]);
    this.setSize(this.width_, this.height_);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-this.width_ / 2, -this.height_ / 2, this.width_, this.height_),
      Phaser.Geom.Rectangle.Contains,
    );
    attachButtonTap(this, onTap);

    scene.add.existing(this);
  }

  setActive(active: boolean): void {
    if (this.active === active) return;
    this.active = active;
    this.redraw();
  }

  private redraw(): void {
    const w = this.width_;
    const h = this.height_;
    this.background.clear();
    this.background.fillStyle(this.active ? 0xfff3c4 : 0xffffff, 1);
    this.background.fillRoundedRect(-w / 2, -h / 2, w, h, 20);
    this.background.lineStyle(4, this.active ? 0xe6ab00 : 0x2f3337, 1);
    this.background.strokeRoundedRect(-w / 2, -h / 2, w, h, 20);
  }
}
