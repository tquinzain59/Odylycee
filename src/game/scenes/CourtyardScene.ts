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
}

export class CourtyardScene extends Phaser.Scene {
  private player!: PlayerController;
  private npcs: NpcActor[] = [];
  private hotspots: CourtyardHotspot[] = [];
  private unsubscribeStore?: () => void;
  private isTransitioning = false;

  // Dimensions calées pour occuper 100% de la page (Cour + Rue à droite + Rue d'entrée en bas)
  private readonly worldWidth = 1440;
  private readonly worldHeight = 860;
  private readonly schoolName = 'LYCÉE CÉSAR BAGGIO';

  constructor() {
    super({ key: 'CourtyardScene' });
  }

  public create(): void {
    this.isTransitioning = false;
    this.npcs = [];
    this.hotspots = [];

    ProceduralPixelAssets.generateAll(this);
    useGameStore.getState().setCurrentZone('baggio:global');

    // Les limites physiques gardent le joueur à l'intérieur de l'enceinte sécurisée de la cour
    this.physics.world.setBounds(48, 132, 1070, 505);

    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBackgroundColor('#dfd9ce');
    this.updateCameraFit();
    this.scale.on('resize', this.updateCameraFit, this);
    this.cameras.main.fadeIn(220, 241, 245, 249);

    const wallColliders = this.physics.add.staticGroup();

    // 1. Sol pavé de la cour (x: 0..1140, y: 0..670)
    this.add
      .tileSprite(0, 0, 1152, 672, 'tile_courtyard_floor')
      .setOrigin(0, 0)
      .setDepth(0);

    // 2. Rue sur la droite avec trottoir, véhicules garés, arbustes et lampadaires (x: 1152..1440)
    this.buildRightSideStreet();

    // 3. Rue en bas débouchant sur l'entrée du lycée + Grand Portail Sécurisé (y: 672..860)
    this.buildSouthEntranceStreetAndGate(wallColliders);

    // 4. Grilles entourant la cour (Gauche, Droite, Sud)
    this.buildCourtyardPerimeterFences(wallColliders);

    // 5. Allée centrale piétonne menant du Portail Sécurisé au Bâtiment Nord (sans cercles mobiles)
    this.drawCourtyardWalkways();

    // 6. Façade Nord du Lycée + Panneau Officiel générique d'établissement
    this.buildBaggioNorthFacade(wallColliders);

    // 7. Zone Ouest : Foyer des Lycéens & Distributeurs
    this.buildFoyerTechCorner(wallColliders);

    // 8. Zone Est : Terrain de Basket 3x3 + Ballon de basket qui rebondit
    this.buildBasketballCourtWithBouncingBall(wallColliders);

    // 9. Arbres, Arbustes & Lampadaires dans la cour pour meubler l'espace
    this.buildCourtyardTreesAndLamps(wallColliders);

    // 10. Borne d'Orientation du Campus
    this.buildCampusDirectoryTerminal(wallColliders);

    // 11. Lycéens immobiles + Adulte Référent en bas de l'écran (Tuto de démarrage)
    this.spawnCourtyardNpcsAndAdultTutor(wallColliders);

    // 12. Joueur principal (positionné près de l'entrée sud et de l'adulte tuto)
    const initialPersona = useGameStore.getState().currentPersona;
    this.player = new PlayerController(this, 570, 470, initialPersona);
    this.physics.add.collider(this.player.sprite, wallColliders);
    for (const npc of this.npcs) {
      this.physics.add.collider(this.player.sprite, npc.sprite);
    }

    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

    // 13. Abonnement réactif au store Zustand
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
      this.scale.off('resize', this.updateCameraFit, this);
      this.unsubscribeStore?.();
    });
  }

  private updateCameraFit(): void {
    if (!this.cameras?.main) return;
    const zoomX = this.scale.width / this.worldWidth;
    const zoomY = this.scale.height / this.worldHeight;
    const zoom = Math.max(zoomX, zoomY, 1);
    this.cameras.main.setZoom(zoom);
  }

  /**
   * Rue sur la droite (x: 1152..1440) avec trottoir, places de stationnement, véhicules garés, lampadaires et arbustes
   */
  private buildRightSideStreet(): void {
    // Trottoir longeant la grille droite de la cour
    this.add.tileSprite(1152, 0, 56, this.worldHeight, 'tile_sidewalk').setOrigin(0, 0).setDepth(0);

    // Chaussée en asphalte à droite
    this.add
      .tileSprite(1208, 0, this.worldWidth - 1208, this.worldHeight, 'tile_street_asphalt')
      .setOrigin(0, 0)
      .setDepth(0);

    const g = this.add.graphics().setDepth(1);

    // Bordure de trottoir
    g.lineStyle(3, 0x94a3b8, 1);
    g.lineBetween(1208, 0, 1208, 672);

    // Marquage au sol des places de parking le long de la rue de droite
    g.lineStyle(2, 0xffffff, 0.85);
    const parkingY = [80, 185, 290, 395, 500, 605];
    for (const py of parkingY) {
      g.strokeRect(1214, py, 52, 90);
    }

    // Ligne médiane discontinue de la rue de droite
    g.lineStyle(3, 0xfef08a, 0.9);
    for (let y = 20; y < this.worldHeight; y += 48) {
      g.lineBetween(1335, y, 1335, y + 26);
    }

    // Véhicules garés sur la rue de droite
    this.add.image(1240, 125, 'prop_car_v_blue').setDepth(10);
    this.add.image(1240, 230, 'prop_car_v_white').setDepth(10);
    this.add.image(1240, 440, 'prop_car_v_red').setDepth(10);
    this.add.image(1240, 545, 'prop_car_v_slate').setDepth(10);

    // Lampadaires et arbustes sur le trottoir de droite
    const rightLampYs = [110, 280, 450, 610];
    for (const ly of rightLampYs) {
      this.add.image(1180, ly, 'prop_streetlamp').setDepth(14);
    }

    const rightShrubYs = [195, 365, 530];
    for (const sy of rightShrubYs) {
      this.add.image(1180, sy, 'prop_shrub').setDepth(12);
    }
  }

  /**
   * Rue du Sud débouchant sur l'entrée du lycée + Grand Portail Sécurisé + Loge + Panneau Officiel
   */
  private buildSouthEntranceStreetAndGate(wallColliders: Phaser.Physics.Arcade.StaticGroup): void {
    // Trottoir sud devant les grilles du lycée (y: 672..724)
    this.add.tileSprite(0, 672, 1208, 52, 'tile_sidewalk').setOrigin(0, 0).setDepth(0);

    // Chaussée sud (y: 724..860) + allée débouchant face au portail
    this.add
      .tileSprite(0, 724, this.worldWidth, this.worldHeight - 724, 'tile_street_asphalt')
      .setOrigin(0, 0)
      .setDepth(0);

    const g = this.add.graphics().setDepth(1);

    // Bordure de trottoir sud
    g.lineStyle(3, 0x94a3b8, 1);
    g.lineBetween(0, 724, 1208, 724);

    // Passage piéton (zébra blanc) débouchant directement devant le Grand Portail Sécurisé (x: 500..640)
    g.fillStyle(0xffffff, 0.92);
    for (let x = 495; x <= 635; x += 22) {
      g.fillRect(x, 730, 12, 46);
    }

    // Lignes de circulation et places de stationnement rue sud
    g.lineStyle(2, 0xffffff, 0.85);
    g.strokeRect(80, 732, 92, 48);
    g.strokeRect(190, 732, 92, 48);
    g.strokeRect(820, 732, 92, 48);
    g.strokeRect(930, 732, 92, 48);

    // Ligne médiane discontinue rue sud
    g.lineStyle(3, 0xfef08a, 0.9);
    for (let x = 20; x < 1300; x += 52) {
      if (x < 470 || x > 660) {
        g.lineBetween(x, 805, x + 28, 805);
      }
    }

    // Véhicules garés dans la rue du bas
    this.add.image(126, 754, 'prop_car_h_emerald').setDepth(18);
    this.add.image(236, 754, 'prop_car_h_blue').setDepth(18);
    this.add.image(866, 754, 'prop_car_h_amber').setDepth(18);

    // Grand Portail Sécurisé d'entrée du lycée (x: 570, y: 654)
    const gate = wallColliders.create(
      570,
      654,
      'prop_security_gate'
    ) as Phaser.Physics.Arcade.Sprite;
    gate.setDepth(19).refreshBody();

    // Loge de sécurité à gauche du portail
    const booth = wallColliders.create(
      415,
      646,
      'prop_guard_booth'
    ) as Phaser.Physics.Arcade.Sprite;
    booth.setDepth(19).refreshBody();

    // Panneau standardisé du nom de l'établissement à l'entrée (identique pour chaque collège/lycée avec son propre nom)
    this.drawStandardSchoolSignboard(755, 650, this.schoolName, 'ACCÈS SÉCURISÉ • ÉLÈVES & PERSONNELS');

    // Badge explicite sur le portail
    this.add
      .text(570, 626, '🔒 PORTAIL SÉCURISÉ • ACCÈS RÉSERVÉ AUX MEMBRES DU LYCÉE', {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '9.5px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#be123c',
        padding: { x: 8, y: 3 },
        resolution: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(22);

    // Interaction avec le portail sécurisé
    this.registerHotspot(570, 605, 68, {
      id: 'secured_main_gate',
      type: 'TERMINAL',
      title: `Portail Sécurisé — ${this.schoolName}`,
      subtitle: 'Contrôle d’accès par badge numérique ENT / OdyLycée',
      isLocked: true,
      lockReason:
        'Application fermée au public extérieur : seuls les élèves et enseignants authentifiés de l’établissement peuvent franchir ce portail.',
      actionLabel: '[E] Vérifier le Contrôle d’Accès',
      accentColor: '#e11d48',
    });

    // Lampadaires et arbustes le long du trottoir sud (sans masquer le panneau officiel)
    const southLampXs = [70, 330, 470, 915, 1085];
    for (const lx of southLampXs) {
      this.add.image(lx, 682, 'prop_streetlamp').setDepth(20);
    }

    const southShrubXs = [150, 270, 880, 990];
    for (const sx of southShrubXs) {
      this.add.image(sx, 698, 'prop_shrub').setDepth(19);
    }
  }

  /**
   * Panneau officiel générique où s'inscrit le nom du collège ou lycée actif
   */
  private drawStandardSchoolSignboard(
    x: number,
    y: number,
    establishmentName: string,
    subLabel: string
  ): void {
    const g = this.add.graphics().setDepth(20);
    const w = 228;
    const h = 42;

    // Poteaux métalliques
    g.fillStyle(0x334155, 1);
    g.fillRect(x - w / 2 + 16, y + 10, 5, 28);
    g.fillRect(x + w / 2 - 21, y + 10, 5, 28);

    // Panneau officiel blanc & bleu républicain / académique
    g.fillStyle(0xffffff, 0.98);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 5);
    g.lineStyle(2.5, 0x0284c7, 1);
    g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 5);

    // Liseré tricolore discret en haut du panneau
    g.fillStyle(0x1d4ed8, 1);
    g.fillRect(x - w / 2 + 4, y - h / 2 + 3, (w - 8) / 3, 3);
    g.fillStyle(0xffffff, 1);
    g.fillRect(x - w / 2 + 4 + (w - 8) / 3, y - h / 2 + 3, (w - 8) / 3, 3);
    g.fillStyle(0xef4444, 1);
    g.fillRect(x - w / 2 + 4 + ((w - 8) * 2) / 3, y - h / 2 + 3, (w - 8) / 3, 3);

    this.add
      .text(x, y - 4, establishmentName, {
        fontFamily: '"Orbitron", sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#0f172a',
        resolution: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(21);

    this.add
      .text(x, y + 11, subLabel, {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '8.5px',
        fontStyle: 'bold',
        color: '#0284c7',
        resolution: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(21);
  }

  /**
   * Grilles entourant la cour (Sud, Est, Ouest)
   */
  private buildCourtyardPerimeterFences(wallColliders: Phaser.Physics.Arcade.StaticGroup): void {
    // Grille Sud (de gauche jusqu'au portail, puis du portail jusqu'à la rue de droite)
    for (let x = 32; x < 1140; x += 64) {
      if (x >= 380 && x <= 700) continue; // Espace réservé à la loge et au Grand Portail Sécurisé
      this.add.image(x, 660, 'prop_fence_h').setDepth(18);
    }

    // Grille Droite (sépare la cour de la rue de droite)
    for (let y = 140; y <= 650; y += 64) {
      this.add.image(1142, y, 'prop_fence_v').setDepth(15);
    }

    // Grille Gauche (ferme l'enceinte à l'ouest)
    for (let y = 140; y <= 650; y += 64) {
      this.add.image(14, y, 'prop_fence_v').setDepth(15);
    }

    // Colliders invisibles pour les grilles Sud, Est, Ouest
    const southBarrier = wallColliders.create(
      570,
      660,
      undefined,
      undefined,
      false
    ) as Phaser.Physics.Arcade.Sprite;
    southBarrier.setSize(1140, 32).setVisible(false).refreshBody();

    const eastBarrier = wallColliders.create(
      1142,
      400,
      undefined,
      undefined,
      false
    ) as Phaser.Physics.Arcade.Sprite;
    eastBarrier.setSize(24, 560).setVisible(false).refreshBody();

    const westBarrier = wallColliders.create(
      14,
      400,
      undefined,
      undefined,
      false
    ) as Phaser.Physics.Arcade.Sprite;
    westBarrier.setSize(24, 560).setVisible(false).refreshBody();
  }

  /**
   * Allée piétonne centrale sobre (sans cercles qui bougent)
   */
  private drawCourtyardWalkways(): void {
    const g = this.add.graphics().setDepth(1);

    // Allée centrale reliant le Grand Portail Sécurisé Sud à l'entrée du Bâtiment Nord
    g.fillStyle(0xece8e0, 0.92);
    g.fillRect(495, 140, 150, 495);
    g.lineStyle(2, 0x0284c7, 0.45);
    g.strokeRect(495, 140, 150, 495);

    g.lineStyle(1, 0x94a3b8, 0.5);
    for (let y = 175; y < 620; y += 45) {
      g.lineBetween(510, y, 630, y);
    }
  }

  /**
   * Façade Nord du Lycée avec le panneau officiel du nom de l'établissement
   */
  private buildBaggioNorthFacade(wallColliders: Phaser.Physics.Arcade.StaticGroup): void {
    for (let x = 0; x < 1152; x += 64) {
      this.add.image(x + 32, 64, 'tile_facade_baggio').setDepth(5);
    }

    const pillarPositions = [110, 290, 450, 690, 860, 1040];
    for (const px of pillarPositions) {
      this.add.image(px, 72, 'prop_pillar').setDepth(7);
    }

    // Panneau officiel sur le fronton du bâtiment principal (porte le nom du collège/lycée)
    const signBg = this.add.graphics().setDepth(10);
    signBg.fillStyle(0xffffff, 0.98);
    signBg.fillRoundedRect(380, 12, 380, 50, 6);
    signBg.lineStyle(2.5, 0x0284c7, 1);
    signBg.strokeRoundedRect(380, 12, 380, 50, 6);

    this.add
      .text(570, 29, this.schoolName, {
        fontFamily: '"Orbitron", sans-serif',
        fontSize: '19px',
        fontStyle: 'bold',
        color: '#0f172a',
        resolution: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(11);

    this.add
      .text(570, 48, 'BÂTIMENT DES COURS • TERMINALE STI2D-3', {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '9.5px',
        fontStyle: 'bold',
        color: '#0284c7',
        resolution: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(11);

    // Portail d'entrée vers le bâtiment des Terminales
    this.add.image(570, 114, 'portal_baggio_main').setDepth(8);

    this.add
      .text(570, 82, '▲ ENTRÉE BÂTIMENT TERMINALES [T-STI2D-3] ▲', {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '9.5px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#0284c7',
        padding: { x: 8, y: 3 },
        resolution: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(12);

    this.registerHotspot(570, 174, 72, {
      id: 'portal_to_corridor',
      type: 'PORTAL',
      title: 'Entrée Bâtiment — Couloir T-STI2D-3',
      subtitle: 'Monter à l’étage des laboratoires STI2D & salles de tronc commun',
      isLocked: false,
      actionLabel: '[E] Monter au Couloir T-STI2D-3',
      accentColor: '#0284c7',
      targetZone: 'baggio:tsti2d3',
    });

    const northWallBody = wallColliders.create(
      576,
      95,
      undefined,
      undefined,
      false
    ) as Phaser.Physics.Arcade.Sprite;
    northWallBody.setSize(1152, 90).setVisible(false).refreshBody();
  }

  private buildFoyerTechCorner(wallColliders: Phaser.Physics.Arcade.StaticGroup): void {
    const foyerFloor = this.add.graphics().setDepth(2);
    foyerFloor.fillStyle(0xf1f5f9, 0.94);
    foyerFloor.fillRoundedRect(75, 215, 240, 200, 10);
    foyerFloor.lineStyle(2.5, 0x0284c7, 0.85);
    foyerFloor.strokeRoundedRect(75, 215, 240, 200, 10);

    this.add
      .text(195, 234, '☕ FOYER // DISTRIBUTEURS', {
        fontFamily: '"Orbitron", sans-serif',
        fontSize: '10.5px',
        fontStyle: 'bold',
        color: '#0f172a',
        resolution: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(12);

    const vend1 = wallColliders.create(
      155,
      285,
      'prop_vending_cyan'
    ) as Phaser.Physics.Arcade.Sprite;
    vend1.setDepth(14).refreshBody();

    const vend2 = wallColliders.create(
      230,
      285,
      'prop_vending_magenta'
    ) as Phaser.Physics.Arcade.Sprite;
    vend2.setDepth(14).refreshBody();

    const bench1 = wallColliders.create(
      140,
      380,
      'prop_cyber_bench'
    ) as Phaser.Physics.Arcade.Sprite;
    bench1.setDepth(14).refreshBody();

    const bench2 = wallColliders.create(
      250,
      380,
      'prop_cyber_bench'
    ) as Phaser.Physics.Arcade.Sprite;
    bench2.setDepth(14).refreshBody();

    this.registerHotspot(195, 328, 68, {
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

  /**
   * Terrain de basket à droite de la cour avec un ballon qui rebondit en continu
   */
  private buildBasketballCourtWithBouncingBall(
    wallColliders: Phaser.Physics.Arcade.StaticGroup
  ): void {
    const courtX = 775;
    const courtY = 205;
    const courtW = 300;
    const courtH = 350;

    const g = this.add.graphics().setDepth(2);

    // Revêtement sportif bleu clair extérieur
    g.fillStyle(0x3b82f6, 0.92);
    g.fillRoundedRect(courtX, courtY, courtW, courtH, 8);

    // Raquette orange vif
    g.fillStyle(0xf97316, 0.88);
    g.fillRect(courtX + 95, courtY, 110, 125);

    // Lignes blanches réglementaires
    g.lineStyle(3, 0xffffff, 0.98);
    g.strokeRoundedRect(courtX, courtY, courtW, courtH, 8);
    g.strokeRect(courtX + 95, courtY, 110, 125);
    g.strokeCircle(courtX + 150, courtY + 125, 38);

    g.lineStyle(2.5, 0xffffff, 0.98);
    g.beginPath();
    g.arc(courtX + 150, courtY + 42, 118, 0.15, Math.PI - 0.15, false);
    g.strokePath();

    g.lineBetween(courtX, courtY + courtH - 55, courtX + courtW, courtY + courtH - 55);
    g.strokeCircle(courtX + 150, courtY + courtH - 55, 40);

    this.add
      .text(courtX + 150, courtY + 240, 'TERRAIN BASKET // 3x3', {
        fontFamily: '"Orbitron", sans-serif',
        fontSize: '10.5px',
        fontStyle: 'bold',
        color: '#ffffff',
        resolution: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(3);

    const hoop = wallColliders.create(
      courtX + 150,
      courtY + 14,
      'prop_basket_hoop'
    ) as Phaser.Physics.Arcade.Sprite;
    hoop.setDepth(15).refreshBody();

    // Ballon de basket qui rebondit sur le terrain à droite (bien dégagé des bulles PNJ)
    const ballX = courtX + 215;
    const ballGroundY = courtY + 210;

    const ballShadow = this.add.image(ballX, ballGroundY + 9, 'prop_ball_shadow').setDepth(21);
    const basketball = this.add.image(ballX, ballGroundY, 'prop_basketball').setDepth(22);

    this.tweens.add({
      targets: basketball,
      y: ballGroundY - 32,
      duration: 420,
      yoyo: true,
      repeat: -1,
      ease: 'Quad.easeOut',
    });

    this.tweens.add({
      targets: ballShadow,
      scaleX: { from: 1.1, to: 0.6 },
      scaleY: { from: 1.1, to: 0.6 },
      alpha: { from: 0.5, to: 0.2 },
      duration: 420,
      yoyo: true,
      repeat: -1,
      ease: 'Quad.easeOut',
    });
  }

  /**
   * Arbres, arbustes et lampadaires dans la cour pour meubler l'espace
   */
  private buildCourtyardTreesAndLamps(wallColliders: Phaser.Physics.Arcade.StaticGroup): void {
    const treePositions = [
      { x: 395, y: 205 },
      { x: 395, y: 465 },
      { x: 715, y: 205 },
      { x: 715, y: 465 },
      { x: 115, y: 535 },
      { x: 265, y: 535 },
      { x: 1035, y: 600 },
    ];

    for (const pos of treePositions) {
      const tree = wallColliders.create(pos.x, pos.y, 'prop_tree') as Phaser.Physics.Arcade.Sprite;
      tree.setDepth(16);
      const body = tree.body as Phaser.Physics.Arcade.Body;
      body.setSize(32, 20);
      body.setOffset(16, 56);
    }

    // Arbustes décoratifs dans la cour
    const shrubPositions = [
      { x: 465, y: 165 },
      { x: 675, y: 165 },
      { x: 465, y: 585 },
      { x: 675, y: 585 },
      { x: 85, y: 175 },
      { x: 300, y: 175 },
    ];

    for (const sp of shrubPositions) {
      const shrub = wallColliders.create(
        sp.x,
        sp.y,
        'prop_shrub'
      ) as Phaser.Physics.Arcade.Sprite;
      shrub.setDepth(13).refreshBody();
    }

    // Lampadaires le long de l'allée centrale et de la cour
    const courtyardLamps = [
      { x: 475, y: 260 },
      { x: 665, y: 260 },
      { x: 475, y: 480 },
      { x: 665, y: 480 },
      { x: 345, y: 340 },
    ];

    for (const lp of courtyardLamps) {
      this.add.image(lp.x, lp.y, 'prop_streetlamp').setDepth(15);
    }
  }

  private buildCampusDirectoryTerminal(wallColliders: Phaser.Physics.Arcade.StaticGroup): void {
    const termX = 435;
    const termY = 345;

    const term = wallColliders.create(
      termX,
      termY,
      'prop_holo_terminal'
    ) as Phaser.Physics.Arcade.Sprite;
    term.setDepth(15).refreshBody();

    this.registerHotspot(termX, termY + 16, 56, {
      id: 'campus_terminal',
      type: 'TERMINAL',
      title: `Borne Interactive — Plan ${this.schoolName}`,
      subtitle: 'Orientation vers l’étage Terminale STI2D-3 & salles de cours',
      isLocked: false,
      actionLabel: '[E] Consulter le Plan',
      accentColor: '#0284c7',
      targetZone: 'baggio:tsti2d3',
    });
  }

  /**
   * Lycéens immobiles + Adulte en bas de l'écran servant de tutoriel de démarrage
   */
  private spawnCourtyardNpcsAndAdultTutor(_wallColliders: Phaser.Physics.Arcade.StaticGroup): void {
    const npcConfigs = [
      // Adulte référent en bas de l'écran (près du portail sécurisé) pour le tutoriel de démarrage
      {
        id: 'npc_adult_tutor',
        name: 'M. Lefebvre (CPE)',
        roleLabel: 'ACCUEIL & TUTO DÉMARRAGE',
        avatarKey: 'avatar_tutor_adult',
        x: 570,
        y: 555,
        accentColor: '#d97706',
        accentHex: 0xd97706,
        ambientBubble: '👋 Bienvenue ! Approche-toi et appuie sur [E] pour démarrer (Tuto)',
        dialogueLines: [
          'Bienvenue dans OdyLycée, l’espace numérique sécurisé de ton établissement ! Voici comment bien démarrer :',
          '1️⃣ DÉPLACEMENT : Utilise les touches ZQSD (ou les Flèches directionnelles) pour marcher dans la cour.',
          '2️⃣ ACCÈS SÉCURISÉ : Le grand portail derrière moi est verrouillé par badge : seuls les élèves et professeurs du lycée peuvent entrer.',
          '3️⃣ REJOINDRE TA CLASSE : Monte tout droit vers la grande porte vitrée au Nord de la cour et appuie sur [E] pour accéder au couloir Terminale STI2D-3.',
          '4️⃣ SPÉCIALITÉS STI2D : Utilise le menu en haut à droite pour tester Eliott (SIN), Camille (EE) ou M. Martin (Prof) et voir les portes des labos se déverrouiller selon ta spécialité !',
        ],
      },
      // Lycéens immobiles dans la cour
      {
        id: 'npc_lucas',
        name: 'Lucas',
        roleLabel: 'T-STI2D-3 (SIN)',
        avatarKey: 'avatar_npc_1',
        x: 325,
        y: 435,
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
        x: 885,
        y: 375,
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
        x: 645,
        y: 235,
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
    // Aucun cercle qui bouge dans la cour
    this.hotspots.push({ x, y, radius, payload });
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
      if (dist <= hs.radius && dist < minDistance) {
        minDistance = dist;
        closestPayload = hs.payload;
      }
    }

    for (const npc of this.npcs) {
      const dist = Phaser.Math.Distance.Between(px, py, npc.sprite.x, npc.sprite.y);
      if (dist <= 68 && dist < minDistance) {
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
