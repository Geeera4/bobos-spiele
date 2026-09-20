import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { ZooScene } from './scenes/ZooScene';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const WORLD_WIDTH = 3000;
export const WORLD_HEIGHT = 2000;

export const MIN_ZOOM = 0.7;
export const MAX_ZOOM = 1.5;

export function createGameConfig(): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: 'app',
    backgroundColor: '#7ec850',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    input: {
      activePointers: 3,
    },
    render: {
      antialias: true,
      pixelArt: false,
    },
    scene: [BootScene, ZooScene],
  };
}
