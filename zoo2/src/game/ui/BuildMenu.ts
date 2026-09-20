import Phaser from 'phaser';
import { CategoryButton } from './CategoryButton';
import { ObjectButton } from './ObjectButton';
import { ANIMAL_LIST } from '../data/animals';
import { OBJECT_LIST, ObjectCategory } from '../data/objects';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { PlaceableSelection } from '../systems/PlacementSystem';

interface CategoryInfo {
  key: 'tiere' | ObjectCategory;
  icon: string;
  label: string;
}

interface TrayItem {
  icon: string;
  label: string;
  selection: PlaceableSelection;
}

const CATEGORIES: CategoryInfo[] = [
  { key: 'tiere', icon: '🐾', label: 'Tiere' },
  { key: 'natur', icon: '🌳', label: 'Natur' },
  { key: 'zoo', icon: '🏠', label: 'Zoo' },
  { key: 'deko', icon: '🌸', label: 'Deko' },
];

const BAR_HEIGHT = 118;
const BAR_MARGIN_X = 20;
const CATEGORY_GAP = 16;
const TRAY_HEIGHT = 150;
const TRAY_GAP = 14;
const ITEM_SIZE = 92;
const ITEM_GAP = 14;

function itemsForCategory(key: CategoryInfo['key']): TrayItem[] {
  if (key === 'tiere') {
    return ANIMAL_LIST.map((def) => ({
      icon: def.emoji,
      label: def.label,
      selection: { kind: 'animal', species: def.species } as PlaceableSelection,
    }));
  }
  return OBJECT_LIST.filter((def) => def.category === key).map((def) => ({
    icon: def.emoji,
    label: def.label,
    selection: { kind: 'object', type: def.type } as PlaceableSelection,
  }));
}

/**
 * The whole bottom toolbar: category row + the item tray that pops open
 * above it. Fixed to the camera so it stays put while the world scrolls.
 */
export class BuildMenu extends Phaser.GameObjects.Container {
  private readonly trayPanel: Phaser.GameObjects.Graphics;
  private readonly categoryButtons = new Map<CategoryInfo['key'], CategoryButton>();
  private trayButtons: ObjectButton[] = [];
  private openCategory: CategoryInfo['key'] | null = null;
  private selection: PlaceableSelection | null = null;

  constructor(
    scene: Phaser.Scene,
    private onSelectionChange: (selection: PlaceableSelection | null) => void,
  ) {
    super(scene, 0, 0);

    const barY = GAME_HEIGHT - BAR_HEIGHT / 2 - 10;
    const barPanel = scene.add.graphics();
    barPanel.fillStyle(0xfffef6, 0.96);
    barPanel.fillRoundedRect(BAR_MARGIN_X, barY - BAR_HEIGHT / 2, GAME_WIDTH - BAR_MARGIN_X * 2, BAR_HEIGHT, 26);
    barPanel.lineStyle(4, 0x2f3337, 1);
    barPanel.strokeRoundedRect(BAR_MARGIN_X, barY - BAR_HEIGHT / 2, GAME_WIDTH - BAR_MARGIN_X * 2, BAR_HEIGHT, 26);

    this.trayPanel = scene.add.graphics();
    this.trayPanel.setVisible(false);

    this.add([barPanel, this.trayPanel]);

    const categoryWidth = (GAME_WIDTH - BAR_MARGIN_X * 2 - CATEGORY_GAP * (CATEGORIES.length - 1)) / CATEGORIES.length;
    const startX = BAR_MARGIN_X + categoryWidth / 2;

    CATEGORIES.forEach((category, index) => {
      const x = startX + index * (categoryWidth + CATEGORY_GAP);
      const button = new CategoryButton(
        scene,
        x,
        barY,
        { icon: category.icon, label: category.label, width: categoryWidth, height: BAR_HEIGHT - 16 },
        () => this.toggleCategory(category.key),
      );
      this.categoryButtons.set(category.key, button);
      this.add(button);
    });

    this.setScrollFactor(0);
    this.setDepth(1_000_000);
    scene.add.existing(this);
  }

  private toggleCategory(key: CategoryInfo['key']): void {
    if (this.openCategory === key) {
      this.closeTray();
      return;
    }
    this.openTray(key);
  }

  private openTray(key: CategoryInfo['key']): void {
    this.openCategory = key;
    this.selection = null;
    this.onSelectionChange(null);
    this.rebuildTray(key);
    this.categoryButtons.forEach((button, buttonKey) => button.setActive(buttonKey === key));
  }

  private closeTray(): void {
    this.openCategory = null;
    this.selection = null;
    this.onSelectionChange(null);
    this.trayButtons.forEach((button) => button.destroy());
    this.trayButtons = [];
    this.trayPanel.setVisible(false);
    this.categoryButtons.forEach((button) => button.setActive(false));
  }

  private rebuildTray(key: CategoryInfo['key']): void {
    this.trayButtons.forEach((button) => button.destroy());
    this.trayButtons = [];

    const items = itemsForCategory(key);
    const barY = GAME_HEIGHT - BAR_HEIGHT / 2 - 10;
    const trayY = barY - BAR_HEIGHT / 2 - TRAY_GAP - TRAY_HEIGHT / 2;

    const totalWidth = items.length * ITEM_SIZE + (items.length - 1) * ITEM_GAP;
    const startX = GAME_WIDTH / 2 - totalWidth / 2 + ITEM_SIZE / 2;

    this.trayPanel.clear();
    this.trayPanel.fillStyle(0xfffef6, 0.96);
    this.trayPanel.fillRoundedRect(
      BAR_MARGIN_X,
      trayY - TRAY_HEIGHT / 2,
      GAME_WIDTH - BAR_MARGIN_X * 2,
      TRAY_HEIGHT,
      24,
    );
    this.trayPanel.lineStyle(4, 0x2f3337, 1);
    this.trayPanel.strokeRoundedRect(
      BAR_MARGIN_X,
      trayY - TRAY_HEIGHT / 2,
      GAME_WIDTH - BAR_MARGIN_X * 2,
      TRAY_HEIGHT,
      24,
    );
    this.trayPanel.setVisible(true);

    items.forEach((item, index) => {
      const x = startX + index * (ITEM_SIZE + ITEM_GAP);
      const button = new ObjectButton(
        this.scene,
        x,
        trayY,
        { icon: item.icon, label: item.label, size: ITEM_SIZE },
        () => this.selectItem(item, button),
      );
      this.trayButtons.push(button);
      this.add(button);
    });
  }

  private selectItem(item: TrayItem, button: ObjectButton): void {
    this.selection = item.selection;
    this.trayButtons.forEach((b) => b.setSelected(b === button));
    this.onSelectionChange(this.selection);
  }
}
