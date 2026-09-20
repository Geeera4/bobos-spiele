import Phaser from 'phaser';

/**
 * Small floating emoji burst used for stars, water splashes, leaves, hearts, ...
 * Kept intentionally lightweight (plain tweened Text objects) instead of a
 * particle system, since we only ever need a handful of these on screen at once.
 */
export function floatEmoji(
  scene: Phaser.Scene,
  x: number,
  y: number,
  emoji: string,
  options: { size?: number; rise?: number; spread?: number; duration?: number; depth?: number } = {},
): void {
  const size = options.size ?? 28;
  const rise = options.rise ?? 60;
  const spread = options.spread ?? 20;
  const duration = options.duration ?? 700;

  const dx = Phaser.Math.Between(-spread, spread);
  const text = scene.add
    .text(x + Phaser.Math.Between(-6, 6), y, emoji, { fontSize: `${size}px` })
    .setOrigin(0.5)
    .setDepth(options.depth ?? 100000)
    .setScale(0.4)
    .setAlpha(0);

  scene.tweens.add({
    targets: text,
    alpha: { from: 0, to: 1 },
    scale: { from: 0.4, to: 1 },
    duration: duration * 0.25,
    ease: 'Back.easeOut',
  });

  scene.tweens.add({
    targets: text,
    y: y - rise,
    x: x + dx,
    alpha: 0,
    delay: duration * 0.15,
    duration: duration * 0.85,
    ease: 'Sine.easeIn',
    onComplete: () => text.destroy(),
  });
}

export function starBurst(scene: Phaser.Scene, x: number, y: number): void {
  floatEmoji(scene, x, y - 10, '⭐', { size: 24, rise: 46, spread: 24, duration: 650 });
  floatEmoji(scene, x, y - 4, '✨', { size: 20, rise: 60, spread: 30, duration: 800 });
}

export function bouncePlacement(scene: Phaser.Scene, target: Phaser.GameObjects.Container): void {
  target.setScale(0);
  scene.tweens.add({
    targets: target,
    scale: 1,
    duration: 420,
    ease: 'Back.easeOut',
  });
}
