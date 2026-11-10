import Phaser from 'phaser';
import { InteractablePayload } from '../../types/game';

export interface NpcConfig {
  id: string;
  name: string;
  roleLabel: string;
  avatarKey: string;
  x: number;
  y: number;
  accentColor: string;
  accentHex: number;
  ambientBubble: string;
  dialogueLines: string[];
}

export class NpcActor {
  public config: NpcConfig;
  public sprite: Phaser.Physics.Arcade.Sprite;
  private labelText: Phaser.GameObjects.Text;
  private bubbleContainer: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, config: NpcConfig) {
    this.config = config;

    // Sprite PNJ immobile en plein jour
    this.sprite = scene.physics.add.sprite(config.x, config.y, config.avatarKey, 0);
    this.sprite.setImmovable(true);
    this.sprite.setDepth(16);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(18, 14);
    body.setOffset(7, 16);

    // Étiquette PNJ
    this.labelText = scene.add
      .text(config.x, config.y - 22, `${config.name} • ${config.roleLabel}`, {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
        padding: { x: 5, y: 2 },
        resolution: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(30);

    // Bulle de dialogue claire et fixe
    const bubbleBg = scene.add.graphics();
    const bubbleText = scene.add
      .text(0, 0, config.ambientBubble, {
        fontFamily: '"Space Grotesk", sans-serif',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#0f172a',
        resolution: 2,
      })
      .setOrigin(0.5, 0.5);

    const bw = bubbleText.width + 14;
    const bh = 18;
    bubbleBg.fillStyle(0xffffff, 0.96);
    bubbleBg.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 5);
    bubbleBg.lineStyle(1.5, config.accentHex, 0.95);
    bubbleBg.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 5);

    this.bubbleContainer = scene.add.container(config.x, config.y - 40, [bubbleBg, bubbleText]);
    this.bubbleContainer.setDepth(31);
  }

  public update(_time?: number): void {
    // Immobile conformément à la demande utilisateur
    this.labelText.setPosition(this.sprite.x, this.sprite.y - 23);
    this.bubbleContainer.setPosition(this.sprite.x, this.sprite.y - 40);
  }

  public toInteractablePayload(): InteractablePayload {
    return {
      id: this.config.id,
      type: 'NPC',
      title: this.config.name,
      subtitle: `${this.config.roleLabel} — Lycée César Baggio`,
      isLocked: false,
      actionLabel: `[E] Discuter avec ${this.config.name}`,
      accentColor: this.config.accentColor,
      npcData: {
        speaker: this.config.name,
        role: this.config.roleLabel,
        lines: this.config.dialogueLines,
        statusTag: 'PRÉSENT • COUR BAGGIO',
      },
    };
  }
}
