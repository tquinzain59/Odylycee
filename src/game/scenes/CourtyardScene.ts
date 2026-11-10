import Phaser from 'phaser';
import { FOYER_VENDING_ITEMS } from '../../data/mockBaggioData';
import { useGameStore } from '../../state/useGameStore';
import { InteractablePayload } from '../../types/game';
import { ProceduralPixelAssets } from '../assets/ProceduralPixelAssets';
import { NpcActor } from '../entities/NpcActor';
import { PlayerController } from '../entities/PlayerController';

interface CourtyardHotspot {
  x: number;
  y: number;
  radius: number;
  payload: InteractablePayload;
  indicatorRing: Phaser.GameObjects.Graphics;
}

export class CourtyardScene extends Phaser.Scene {
  private player!: PlayerController;
  private npcs: NpcActor[] = [];
  private hotspots: CourtyardHotspot[] = [];
  private unsubscribeStore?: () => void;
  private isTransitioning = false;

  private readonly worldWidth = 1280;
  private readonly worldHeight = 820;

  constructor() {
    super({ key: 'CourtyardScene' });
  }

  public create(): void {
    this.isTransitioning = false;
    this.npcs = [];
    this.hotspots = [];

    ProceduralPixelAssets.generateAll(this);
    useGameStore.getState().setCurrentZone('baggio:global');

    // Monde & Caméra en plein jour (sans aucun halo ni Bloom assombrissant)
    this.physics.world.setBounds(32, 128, this.worldWidth - 64, this.worldHeight - 160);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBackgroundColor('#dfd9ce');
    this.cameras.main.setZoom(1.28);
    this.cameras.main.fadeIn(250, 241, 245, 249);

    const wallColliders = this.physics.add.staticGroup();

    // 1. Sol pavé clair ensoleillé de la Cour Baggio
    this.add
      .tileSprite(0, 0, this.worldWidth, this.worldHeight, 'tile_courtyard_floor')
      .setOrigin(0, 0)
      .setDepth(0);

    // 2. Allée centrale & espaces verts de la cour
    this.drawCourtyardDaylightMarkings();

    // 3. Façade Nord monumentale du Lycée César Baggio (Briques lilloises & pierre blanche)
    this.buildBaggioNorthFacade(wallColliders);

    // 4. Zone Ouest : Terrasse Foyer des Lycéens & Distributeurs
    this.buildFoyerTechCorner(wallColliders);

    // 5. Zone Est : Terrain de Basket extérieur 3x3 en plein jour
    this.buildDaylightBasketballCourt(wallColliders);

    // 6. Borne d'Orientation du Campus
    this.buildCampusDirectoryTerminal(wallColliders);

    // 7. PNJ Élèves animés dans la Cour
    this.spawnCourtyardNpcs(wallColliders);

    // 8. Joueur principal (net, sans halo)
    const initialPersona = useGameStore.getState().currentPersona;
    this.player = new PlayerController(this, 640, 285, initialPersona);
    this.physics.add.collider(this.player.sprite, wallColliders);
    for (const npc of this.npcs) {
      this.physics.add.collider(this.player.sprite, npc.sprite);
    }

    this.cameras.main.startFollow(this.player.sprite, true, 0.09, 0.09);

    // 9. Abonnement réactif au store Zustand
    let prevPersonaId = useGameStore.getState().currentPersonaId;
    this.unsubscribeStore = useGameStore.subscribe((state) => {
      if (state.currentPersonaId !== prevPersonaId) {
        prevPersonaId = state.currentPersonaId;
        this.player.syncPersona(state.currentPersona);
      }

      if (state.pendingZoneTransition === 'baggio:tsti2d3' && !this.isTransitioning) {
        state.clearPendingZoneTransition();
        this.transitionToCorridor();
      }
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unsubscribeStore?.();
    });
  }

  private drawCourtyardDaylightMarkings(): void {
    const g = this.add.graphics().setDepth(2);

    // Allée piétonne claire menant à l'entrée du bâtiment des Terminales
    g.fillStyle(0xece8e0, 0.9);
    g.fillRect(560, 145, 160, 520);
    g.lineStyle(2, 0x0284c7, 0.55);
    g.strokeRect(560, 145, 160, 520);

    // Bandes de guidage piéton
    g.lineStyle(1, 0x94a3b8, 0.6);
    for (let y = 175; y < 650; y += 45) {
      g.lineBetween(575, y, 705, y);
    }

    // Médaillon central de la cour Baggio
    g.fillStyle(0xe0f2fe, 0.9);
    g.fillCircle(640, 420, 66);
    g.lineStyle(3, 0x0284c7, 0.85);
    g.strokeCircle(640, 420, 66);
    g.lineStyle(1.5, 0x38bdf8, 0.85);
    g.strokeCircle(640, 420, 52);

    // Parterres végétalisés (pelouses du lycée)
    g.fillStyle(0x86efac, 0.85);
    g.fillRoundedRect(380, 185, 140, 75, 10);
    g.lineStyle(2, 0x16a34a, 0.8);
    g.strokeRoundedRect(380, 185, 140, 75, 10);

    this.add
      .text(640, 420, 'COUR CÉSAR BAGGIO', {
        fontFamily: '"Orbitron", sans-serif',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#0369a1',
        resolution: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(3);
  }

  private buildBaggioNorthFacade(wallColliders: Phaser.Physics.Arcade.StaticGroup): void {
    for (let x = 0; x < this.worldWidth; x += 64) {
      this.add.image(x + 32, 64, 'tile_facade_baggio').setDepth(5);
    }

    const pillarPositions = [120, 320, 510, 770, 960, 1160];
    for (const px of pillarPositions) {
      this.add.image(px, 72, 'prop_pillar').setDepth(7);
    }

    // Fronton officiel du Lycée César Baggio
    const signBg = this.add.graphics().setDepth(10);
    signBg.fillStyle(0xffffff, 0.96);
    signBg.fillRoundedRect(430, 14, 420, 52, 6);
    signBg.lineStyle(2.5, 0x0284c7, 1);
    signBg.strokeRoundedRect(430, 14, 420, 52, 6);

    this.add
      .text(640, 31, 'LYCÉE CÉSAR BAGGIO', {
        fontFamily: '"Orbitron", sans-serif',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#0f172a',
        resolution: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(11);

    this.add
      .text(640, 51, 'AILE SCIENCES & TECHNOLOGIES • TERMINALE STI2D-3', {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#0284c7',
        resolution: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(11);

    // Portail d'entrée vers le bâtiment des Terminales
    this.add.image(640, 114, 'portal_baggio_main').setDepth(8);

    this.add
      .text(640, 82, '▲ ENTRÉE BÂTIMENT TERMINALES [T-STI2D-3] ▲', {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#0284c7',
        padding: { x: 8, y: 3 },
        resolution: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(12);

    this.registerHotspot(640, 178, 72, {
      id: 'portal_to_corridor',
      type: 'PORTAL',
      title: 'Portail Aile Terminales — T-STI2D-3',
      subtitle: 'Accès à l’étage des laboratoires STI2D & salles de tronc commun',
      isLocked: false,
      actionLabel: '[E] Monter au Couloir T-STI2D-3',
      accentColor: '#0284c7',
      targetZone: 'baggio:tsti2d3',
    });

    const northWallBody = wallColliders.create(
      640,
      95,
      undefined,
      undefined,
      false
    ) as Phaser.Physics.Arcade.Sprite;
    northWallBody.setSize(this.worldWidth, 90).setVisible(false).refreshBody();
  }

  private buildFoyerTechCorner(wallColliders: Phaser.Physics.Arcade.StaticGroup): void {
    const baseX = 210;

    // Terrasse claire du Foyer des Lycéens
    const foyerFloor = this.add.graphics().setDepth(2);
    foyerFloor.fillStyle(0xf1f5f9, 0.94);
    foyerFloor.fillRoundedRect(100, 185, 250, 210, 10);
    foyerFloor.lineStyle(2.5, 0x0284c7, 0.85);
    foyerFloor.strokeRoundedRect(100, 185, 250, 210, 10);

    this.add
      .text(225, 204, '☕ FOYER TECH // DISTRIBUTEURS', {
        fontFamily: '"Orbitron", sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#0f172a',
        resolution: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(12);

    const vend1 = wallColliders.create(
      175,
      255,
      'prop_vending_cyan'
    ) as Phaser.Physics.Arcade.Sprite;
    vend1.setDepth(14).refreshBody();

    const vend2 = wallColliders.create(
      245,
      255,
      'prop_vending_magenta'
    ) as Phaser.Physics.Arcade.Sprite;
    vend2.setDepth(14).refreshBody();

    const bench1 = wallColliders.create(
      160,
      355,
      'prop_cyber_bench'
    ) as Phaser.Physics.Arcade.Sprite;
    bench1.setDepth(14).refreshBody();

    const bench2 = wallColliders.create(
      280,
      355,
      'prop_cyber_bench'
    ) as Phaser.Physics.Arcade.Sprite;
    bench2.setDepth(14).refreshBody();

    this.registerHotspot(baseX, 300, 68, {
      id: 'foyer_vending',
      type: 'VENDING',
      title: 'Distributeurs du Foyer des Lycéens',
      subtitle: 'Boissons fraîches & collations lilloises pour la pause',
      isLocked: false,
      actionLabel: '[E] Utiliser le Distributeur',
      accentColor: '#0284c7',
      vendingItems: FOYER_VENDING_ITEMS,
    });
  }

  private buildDaylightBasketballCourt(wallColliders: Phaser.Physics.Arcade.StaticGroup): void {
    const courtX = 850;
    const courtY = 215;
    const courtW = 320;
    const courtH = 380;

    const g = this.add.graphics().setDepth(3);

    // Revêtement sportif bleu clair extérieur en plein jour
    g.fillStyle(0x3b82f6, 0.92);
    g.fillRoundedRect(courtX, courtY, courtW, courtH, 8);

    // Raquette (Key) orange vif sportif
    g.fillStyle(0xf97316, 0.88);
    g.fillRect(courtX + 100, courtY, 120, 135);

    // Lignes blanches réglementaires très nettes
    g.lineStyle(3, 0xffffff, 0.98);
    g.strokeRoundedRect(courtX, courtY, courtW, courtH, 8);
    g.strokeRect(courtX + 100, courtY, 120, 135);
    g.strokeCircle(courtX + 160, courtY + 135, 42);

    // Ligne à 3 points blanche
    g.lineStyle(2.5, 0xffffff, 0.98);
    g.beginPath();
    g.arc(courtX + 160, courtY + 45, 130, 0.15, Math.PI - 0.15, false);
    g.strokePath();

    // Ligne médiane & cercle central
    g.lineBetween(courtX, courtY + courtH - 60, courtX + courtW, courtY + courtH - 60);
    g.strokeCircle(courtX + 160, courtY + courtH - 60, 44);

    this.add
      .text(courtX + 160, courtY + 255, 'TERRAIN BASKET BAGGIO // 3x3', {
        fontFamily: '"Orbitron", sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#ffffff',
        resolution: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(4);

    const hoop = wallColliders.create(
      courtX + 160,
      courtY + 14,
      'prop_basket_hoop'
    ) as Phaser.Physics.Arcade.Sprite;
    hoop.setDepth(15).refreshBody();
  }

  private buildCampusDirectoryTerminal(wallColliders: Phaser.Physics.Arcade.StaticGroup): void {
    const termX = 490;
    const termY = 390;

    const term = wallColliders.create(
      termX,
      termY,
      'prop_holo_terminal'
    ) as Phaser.Physics.Arcade.Sprite;
    term.setDepth(15).refreshBody();

    this.registerHotspot(termX, termY + 16, 56, {
      id: 'campus_terminal',
      type: 'TERMINAL',
      title: 'Borne Interactive — Plan du Lycée César Baggio',
      subtitle: 'Orientation vers l’étage Terminale STI2D-3 & salles de cours',
      isLocked: false,
      actionLabel: '[E] Consulter le Plan',
      accentColor: '#0284c7',
      targetZone: 'baggio:tsti2d3',
    });
  }

  private spawnCourtyardNpcs(_wallColliders: Phaser.Physics.Arcade.StaticGroup): void {
    const npcConfigs = [
      {
        id: 'npc_lucas',
        name: 'Lucas',
        roleLabel: 'T-STI2D-3 (SIN)',
        avatarKey: 'avatar_npc_1',
        x: 370,
        y: 330,
        patrolDistanceX: 48,
        patrolDistanceY: 0,
        accentColor: '#059669',
        accentHex: 0x059669,
        ambientBubble: 'Le TP ESP32 en Labo SIN est ouvert !',
        dialogueLines: [
          'Salut ! Tu cherches les salles de la Terminale STI2D-3 ?',
          'Prends le grand Portail au nord de la cour pour monter au couloir de notre étage.',
          'Si tu es en spécialité SIN comme Eliott, le Labo SIN (B-206) est ouvert pour notre groupe !',
        ],
      },
      {
        id: 'npc_ines',
        name: 'Inès',
        roleLabel: 'T-STI2D-3 (ITEC)',
        avatarKey: 'avatar_npc_2',
        x: 960,
        y: 380,
        patrolDistanceX: 55,
        patrolDistanceY: 35,
        accentColor: '#4f46e5',
        accentHex: 0x4f46e5,
        ambientBubble: 'Petit match 3x3 avant le cours d’I2D !',
        dialogueLines: [
          'Rien de tel qu’un match au soleil dans la cour de Baggio pendant la récré !',
          'M. Martin nous attend tout à l’heure en salle d’Ingénierie & Développement Durable (I2D).',
          'Comme I2D fait partie du tronc commun, toute la T-STI2D-3 peut y entrer librement.',
        ],
      },
      {
        id: 'npc_yanis',
        name: 'Yanis',
        roleLabel: 'T-STI2D-3 (EE)',
        avatarKey: 'avatar_npc_3',
        x: 745,
        y: 265,
        patrolDistanceX: 0,
        patrolDistanceY: 36,
        accentColor: '#ea580c',
        accentHex: 0xea580c,
        ambientBubble: 'Hâte de tester le banc solaire au Labo EE ☀️',
        dialogueLines: [
          'Avec ce grand soleil, le banc photovoltaïque du Labo EE va produire au maximum !',
          'En profil Camille (EE), le Labo EE est déverrouillé, tandis que le Labo SIN est réservé aux SIN.',
          'Clique sur le bouton Persona en haut à droite pour tester le changement de profil !',
        ],
      },
    ];

    for (const cfg of npcConfigs) {
      const npc = new NpcActor(this, cfg);
      this.npcs.push(npc);
    }
  }

  private registerHotspot(
    x: number,
    y: number,
    radius: number,
    payload: InteractablePayload
  ): void {
    const ring = this.add.graphics().setDepth(3);
    const colorNum = parseInt(payload.accentColor.replace('#', ''), 16);
    ring.lineStyle(2, colorNum, 0.75);
    ring.strokeCircle(x, y, 20);
    ring.fillStyle(0xffffff, 0.35);
    ring.fillCircle(x, y, 20);

    this.hotspots.push({ x, y, radius, payload, indicatorRing: ring });
  }

  private transitionToCorridor(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.cameras.main.fadeOut(220, 241, 245, 249);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('CorridorScene');
    });
  }

  public update(time: number): void {
    if (this.isTransitioning) return;

    const state = useGameStore.getState();
    this.player.update(state.currentPersona);

    for (const npc of this.npcs) {
      npc.update(time);
    }

    const px = this.player.sprite.x;
    const py = this.player.sprite.y;

    let closestPayload: InteractablePayload | null = null;
    let minDistance = Infinity;

    for (const hs of this.hotspots) {
      const dist = Phaser.Math.Distance.Between(px, py, hs.x, hs.y);
      const scale = 1 + Math.sin(time * 0.005) * 0.06;
      hs.indicatorRing.setScale(scale);
      if (dist <= hs.radius && dist < minDistance) {
        minDistance = dist;
        closestPayload = hs.payload;
      }
    }

    for (const npc of this.npcs) {
      const dist = Phaser.Math.Distance.Between(px, py, npc.sprite.x, npc.sprite.y);
      if (dist <= 64 && dist < minDistance) {
        minDistance = dist;
        closestPayload = npc.toInteractablePayload();
      }
    }

    const currentNearbyId = state.nearbyInteractable?.id ?? null;
    const nextNearbyId = closestPayload?.id ?? null;
    if (currentNearbyId !== nextNearbyId) {
      state.setNearbyInteractable(closestPayload);
    }

    if (this.player.isInteractJustPressed() && closestPayload) {
      if (
        closestPayload.type === 'PORTAL' &&
        state.activeSidePanel?.id === closestPayload.id &&
        closestPayload.targetZone
      ) {
        state.requestZoneTransition(closestPayload.targetZone);
        return;
      }
      state.openSidePanel(closestPayload);
    }
  }
}
