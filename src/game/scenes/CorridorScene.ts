import Phaser from 'phaser';
import { CORRIDOR_DOORS_TSTI2D3 } from '../../data/mockBaggioData';
import { useGameStore } from '../../state/useGameStore';
import { ClassroomDoorConfig, DoorAccessResult, InteractablePayload, Persona } from '../../types/game';
import { ProceduralPixelAssets } from '../assets/ProceduralPixelAssets';
import { PlayerController } from '../entities/PlayerController';
import { evaluateDoorAccess } from '../systems/AccessControl';

interface RenderedCorridorDoor {
  config: ClassroomDoorConfig;
  access: DoorAccessResult;
  doorSprite: Phaser.GameObjects.Image;
  holoLockSprite: Phaser.GameObjects.Image;
  signGraphics: Phaser.GameObjects.Graphics;
  signTitleText: Phaser.GameObjects.Text;
  signSubText: Phaser.GameObjects.Text;
  floorZoneGraphics: Phaser.GameObjects.Graphics;
  floorPromptText: Phaser.GameObjects.Text;
}

export class CorridorScene extends Phaser.Scene {
  private player!: PlayerController;
  private renderedDoors: RenderedCorridorDoor[] = [];
  private exitHotspot!: { x: number; y: number; radius: number; payload: InteractablePayload };
  private unsubscribeStore?: () => void;
  private isTransitioning = false;

  private readonly worldWidth = 1360;
  private readonly worldHeight = 480;

  constructor() {
    super({ key: 'CorridorScene' });
  }

  public create(): void {
    this.isTransitioning = false;
    this.renderedDoors = [];

    ProceduralPixelAssets.generateAll(this);
    useGameStore.getState().setCurrentZone('baggio:tsti2d3');

    // Monde & Caméra en plein jour (aucun halo ni assombrissement)
    this.physics.world.setBounds(36, 174, this.worldWidth - 72, this.worldHeight - 210);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBackgroundColor('#cbd5e1');
    this.cameras.main.setZoom(1.35);
    this.cameras.main.fadeIn(220, 241, 245, 249);

    const wallColliders = this.physics.add.staticGroup();

    // 1. Sol clair en terrazzo (plein jour)
    this.add
      .tileSprite(0, 140, this.worldWidth, this.worldHeight - 140, 'tile_corridor_floor')
      .setOrigin(0, 0)
      .setDepth(0);

    // 2. Mur supérieur clair en perspective 3/4
    for (let x = 0; x < this.worldWidth; x += 64) {
      this.add.image(x + 32, 96, 'tile_wall_top').setDepth(2);
    }

    // 3. Signalétique au sol et piliers du couloir
    this.drawCorridorArchitecture(wallColliders);

    // 4. Génération dynamique des 6 portes de cours (Tronc Commun + Spécialités STI2D)
    const initialPersona = useGameStore.getState().currentPersona;
    for (const doorCfg of CORRIDOR_DOORS_TSTI2D3) {
      this.createDynamicDoor(doorCfg, initialPersona);
    }

    // 5. Escalier de sortie vers la Cour de Baggio (à gauche du couloir)
    this.buildExitToCourtyard(wallColliders);

    // 6. Mobilier du couloir (casiers techniques, bancs)
    this.buildCorridorProps(wallColliders);

    // 7. Création du joueur face aux laboratoires SIN / EE / I2D
    this.player = new PlayerController(this, 820, 255, initialPersona);
    this.physics.add.collider(this.player.sprite, wallColliders);

    this.cameras.main.startFollow(this.player.sprite, true, 0.09, 0.09);

    // 8. Abonnement réactif Zustand : met à jour immédiatement les portes lors du switch Eliott <-> Camille <-> M. Martin
    let prevPersonaId = useGameStore.getState().currentPersonaId;
    this.unsubscribeStore = useGameStore.subscribe((state) => {
      if (state.currentPersonaId !== prevPersonaId) {
        prevPersonaId = state.currentPersonaId;
        this.player.syncPersona(state.currentPersona);
        this.refreshAllDoorsForPersona(state.currentPersona);
        this.evaluateProximity(state.currentPersona, true);
      }

      if (state.pendingZoneTransition === 'baggio:global' && !this.isTransitioning) {
        state.clearPendingZoneTransition();
        this.transitionToCourtyard();
      }
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unsubscribeStore?.();
    });
  }

  private drawCorridorArchitecture(wallColliders: Phaser.Physics.Arcade.StaticGroup): void {
    const g = this.add.graphics().setDepth(3);

    // Bande de circulation au sol claire et lisible
    g.lineStyle(2, 0x0284c7, 0.65);
    g.lineBetween(60, 310, 1300, 310);

    // Séparateur au sol entre Tronc Commun (gauche) et Laboratoires de Spécialités (droite)
    g.lineStyle(2.5, 0x0284c7, 0.8);
    g.lineBetween(705, 175, 705, 420);

    this.add
      .text(420, 330, '◄ PÔLE TRONC COMMUN [T-STI2D-3 : OUVERT À TOUS]', {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#334155',
        resolution: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(3);

    this.add
      .text(985, 330, 'PÔLE LABORATOIRES DE SPÉCIALITÉS [FILTRAGE DYNAMIQUE SIN / EE / ITEC] ►', {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#0369a1',
        resolution: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(3);

    const pillarXs = [135, 325, 515, 705, 895, 1085, 1275];
    for (const px of pillarXs) {
      this.add.image(px, 98, 'prop_pillar').setDepth(6);
    }

    const topWall = wallColliders.create(
      this.worldWidth / 2,
      115,
      undefined,
      undefined,
      false
    ) as Phaser.Physics.Arcade.Sprite;
    topWall.setSize(this.worldWidth, 95).setVisible(false).refreshBody();

    // Garde-corps vitré clair en bas du couloir
    const bottomRail = this.add.graphics().setDepth(28);
    bottomRail.fillStyle(0x94a3b8, 0.95);
    bottomRail.fillRect(0, 435, this.worldWidth, 45);
    bottomRail.lineStyle(3, 0x475569, 1);
    bottomRail.lineBetween(0, 435, this.worldWidth, 435);
  }

  private createDynamicDoor(config: ClassroomDoorConfig, persona: Persona): void {
    const access = evaluateDoorAccess(persona, config);
    const textureKey = this.resolveDoorTextureKey(config, access);

    // 1. Sprite de la porte vitrée (sans halo lumineux)
    const doorSprite = this.add.image(config.x, config.y - 44, textureKey).setDepth(5);

    // 2. Cadenas (visible uniquement si la porte est verrouillée pour le profil actif)
    const holoLockSprite = this.add
      .image(config.x, config.y - 42, 'icon_holo_lock')
      .setDepth(12)
      .setVisible(!access.unlocked);

    this.tweens.add({
      targets: holoLockSprite,
      y: config.y - 46,
      duration: 950,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // 3. Enseigne claire et nette au-dessus de la porte
    const signGraphics = this.add.graphics().setDepth(9);

    const signTitleText = this.add
      .text(config.x, 30, config.title, {
        fontFamily: '"Orbitron", sans-serif',
        fontSize: config.title.length > 18 ? '8.5px' : '10px',
        fontStyle: 'bold',
        color: '#0f172a',
        align: 'center',
        resolution: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(10);

    const signSubText = this.add
      .text(config.x, 46, '', {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '8.5px',
        fontStyle: 'bold',
        color: '#334155',
        align: 'center',
        resolution: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(10);

    // 4. Marquage d'accueil au sol devant chaque porte
    const floorZoneGraphics = this.add.graphics().setDepth(3);
    const floorPromptText = this.add
      .text(config.x, config.y + 24, '', {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#0f172a',
        resolution: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(4);

    const rendered: RenderedCorridorDoor = {
      config,
      access,
      doorSprite,
      holoLockSprite,
      signGraphics,
      signTitleText,
      signSubText,
      floorZoneGraphics,
      floorPromptText,
    };

    this.applyDoorVisualState(rendered, access);
    this.renderedDoors.push(rendered);
  }

  private resolveDoorTextureKey(config: ClassroomDoorConfig, access: DoorAccessResult): string {
    if (!access.unlocked) {
      return 'door_cyber_locked';
    }
    if (config.baseNeonColor === '#ffaa00') {
      return 'door_cyber_amber';
    }
    if (config.baseNeonColor === '#ff007f') {
      return 'door_cyber_magenta';
    }
    return 'door_cyber_cyan';
  }

  private applyDoorVisualState(door: RenderedCorridorDoor, access: DoorAccessResult): void {
    door.access = access;

    const textureKey = this.resolveDoorTextureKey(door.config, access);
    door.doorSprite.setTexture(textureKey);
    door.holoLockSprite.setVisible(!access.unlocked);

    // Couleurs plein jour haute lisibilité
    const borderColor = access.unlocked ? 0x0284c7 : 0xe11d48;
    const bgFill = access.unlocked ? 0xffffff : 0xfff1f2;

    const signW = 166;
    const signH = 40;
    const sx = door.config.x - signW / 2;
    const sy = 18;

    door.signGraphics.clear();
    door.signGraphics.fillStyle(bgFill, 0.98);
    door.signGraphics.fillRoundedRect(sx, sy, signW, signH, 5);
    door.signGraphics.lineStyle(2.5, borderColor, 1);
    door.signGraphics.strokeRoundedRect(sx, sy, signW, signH, 5);

    door.signTitleText.setColor(access.unlocked ? '#0f172a' : '#be123c');
    door.signSubText.setText(
      access.unlocked
        ? `${door.config.roomNumber} • [E] ENTRER`
        : `🔒 RÉSERVÉ SPÉ. ${door.config.requiredSpecialty}`
    );
    door.signSubText.setColor(access.unlocked ? '#0284c7' : '#e11d48');

    // Tapis d'accueil au sol devant la porte
    door.floorZoneGraphics.clear();
    door.floorZoneGraphics.fillStyle(access.unlocked ? 0xe0f2fe : 0xffe4e6, 0.9);
    door.floorZoneGraphics.fillRoundedRect(door.config.x - 42, door.config.y + 6, 84, 34, 4);
    door.floorZoneGraphics.lineStyle(2, borderColor, 0.95);
    door.floorZoneGraphics.strokeRoundedRect(door.config.x - 42, door.config.y + 6, 84, 34, 4);

    door.floorPromptText.setText(access.unlocked ? '[E] Entrer' : '🔒 Verrouillé');
    door.floorPromptText.setColor(access.unlocked ? '#0369a1' : '#be123c');
  }

  public refreshAllDoorsForPersona(persona: Persona): void {
    for (const door of this.renderedDoors) {
      const newAccess = evaluateDoorAccess(persona, door.config);
      this.applyDoorVisualState(door, newAccess);
    }
  }

  public getDoorsSnapshot(): Array<{
    id: string;
    title: string;
    unlocked: boolean;
    textureKey: string;
    holoLockVisible: boolean;
    neonColor: string;
  }> {
    return this.renderedDoors.map((d) => ({
      id: d.config.id,
      title: d.config.title,
      unlocked: d.access.unlocked,
      textureKey: d.doorSprite.texture.key,
      holoLockVisible: d.holoLockSprite.visible,
      neonColor: d.access.neonColor,
    }));
  }

  private buildExitToCourtyard(_wallColliders: Phaser.Physics.Arcade.StaticGroup): void {
    const exitX = 78;
    const exitY = 250;

    const g = this.add.graphics().setDepth(3);
    g.fillStyle(0xe0f2fe, 0.95);
    g.fillRoundedRect(exitX - 36, exitY - 40, 72, 80, 6);
    g.lineStyle(2.5, 0x0284c7, 1);
    g.strokeRoundedRect(exitX - 36, exitY - 40, 72, 80, 6);

    this.add
      .text(exitX, exitY - 12, '◄ SORTIE', {
        fontFamily: '"Orbitron", sans-serif',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#0369a1',
        resolution: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(5);

    this.add
      .text(exitX, exitY + 8, 'COUR BAGGIO\n[E]', {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#0f172a',
        align: 'center',
        resolution: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(5);

    this.exitHotspot = {
      x: exitX,
      y: exitY,
      radius: 62,
      payload: {
        id: 'exit_to_courtyard',
        type: 'PORTAL',
        title: 'Escalier Principal — Retour vers la Cour Baggio',
        subtitle: 'Redescendre dans la Cour du Lycée (baggio:global)',
        isLocked: false,
        actionLabel: '[E] Retourner dans la Cour de Baggio',
        accentColor: '#0284c7',
        targetZone: 'baggio:global',
      },
    };
  }

  private buildCorridorProps(wallColliders: Phaser.Physics.Arcade.StaticGroup): void {
    const rackPositions = [705, 895, 1085];
    for (const rx of rackPositions) {
      const rack = wallColliders.create(
        rx,
        148,
        'prop_server_rack'
      ) as Phaser.Physics.Arcade.Sprite;
      rack.setDepth(7).refreshBody();
    }

    const benchXs = [320, 610, 990];
    for (const bx of benchXs) {
      const bench = wallColliders.create(
        bx,
        395,
        'prop_cyber_bench'
      ) as Phaser.Physics.Arcade.Sprite;
      bench.setDepth(16).refreshBody();
    }
  }

  private buildDoorPayload(door: RenderedCorridorDoor): InteractablePayload {
    return {
      id: door.config.id,
      type: 'DOOR',
      title: `${door.config.title} (${door.config.roomNumber})`,
      subtitle: `${door.config.schedule} • ${door.config.teacherName}`,
      isLocked: !door.access.unlocked,
      lockReason: door.access.reason,
      actionLabel: door.access.promptText,
      accentColor: door.access.neonColor,
      doorConfig: door.config,
    };
  }

  private evaluateProximity(persona: Persona, forceUpdate = false): InteractablePayload | null {
    const px = this.player.sprite.x;
    const py = this.player.sprite.y;

    let closestPayload: InteractablePayload | null = null;
    let minDistance = Infinity;

    for (const door of this.renderedDoors) {
      const dist = Phaser.Math.Distance.Between(px, py, door.config.x, door.config.y + 18);
      if (dist <= 76 && dist < minDistance) {
        minDistance = dist;
        closestPayload = this.buildDoorPayload(door);
      }
    }

    const exitDist = Phaser.Math.Distance.Between(px, py, this.exitHotspot.x, this.exitHotspot.y);
    if (exitDist <= this.exitHotspot.radius && exitDist < minDistance) {
      closestPayload = this.exitHotspot.payload;
    }

    const state = useGameStore.getState();
    const currentId = state.nearbyInteractable?.id ?? null;
    const nextId = closestPayload?.id ?? null;

    if (forceUpdate || currentId !== nextId) {
      state.setNearbyInteractable(closestPayload);
    }

    void persona;
    return closestPayload;
  }

  private transitionToCourtyard(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.cameras.main.fadeOut(220, 241, 245, 249);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('CourtyardScene');
    });
  }

  public update(): void {
    if (this.isTransitioning) return;

    const state = useGameStore.getState();
    this.player.update(state.currentPersona);

    const closestPayload = this.evaluateProximity(state.currentPersona, false);

    if (this.player.isInteractJustPressed() && closestPayload) {
      if (
        closestPayload.type === 'PORTAL' &&
        state.activeSidePanel?.id === closestPayload.id &&
        closestPayload.targetZone
      ) {
        state.requestZoneTransition(closestPayload.targetZone);
        return;
      }

      if (closestPayload.type === 'DOOR' && closestPayload.isLocked && closestPayload.lockReason) {
        state.triggerNotification('Accès Refusé', closestPayload.lockReason, '#e11d48');
      }

      state.openSidePanel(closestPayload);
    }
  }
}
