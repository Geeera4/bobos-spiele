import Phaser from 'phaser';

/** Minimal shape we rely on from Phaser's interactive-object pointer events. */
interface StoppableEvent {
  stopPropagation(): void;
}

/**
 * Attaches tap handling to a world entity (animal/decoration). Whether this
 * counts as a tap - rather than the release of a camera pan that happened to
 * pass over the entity - is decided by the single shared `isDragging` source
 * of truth from InteractionSystem, so world-tap and entity-tap never disagree.
 */
export function attachEntityTap(
  target: Phaser.GameObjects.GameObject,
  isDragging: () => boolean,
  onTap: () => void,
): void {
  target.on(
    'pointerup',
    (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: StoppableEvent) => {
      if (isDragging()) return;
      event.stopPropagation();
      onTap();
    },
  );
}

/** Attaches immediate, always-responsive tap handling to a UI button. */
export function attachButtonTap(target: Phaser.GameObjects.GameObject, onTap: () => void): void {
  target.on('pointerdown', (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: StoppableEvent) => {
    event.stopPropagation();
  });
  target.on('pointerup', (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: StoppableEvent) => {
    event.stopPropagation();
    onTap();
  });
}
