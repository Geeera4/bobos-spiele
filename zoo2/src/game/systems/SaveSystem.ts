import { AnimalSpecies } from '../data/animals';
import { ObjectType } from '../data/objects';

const STORAGE_KEY = 'bobos-zoo2-save-v1';
const AUTOSAVE_DELAY_MS = 400;

export interface AnimalSaveData {
  species: AnimalSpecies;
  x: number;
  y: number;
}

export interface ObjectSaveData {
  type: ObjectType;
  x: number;
  y: number;
}

export interface ZooSettings {
  soundEnabled: boolean;
}

export interface ZooSaveData {
  animals: AnimalSaveData[];
  objects: ObjectSaveData[];
  settings: ZooSettings;
}

function isAnimalSaveData(value: unknown): value is AnimalSaveData {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.species === 'string' && typeof v.x === 'number' && typeof v.y === 'number';
}

function isObjectSaveData(value: unknown): value is ObjectSaveData {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.type === 'string' && typeof v.x === 'number' && typeof v.y === 'number';
}

/**
 * Thin localStorage wrapper. Loads/validates once at boot and autosaves
 * (debounced) whenever the scene reports a change. No backend, no network.
 */
export class SaveSystem {
  private pendingSave: ReturnType<typeof setTimeout> | null = null;

  load(): ZooSaveData | null {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as Partial<ZooSaveData>;
      const animals = Array.isArray(parsed.animals) ? parsed.animals.filter(isAnimalSaveData) : [];
      const objects = Array.isArray(parsed.objects) ? parsed.objects.filter(isObjectSaveData) : [];

      return {
        animals,
        objects,
        settings: { soundEnabled: parsed.settings?.soundEnabled !== false },
      };
    } catch {
      return null;
    }
  }

  scheduleSave(getState: () => ZooSaveData): void {
    if (this.pendingSave) clearTimeout(this.pendingSave);
    this.pendingSave = setTimeout(() => {
      this.pendingSave = null;
      this.saveNow(getState());
    }, AUTOSAVE_DELAY_MS);
  }

  saveNow(state: ZooSaveData): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // No persistent storage available (e.g. private browsing quota) - the
      // zoo simply keeps working for the current session without saving.
    }
  }
}
