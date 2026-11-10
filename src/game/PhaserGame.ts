import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { CourtyardScene } from './scenes/CourtyardScene';
import { CorridorScene } from './scenes/CorridorScene';

export function createOdyLyceeGame(parentElement: HTMLElement): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    parent: parentElement,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#dfd9ce',
    pixelArt: true,
    roundPixels: true,
    render: {
      pixelArt: true,
      antialias: false,
      roundPixels: true,
      maxLights: 28,
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: [BootScene, CourtyardScene, CorridorScene],
  };

  return new Phaser.Game(config);
}
