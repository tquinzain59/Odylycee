import Phaser from 'phaser';
import { Persona } from '../../types/game';

export class PlayerController {
  private scene: Phaser.Scene;
  public sprite: Phaser.Physics.Arcade.Sprite;
  private nameTagBg: Phaser.GameObjects.Graphics;
  private nameTagText: Phaser.GameObjects.Text;
  private currentAvatarKey: string;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: {
    Z: Phaser.Input.Keyboard.Key;
    Q: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
  };

  private readonly speed = 195;

  constructor(scene: Phaser.Scene, x: number, y: number, persona: Persona) {
    this.scene = scene;
    this.currentAvatarKey = persona.avatarKey;

    // Sprite physique 32x32 en plein jour (sans halo lumineux)
    this.sprite = scene.physics.add.sprite(x, y, persona.avatarKey, 0);
    this.sprite.setDepth(20);
    this.sprite.setCollideWorldBounds(true);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(18, 12);
    body.setOffset(7, 18);

    // Badge nominatif flottant au-dessus du joueur
    this.nameTagBg = scene.add.graphics();
    this.nameTagBg.setDepth(35);

    this.nameTagText = scene.add
      .text(x, y - 28, '', {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#ffffff',
        resolution: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(36);

    this.setupKeyboard();
    this.syncPersona(persona);
  }

  private setupKeyboard(): void {
    const kb = this.scene.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.keys = {
      Z: kb.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
      Q: kb.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      S: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      W: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      E: kb.addKey(Phaser.Input.Keyboard.KeyCodes.E),
    };
  }

  public syncPersona(persona: Persona): void {
    this.currentAvatarKey = persona.avatarKey;
    const isMoving =
      this.sprite.body &&
      (Math.abs(this.sprite.body.velocity.x) > 5 || Math.abs(this.sprite.body.velocity.y) > 5);

    this.sprite.setTexture(persona.avatarKey, 0);
    this.sprite.play(isMoving ? `${persona.avatarKey}_walk` : `${persona.avatarKey}_idle`, true);

    const roleSuffix = persona.role === 'TEACHER' ? 'PROF' : persona.specialty ?? 'STI2D';
    this.nameTagText.setText(`${persona.name} [${roleSuffix}]`);
    this.nameTagText.setColor('#ffffff');
    this.redrawNameTag(persona.accentHex);
  }

  private redrawNameTag(accentHex: number): void {
    const w = Math.max(76, this.nameTagText.width + 14);
    const h = 16;
    const x = this.sprite.x - w / 2;
    const y = this.sprite.y - 32;

    this.nameTagBg.clear();
    this.nameTagBg.fillStyle(0x0f172a, 0.88);
    this.nameTagBg.fillRoundedRect(x, y, w, h, 4);
    this.nameTagBg.lineStyle(1.5, accentHex, 1);
    this.nameTagBg.strokeRoundedRect(x, y, w, h, 4);

    this.nameTagText.setPosition(this.sprite.x, y + h / 2);
  }

  public isInteractJustPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.E);
  }

  public update(persona: Persona): void {
    const up = this.cursors.up.isDown || this.keys.Z.isDown || this.keys.W.isDown;
    const down = this.cursors.down.isDown || this.keys.S.isDown;
    const left = this.cursors.left.isDown || this.keys.Q.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;

    let vx = 0;
    let vy = 0;

    if (left) vx -= 1;
    if (right) vx += 1;
    if (up) vy -= 1;
    if (down) vy += 1;

    if (vx !== 0 && vy !== 0) {
      const inv = 1 / Math.SQRT2;
      vx *= inv;
      vy *= inv;
    }

    this.sprite.setVelocity(vx * this.speed, vy * this.speed);

    if (vx < 0) {
      this.sprite.setFlipX(true);
    } else if (vx > 0) {
      this.sprite.setFlipX(false);
    }

    const isMoving = vx !== 0 || vy !== 0;
    const targetAnim = isMoving
      ? `${this.currentAvatarKey}_walk`
      : `${this.currentAvatarKey}_idle`;

    if (this.sprite.anims.currentAnim?.key !== targetAnim) {
      this.sprite.play(targetAnim, true);
    }

    this.redrawNameTag(persona.accentHex);
  }
}
