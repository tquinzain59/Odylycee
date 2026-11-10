import Phaser from 'phaser';
import { ProceduralPixelAssets } from '../assets/ProceduralPixelAssets';
import { useGameStore } from '../../state/useGameStore';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  public create(): void {
    ProceduralPixelAssets.generateAll(this);

    const initialZone = useGameStore.getState().currentZone;
    if (initialZone === 'baggio:tsti2d3') {
      this.scene.start('CorridorScene');
    } else {
      this.scene.start('CourtyardScene');
    }
  }
}
