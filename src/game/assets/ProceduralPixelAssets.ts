import Phaser from 'phaser';

/**
 * Génère procéduralement toutes les textures Pixel-Art 2D Top-Down 3/4
 * dans une palette "Plein Jour" lumineuse, ensoleillée et colorée (style Lycée César Baggio à Lille),
 * sans aucun halo sombre ni assombrissement nocturne.
 */
export class ProceduralPixelAssets {
  private static initialized = false;

  public static generateAll(scene: Phaser.Scene): void {
    if (this.initialized && scene.textures.exists('avatar_eliott')) {
      this.registerAnimations(scene);
      return;
    }

    // 1. Sols plein jour (Cour pavée claire ensoleillée & Couloir terrazzo clair)
    this.createCourtyardFloorTile(scene);
    this.createCorridorFloorTile(scene);

    // 2. Murs & Architecture Lycée César Baggio (Brique rouge/ocre lilloise & pierre blanche)
    this.createCorridorWallTile(scene);
    this.createBaggioFacadeTile(scene);
    this.createTechPillar(scene);

    // 3. Portes de salles de cours lumineuses & Portail d'entrée
    this.createClassroomDoor(scene, 'door_cyber_cyan', '#0284c7', '#38bdf8', false);
    this.createClassroomDoor(scene, 'door_cyber_amber', '#d97706', '#fbbf24', false);
    this.createClassroomDoor(scene, 'door_cyber_magenta', '#db2777', '#f472b6', false);
    this.createClassroomDoor(scene, 'door_cyber_locked', '#e11d48', '#fb7185', true);
    this.createMainPortal(scene);

    // 4. Icône Cadenas & Feuillage
    this.createHoloLockIcon(scene);
    this.createParticleDot(scene);

    // 5. Mobilier de cour & couloir (Distributeurs, Bancs bois/métal, Panier Basket, Bornes, Casiers)
    this.createVendingMachine(scene, 'prop_vending_cyan', '#0284c7', '#38bdf8', 'FOYER');
    this.createVendingMachine(scene, 'prop_vending_magenta', '#db2777', '#f59e0b', 'DRINK');
    this.createCyberBench(scene);
    this.createHoloTerminal(scene);
    this.createServerRack(scene);
    this.createBasketHoop(scene);

    // 6. Avatars 32x32 (Spritesheets 4 frames d'animation de marche/idle)
    this.createAvatarSpritesheet(scene, 'avatar_eliott', {
      hair: '#1e3a5f',
      skin: '#f6d0b4',
      jacket: '#0284c7',
      accent: '#38bdf8',
      pants: '#334155',
      visor: '#0284c7',
      hasGlasses: true,
    });

    this.createAvatarSpritesheet(scene, 'avatar_camille', {
      hair: '#581c4f',
      skin: '#f8d8c0',
      jacket: '#db2777',
      accent: '#f472b6',
      pants: '#334155',
      visor: '#10b981',
      hasGlasses: false,
    });

    this.createAvatarSpritesheet(scene, 'avatar_martin', {
      hair: '#475569',
      skin: '#f1c7a3',
      jacket: '#b45309',
      accent: '#fbbf24',
      pants: '#1e293b',
      visor: '#d97706',
      hasGlasses: true,
    });

    this.createAvatarSpritesheet(scene, 'avatar_npc_1', {
      hair: '#3f271d',
      skin: '#e2ab87',
      jacket: '#059669',
      accent: '#34d399',
      pants: '#334155',
      visor: '#10b981',
      hasGlasses: false,
    });

    this.createAvatarSpritesheet(scene, 'avatar_npc_2', {
      hair: '#1e293b',
      skin: '#f5d2b8',
      jacket: '#4f46e5',
      accent: '#818cf8',
      pants: '#334155',
      visor: '#0284c7',
      hasGlasses: true,
    });

    this.createAvatarSpritesheet(scene, 'avatar_npc_3', {
      hair: '#7c2d12',
      skin: '#e8b694',
      jacket: '#ea580c',
      accent: '#fb923c',
      pants: '#334155',
      visor: '#db2777',
      hasGlasses: false,
    });

    this.registerAnimations(scene);
    this.initialized = true;
  }

  private static makeCanvas(width: number, height: number): {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
  } {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  }

  private static registerTexture(
    scene: Phaser.Scene,
    key: string,
    diffuseCanvas: HTMLCanvasElement
  ): Phaser.Textures.CanvasTexture {
    if (scene.textures.exists(key)) {
      scene.textures.remove(key);
    }
    const tex = scene.textures.addCanvas(key, diffuseCanvas)!;
    tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
    return tex;
  }

  /**
   * Tuile 64x64 : Sol pavé clair ensoleillé pour la Cour du Lycée Baggio
   */
  private static createCourtyardFloorTile(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(64, 64);

    // Joints de pierre claire
    ctx.fillStyle = '#c4beb2';
    ctx.fillRect(0, 0, 64, 64);

    const slabs = [
      { x: 1, y: 1, w: 30, h: 30 },
      { x: 33, y: 1, w: 30, h: 30 },
      { x: 1, y: 33, w: 30, h: 30 },
      { x: 33, y: 33, w: 30, h: 30 },
    ];

    for (const s of slabs) {
      // Dalle de cour ensoleillée beige/gris pierre claire
      ctx.fillStyle = '#dfd9ce';
      ctx.fillRect(s.x, s.y, s.w, s.h);

      // Rebord éclairé par le soleil (haut/gauche)
      ctx.fillStyle = '#ece8e0';
      ctx.fillRect(s.x, s.y, s.w, 2);
      ctx.fillRect(s.x, s.y, 2, s.h);

      // Ombre légère de relief (bas/droite)
      ctx.fillStyle = '#cfc8bc';
      ctx.fillRect(s.x, s.y + s.h - 2, s.w, 2);
      ctx.fillRect(s.x + s.w - 2, s.y, 2, s.h);

      // Petit grain minéral
      ctx.fillStyle = '#d5cfc3';
      ctx.fillRect(s.x + 6, s.y + 6, 2, 2);
      ctx.fillRect(s.x + s.w - 8, s.y + s.h - 8, 2, 2);
    }

    this.registerTexture(scene, 'tile_courtyard_floor', canvas);
  }

  /**
   * Tuile 64x64 : Sol clair lumineux (terrazzo gris perle / blanc) pour le Couloir STI2D
   */
  private static createCorridorFloorTile(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(64, 64);

    // Joint fin gris clair
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, 64, 64);

    // Dalle de couloir claire et lumineuse
    ctx.fillStyle = '#e8eef5';
    ctx.fillRect(1, 1, 62, 62);

    // Biseau blanc lumineux
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(1, 1, 62, 2);
    ctx.fillRect(1, 1, 2, 62);

    // Léger ombrage bas/droite
    ctx.fillStyle = '#d8e2ed';
    ctx.fillRect(1, 61, 62, 2);
    ctx.fillRect(61, 1, 2, 62);

    // Motif discret de dallage scolaire moderne
    ctx.fillStyle = '#dde6f0';
    for (let y = 12; y < 56; y += 12) {
      for (let x = 12; x < 56; x += 12) {
        ctx.fillRect(x, y, 3, 2);
      }
    }

    this.registerTexture(scene, 'tile_corridor_floor', canvas);
  }

  /**
   * Mur supérieur 64x96 clair et moderne en vue 3/4 pour le Couloir T-STI2D-3
   */
  private static createCorridorWallTile(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(64, 96);

    // Fond de mur blanc cassé / gris perle très clair
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, 64, 96);

    // Corniche supérieure (plafond clair)
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, 64, 12);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 12, 64, 4);

    // Panneaux muraux acoustiques clairs
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(2, 18, 28, 56);
    ctx.fillRect(34, 18, 28, 56);

    // Bandeau bleu-ciel technologique STI2D au milieu du mur
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(0, 48, 64, 8);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 48, 64, 2);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 55, 64, 1);

    // Plinthe basse en aluminium brossé
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 76, 64, 20);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 76, 64, 2);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 93, 64, 3);

    this.registerTexture(scene, 'tile_wall_top', canvas);
  }

  /**
   * Façade monumentale du Lycée César Baggio en plein jour (Briques rouges/ocres de Lille & pierre calcaire blanche)
   */
  private static createBaggioFacadeTile(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(64, 112);

    // Fond mortier pierre claire
    ctx.fillStyle = '#e5dec9';
    ctx.fillRect(0, 0, 64, 112);

    // Corniche supérieure en pierre blanche calcaire & ardoise claire
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, 64, 12);
    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(0, 12, 64, 8);

    // Briques rouges/terracotta typiques de Baggio au soleil
    for (let y = 22; y < 86; y += 8) {
      const offset = (y / 8) % 2 === 0 ? 0 : 8;
      for (let x = -8; x < 64; x += 16) {
        ctx.fillStyle = (x + y) % 16 === 0 ? '#c85a46' : '#d46853';
        ctx.fillRect(x + offset + 1, y + 1, 14, 6);
      }
    }

    // Encadrement de fenêtre en pierre blanche
    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(12, 26, 40, 48);

    // Grandes fenêtres vitrées reflétant le ciel de jour
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(14, 28, 36, 44);
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(16, 30, 15, 18);
    ctx.fillRect(33, 30, 15, 18);
    ctx.fillRect(16, 50, 15, 18);
    ctx.fillRect(33, 50, 15, 18);

    // Reflets de soleil blancs sur les vitres
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(18, 32, 5, 12);
    ctx.fillRect(35, 32, 5, 12);

    // Soubassement en pierre calcaire claire
    ctx.fillStyle = '#e2dcd0';
    ctx.fillRect(0, 86, 64, 26);
    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(0, 86, 64, 4);
    ctx.fillStyle = '#b8b0a2';
    ctx.fillRect(0, 109, 64, 3);

    this.registerTexture(scene, 'tile_facade_baggio', canvas);
  }

  /**
   * Pilier architectural clair 32x96
   */
  private static createTechPillar(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(32, 96);

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(2, 0, 28, 96);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(6, 0, 20, 96);

    // Bandeau coloré vertical STI2D
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(14, 12, 4, 70);

    // Base du pilier
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 82, 32, 14);

    this.registerTexture(scene, 'prop_pillar', canvas);
  }

  /**
   * Porte vitrée de salle de classe (64x88) en plein jour
   */
  private static createClassroomDoor(
    scene: Phaser.Scene,
    key: string,
    primaryColor: string,
    glassHighlight: string,
    isLocked: boolean
  ): void {
    const { canvas, ctx } = this.makeCanvas(64, 88);

    // Cadre extérieur aluminium clair
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, 64, 88);

    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(2, 2, 60, 84);

    // Bandeau supérieur de couleur (indique l'état ou la matière)
    ctx.fillStyle = primaryColor;
    ctx.fillRect(4, 4, 56, 6);

    // Montants latéraux
    ctx.fillStyle = primaryColor;
    ctx.fillRect(4, 10, 3, 74);
    ctx.fillRect(57, 10, 3, 74);

    // Double vantail vitré clair
    ctx.fillStyle = isLocked ? '#fecdd3' : '#bae6fd';
    ctx.fillRect(9, 12, 21, 68);
    ctx.fillRect(34, 12, 21, 68);

    // Reflets de jour sur les vitres
    ctx.fillStyle = isLocked ? '#ffe4e6' : '#e0f2fe';
    ctx.fillRect(12, 16, 6, 52);
    ctx.fillRect(37, 16, 6, 52);

    if (isLocked) {
      // Bandeaux rouges de verrouillage bien lisibles
      ctx.fillStyle = '#e11d48';
      for (let y = 24; y < 72; y += 14) {
        ctx.fillRect(9, y, 46, 3);
      }
    } else {
      // Poignées aluminium/couleur
      ctx.fillStyle = primaryColor;
      ctx.fillRect(26, 40, 3, 14);
      ctx.fillRect(35, 40, 3, 14);

      // Seuil d'accueil
      ctx.fillStyle = glassHighlight;
      ctx.fillRect(8, 82, 48, 4);
    }

    this.registerTexture(scene, key, canvas);
  }

  /**
   * Grand Portail d'entrée du bâtiment des Terminales (128x96) en plein jour
   */
  private static createMainPortal(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(128, 96);

    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, 128, 96);

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(4, 4, 120, 88);

    // Arche bleue STI2D
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(6, 6, 116, 6);
    ctx.fillRect(6, 6, 5, 86);
    ctx.fillRect(117, 6, 5, 86);

    // Grandes portes vitrées claires
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(16, 16, 44, 74);
    ctx.fillRect(68, 16, 44, 74);

    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(22, 22, 12, 62);
    ctx.fillRect(74, 22, 12, 62);

    // Tapis d'entrée
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(16, 90, 96, 5);

    this.registerTexture(scene, 'portal_baggio_main', canvas);
  }

  /**
   * Icône Cadenas 32x32 pour les portes de spécialité verrouillées
   */
  private static createHoloLockIcon(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(32, 32);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.fillRect(4, 4, 24, 24);

    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, 22, 22);

    // Anse du cadenas
    ctx.fillStyle = '#9f1239';
    ctx.fillRect(11, 8, 10, 3);
    ctx.fillRect(11, 8, 3, 7);
    ctx.fillRect(18, 8, 3, 7);

    // Corps du cadenas
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(9, 14, 14, 11);

    // Trou de serrure blanc
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(15, 17, 2, 5);

    this.registerTexture(scene, 'icon_holo_lock', canvas);
  }

  private static createParticleDot(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(8, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2, 2, 4, 4);
    this.registerTexture(scene, 'fx_neon_dot', canvas);
  }

  /**
   * Distributeurs automatiques "Foyer Tech" 48x72 en plein jour
   */
  private static createVendingMachine(
    scene: Phaser.Scene,
    key: string,
    primaryColor: string,
    secondaryColor: string,
    _label: string
  ): void {
    const { canvas, ctx } = this.makeCanvas(48, 72);

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(2, 2, 44, 68);

    ctx.fillStyle = primaryColor;
    ctx.fillRect(2, 2, 44, 4);
    ctx.fillRect(2, 2, 3, 68);
    ctx.fillRect(43, 2, 3, 68);

    ctx.fillStyle = primaryColor;
    ctx.fillRect(6, 8, 36, 8);

    // Vitrine claire avec boissons colorées
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(7, 20, 24, 34);

    const shelfColors = [primaryColor, secondaryColor, '#10b981'];
    for (let row = 0; row < 3; row++) {
      const sy = 24 + row * 10;
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(8, sy + 6, 22, 2);
      for (let col = 0; col < 4; col++) {
        ctx.fillStyle = shelfColors[(row + col) % shelfColors.length];
        ctx.fillRect(9 + col * 5, sy, 3, 6);
      }
    }

    ctx.fillStyle = secondaryColor;
    ctx.fillRect(34, 24, 6, 10);

    ctx.fillStyle = '#64748b';
    ctx.fillRect(8, 58, 32, 8);

    this.registerTexture(scene, key, canvas);
  }

  /**
   * Banc de cour en bois clair et métal 64x28
   */
  private static createCyberBench(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(64, 28);
    // Ombre légère au sol
    ctx.fillStyle = 'rgba(15, 23, 42, 0.14)';
    ctx.fillRect(4, 20, 56, 5);

    // Pieds métalliques gris
    ctx.fillStyle = '#475569';
    ctx.fillRect(6, 8, 6, 18);
    ctx.fillRect(52, 8, 6, 18);

    // Lattes de bois clair ensoleillé
    ctx.fillStyle = '#d97706';
    ctx.fillRect(2, 6, 60, 12);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(4, 8, 56, 3);
    ctx.fillRect(4, 13, 56, 3);

    this.registerTexture(scene, 'prop_cyber_bench', canvas);
  }

  /**
   * Borne d'orientation interactive 40x56
   */
  private static createHoloTerminal(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(40, 56);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(8, 30, 24, 24);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(6, 48, 28, 6);

    // Écran LCD bleu clair
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(4, 4, 32, 26);
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(6, 6, 28, 22);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(9, 10, 16, 3);
    ctx.fillRect(9, 15, 22, 2);
    ctx.fillRect(9, 19, 14, 2);

    this.registerTexture(scene, 'prop_holo_terminal', canvas);
  }

  /**
   * Casiers / Armoires techniques STI2D claires 40x72
   */
  private static createServerRack(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(40, 72);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(2, 2, 36, 68);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(4, 4, 32, 64);

    for (let y = 10; y < 60; y += 12) {
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(7, y, 26, 8);
      ctx.fillStyle = y % 24 === 0 ? '#0284c7' : '#10b981';
      ctx.fillRect(9, y + 2, 4, 4);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(16, y + 2, 14, 3);
    }

    this.registerTexture(scene, 'prop_server_rack', canvas);
  }

  /**
   * Panier de basket extérieur plein jour 48x72
   */
  private static createBasketHoop(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(48, 72);
    ctx.fillStyle = '#475569';
    ctx.fillRect(21, 24, 6, 46);

    // Panneau blanc et rouge réglementaire
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 4, 36, 24);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(6, 4, 36, 2);
    ctx.fillRect(6, 26, 36, 2);
    ctx.fillRect(6, 4, 2, 24);
    ctx.fillRect(40, 4, 2, 24);

    // Carré de mire
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(17, 12, 14, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(19, 14, 10, 6);

    // Arceau orange & filet blanc
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(16, 24, 16, 3);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(18, 27, 2, 8);
    ctx.fillRect(23, 27, 2, 9);
    ctx.fillRect(28, 27, 2, 8);

    this.registerTexture(scene, 'prop_basket_hoop', canvas);
  }

  /**
   * Génère une spritesheet 128x32 (4 frames de 32x32) pour un avatar net en plein jour.
   */
  private static createAvatarSpritesheet(
    scene: Phaser.Scene,
    key: string,
    palette: {
      hair: string;
      skin: string;
      jacket: string;
      accent: string;
      pants: string;
      visor: string;
      hasGlasses: boolean;
    }
  ): void {
    const frameWidth = 32;
    const frameHeight = 32;
    const frameCount = 4;

    const { canvas, ctx } = this.makeCanvas(frameWidth * frameCount, frameHeight);

    for (let f = 0; f < frameCount; f++) {
      const ox = f * frameWidth;
      const bobY = f === 1 || f === 3 ? -1 : 0;
      const leftLegOffset = f === 1 ? -2 : f === 3 ? 2 : 0;
      const rightLegOffset = f === 1 ? 2 : f === 3 ? -2 : 0;
      const leftArmOffset = f === 1 ? 1 : f === 3 ? -1 : 0;
      const rightArmOffset = f === 1 ? -1 : f === 3 ? 1 : 0;

      // Petite ombre naturelle au sol (aucun halo lumineux)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
      ctx.fillRect(ox + 8, 27, 16, 3);

      // Jambes
      ctx.fillStyle = palette.pants;
      ctx.fillRect(ox + 10, 21 + leftLegOffset, 5, 7);
      ctx.fillRect(ox + 17, 21 + rightLegOffset, 5, 7);

      // Baskets blanches/colorées
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ox + 10, 27 + leftLegOffset, 5, 2);
      ctx.fillRect(ox + 17, 27 + rightLegOffset, 5, 2);

      // Veste / Sweat lycéen
      ctx.fillStyle = palette.jacket;
      ctx.fillRect(ox + 8, 12 + bobY, 16, 10);

      // Détail couleur sur le sweat
      ctx.fillStyle = palette.accent;
      ctx.fillRect(ox + 9, 13 + bobY, 14, 2);
      ctx.fillRect(ox + 15, 13 + bobY, 2, 8);

      // Bras gauche & droit
      ctx.fillStyle = palette.jacket;
      ctx.fillRect(ox + 5, 13 + bobY + leftArmOffset, 3, 8);
      ctx.fillRect(ox + 24, 13 + bobY + rightArmOffset, 3, 8);

      // Mains
      ctx.fillStyle = palette.skin;
      ctx.fillRect(ox + 5, 20 + bobY + leftArmOffset, 3, 2);
      ctx.fillRect(ox + 24, 20 + bobY + rightArmOffset, 3, 2);

      // Tête & Visage
      ctx.fillStyle = palette.skin;
      ctx.fillRect(ox + 9, 4 + bobY, 14, 9);

      // Cheveux pixel-art
      ctx.fillStyle = palette.hair;
      ctx.fillRect(ox + 8, 2 + bobY, 16, 4);
      ctx.fillRect(ox + 8, 4 + bobY, 2, 5);
      ctx.fillRect(ox + 22, 4 + bobY, 2, 5);

      // Yeux & lunettes/casque
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(ox + 11, 8 + bobY, 2, 2);
      ctx.fillRect(ox + 19, 8 + bobY, 2, 2);

      if (palette.hasGlasses) {
        ctx.fillStyle = palette.visor;
        ctx.fillRect(ox + 10, 7 + bobY, 12, 1);
      } else {
        ctx.fillStyle = palette.visor;
        ctx.fillRect(ox + 7, 6 + bobY, 2, 5);
        ctx.fillRect(ox + 23, 6 + bobY, 2, 5);
      }
    }

    const tex = this.registerTexture(scene, key, canvas);
    for (let f = 0; f < frameCount; f++) {
      tex.add(f, 0, f * frameWidth, 0, frameWidth, frameHeight);
    }
  }

  private static registerAnimations(scene: Phaser.Scene): void {
    const avatarKeys = [
      'avatar_eliott',
      'avatar_camille',
      'avatar_martin',
      'avatar_npc_1',
      'avatar_npc_2',
      'avatar_npc_3',
    ];

    for (const key of avatarKeys) {
      const walkAnimKey = `${key}_walk`;
      const idleAnimKey = `${key}_idle`;

      if (!scene.anims.exists(walkAnimKey)) {
        scene.anims.create({
          key: walkAnimKey,
          frames: [
            { key, frame: 1 },
            { key, frame: 0 },
            { key, frame: 3 },
            { key, frame: 2 },
          ],
          frameRate: 8,
          repeat: -1,
        });
      }

      if (!scene.anims.exists(idleAnimKey)) {
        scene.anims.create({
          key: idleAnimKey,
          frames: [
            { key, frame: 0 },
            { key, frame: 2 },
          ],
          frameRate: 2,
          repeat: -1,
        });
      }
    }
  }
}
