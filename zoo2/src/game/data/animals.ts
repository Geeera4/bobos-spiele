export type AnimalSpecies =
  | 'elefant'
  | 'loewe'
  | 'giraffe'
  | 'affe'
  | 'pinguin'
  | 'zebra'
  | 'panda'
  | 'krokodil';

export type SpecialAnimation = 'spray' | 'yawn' | 'nod' | 'jump' | 'slide' | 'shake' | 'sit' | 'snap';

export interface AnimalDefinition {
  species: AnimalSpecies;
  label: string;
  emoji: string;
  fontSize: number;
  moveSpeed: number;
  special: SpecialAnimation;
  /** Loves to hang out near this decoration type for emergent mini-interactions. */
  attractedTo?: 'teich' | 'baum';
}

export const ANIMAL_DEFINITIONS: Record<AnimalSpecies, AnimalDefinition> = {
  elefant: {
    species: 'elefant',
    label: 'Elefant',
    emoji: '🐘',
    fontSize: 72,
    moveSpeed: 34,
    special: 'spray',
    attractedTo: 'teich',
  },
  loewe: {
    species: 'loewe',
    label: 'Löwe',
    emoji: '🦁',
    fontSize: 66,
    moveSpeed: 40,
    special: 'yawn',
  },
  giraffe: {
    species: 'giraffe',
    label: 'Giraffe',
    emoji: '🦒',
    fontSize: 78,
    moveSpeed: 32,
    special: 'nod',
    attractedTo: 'baum',
  },
  affe: {
    species: 'affe',
    label: 'Affe',
    emoji: '🐵',
    fontSize: 58,
    moveSpeed: 46,
    special: 'jump',
  },
  pinguin: {
    species: 'pinguin',
    label: 'Pinguin',
    emoji: '🐧',
    fontSize: 56,
    moveSpeed: 38,
    special: 'slide',
    attractedTo: 'teich',
  },
  zebra: {
    species: 'zebra',
    label: 'Zebra',
    emoji: '🦓',
    fontSize: 64,
    moveSpeed: 44,
    special: 'shake',
  },
  panda: {
    species: 'panda',
    label: 'Panda',
    emoji: '🐼',
    fontSize: 62,
    moveSpeed: 30,
    special: 'sit',
  },
  krokodil: {
    species: 'krokodil',
    label: 'Krokodil',
    emoji: '🐊',
    fontSize: 60,
    moveSpeed: 26,
    special: 'snap',
    attractedTo: 'teich',
  },
};

export const ANIMAL_LIST: AnimalDefinition[] = Object.values(ANIMAL_DEFINITIONS);
