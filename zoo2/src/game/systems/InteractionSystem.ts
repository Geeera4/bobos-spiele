import Phaser from 'phaser';
import { MAX_ZOOM, MIN_ZOOM } from '../config';

const TAP_MOVE_THRESHOLD = 12; // screen px - below this, a press+release is a tap, not a pan

export interface InteractionCallbacks {
  onTap: (worldX: number, worldY: number) => void;
}

/**
 * Single source of truth for "is the current gesture a camera drag or a
 * tap". Everything else (world tap-to-place, animal/decoration taps) asks
 * this system instead of re-detecting drag on its own, so they can never
 * disagree - the one input conflict the spec explicitly calls out.
 */
export class InteractionSystem {
  private downX = 0;
  private downY = 0;
  private dragging = false;
  private pinchDistance: number | null = null;

  constructor(
    private scene: Phaser.Scene,
    private callbacks: InteractionCallbacks,
  ) {
    this.setup();
  }

  isDragging(): boolean {
    return this.dragging;
  }

  private setup(): void {
    const { scene } = this;
    const cam = scene.cameras.main;

    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.getActivePointers().length > 1) return;
      this.downX = pointer.x;
      this.downY = pointer.y;
      this.dragging = false;
    });

    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const activePointers = this.getActivePointers();

      if (activePointers.length >= 2) {
        this.handlePinch(activePointers, cam);
        return;
      }

      this.pinchDistance = null;
      if (!pointer.isDown) return;

      if (!this.dragging) {
        const moved = Phaser.Math.Distance.Between(this.downX, this.downY, pointer.x, pointer.y);
        if (moved > TAP_MOVE_THRESHOLD) this.dragging = true;
      }

      if (this.dragging) {
        cam.scrollX -= (pointer.x - pointer.prevPosition.x) / cam.zoom;
        cam.scrollY -= (pointer.y - pointer.prevPosition.y) / cam.zoom;
      }
    });

    scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.getActivePointers().length > 0) return; // wait for every finger to lift

      const wasDragging = this.dragging;
      this.dragging = false;
      this.pinchDistance = null;
      if (wasDragging) return;

      const world = cam.getWorldPoint(pointer.x, pointer.y);
      this.callbacks.onTap(world.x, world.y);
    });

    scene.input.on(
      'wheel',
      (
        _pointer: Phaser.Input.Pointer,
        _objects: Phaser.GameObjects.GameObject[],
        _deltaX: number,
        deltaY: number,
      ) => {
        cam.setZoom(Phaser.Math.Clamp(cam.zoom - deltaY * 0.001, MIN_ZOOM, MAX_ZOOM));
      },
    );
  }

  private getActivePointers(): Phaser.Input.Pointer[] {
    return this.scene.input.manager.pointers.filter((pointer) => pointer.isDown);
  }

  private handlePinch(pointers: Phaser.Input.Pointer[], cam: Phaser.Cameras.Scene2D.Camera): void {
    const [a, b] = pointers;
    const distance = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);

    if (this.pinchDistance !== null) {
      const delta = distance - this.pinchDistance;
      cam.setZoom(Phaser.Math.Clamp(cam.zoom + delta * 0.0025, MIN_ZOOM, MAX_ZOOM));
    }

    this.pinchDistance = distance;
    this.dragging = true; // a pinch must never also register as a placement tap
  }
}
