export type ObjectType =
  | 'baum'
  | 'tanne'
  | 'blume'
  | 'sonnenblume'
  | 'busch'
  | 'fels'
  | 'teich'
  | 'tierhaus'
  | 'baumstamm';

export type ObjectCategory = 'natur' | 'zoo' | 'deko';
export type IdleAnimation = 'sway' | 'shimmer' | 'none';

export interface ObjectDefinition {
  type: ObjectType;
  label: string;
  emoji: string;
  fontSize: number;
  category: ObjectCategory;
  idle: IdleAnimation;
  /** Radius other things should avoid overlapping, in world pixels. */
  solidRadius: number;
}

export const OBJECT_DEFINITIONS: Record<ObjectType, ObjectDefinition> = {
  baum: { type: 'baum', label: 'Baum', emoji: '🌳', fontSize: 76, category: 'natur', idle: 'sway', solidRadius: 34 },
  tanne: { type: 'tanne', label: 'Tanne', emoji: '🌲', fontSize: 76, category: 'natur', idle: 'sway', solidRadius: 34 },
  busch: { type: 'busch', label: 'Busch', emoji: '🌿', fontSize: 50, category: 'natur', idle: 'sway', solidRadius: 20 },
  fels: { type: 'fels', label: 'Felsen', emoji: '🪨', fontSize: 54, category: 'natur', idle: 'none', solidRadius: 26 },
  teich: { type: 'teich', label: 'Teich', emoji: '💧', fontSize: 80, category: 'natur', idle: 'shimmer', solidRadius: 64 },
  tierhaus: { type: 'tierhaus', label: 'Tierhaus', emoji: '🏠', fontSize: 74, category: 'zoo', idle: 'none', solidRadius: 50 },
  baumstamm: { type: 'baumstamm', label: 'Baumstamm', emoji: '🪵', fontSize: 48, category: 'zoo', idle: 'none', solidRadius: 18 },
  blume: { type: 'blume', label: 'Blume', emoji: '🌸', fontSize: 44, category: 'deko', idle: 'sway', solidRadius: 0 },
  sonnenblume: { type: 'sonnenblume', label: 'Sonnenblume', emoji: '🌻', fontSize: 50, category: 'deko', idle: 'sway', solidRadius: 0 },
};

export const OBJECT_LIST: ObjectDefinition[] = Object.values(OBJECT_DEFINITIONS);
