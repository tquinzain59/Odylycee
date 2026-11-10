import Phaser from 'phaser';

/**
 * Génère procéduralement toutes les textures Pixel-Art 2D Top-Down 3/4
 * dans une palette "Plein Jour" lumineuse, ensoleillée et colorée :
 * - Cour pavée, arbres, arbustes, lampadaires
 * - Grilles d'enceinte, grand portail sécurisé, loge de sécurité
 * - Rue latérale & rue d'entrée avec véhicules garés
 * - Ballon de basket rebondissant
 * - Avatars élèves, professeur et adulte référent (tutoriel)
 */
export class ProceduralPixelAssets {
  private static initialized = false;

  public static generateAll(scene: Phaser.Scene): void {
    if (this.initialized && scene.textures.exists('prop_security_gate')) {
      this.registerAnimations(scene);
      return;
    }

    // 1. Sols plein jour (Cour pavée, Asphalte rue, Trottoir, Couloir terrazzo)
    this.createCourtyardFloorTile(scene);
    this.createStreetAsphaltTile(scene);
    this.createSidewalkTile(scene);
    this.createCorridorFloorTile(scene);

    // 2. Murs, Grilles d'enceinte & Architecture Lycée César Baggio
    this.createCorridorWallTile(scene);
    this.createBaggioFacadeTile(scene);
    this.createTechPillar(scene);
    this.createFenceHorizontal(scene);
    this.createFenceVertical(scene);
    this.createSecurityGate(scene);
    this.createGuardBooth(scene);

    // 3. Portes de salles de cours lumineuses & Portail d'entrée bâtiment
    this.createClassroomDoor(scene, 'door_cyber_cyan', '#0284c7', '#38bdf8', false);
    this.createClassroomDoor(scene, 'door_cyber_amber', '#d97706', '#fbbf24', false);
    this.createClassroomDoor(scene, 'door_cyber_magenta', '#db2777', '#f472b6', false);
    this.createClassroomDoor(scene, 'door_cyber_locked', '#e11d48', '#fb7185', true);
    this.createMainPortal(scene);

    // 4. Icône Cadenas & Ballon de Basket
    this.createHoloLockIcon(scene);
    this.createBasketball(scene);

    // 5. Végétation, Lampadaires & Mobilier (Arbres, Arbustes, Lampadaires, Distributeurs, Bancs, Panier)
    this.createCourtyardTree(scene);
    this.createShrub(scene);
    this.createStreetlamp(scene);
    this.createVendingMachine(scene, 'prop_vending_cyan', '#0284c7', '#38bdf8');
    this.createVendingMachine(scene, 'prop_vending_magenta', '#db2777', '#f59e0b');
    this.createCyberBench(scene);
    this.createHoloTerminal(scene);
    this.createServerRack(scene);
    this.createBasketHoop(scene);

    // 6. Véhicules garés (verticaux pour la rue de droite, horizontaux pour la rue du bas)
    this.createParkedCarVertical(scene, 'prop_car_v_blue', '#2563eb', '#60a5fa');
    this.createParkedCarVertical(scene, 'prop_car_v_red', '#dc2626', '#f87171');
    this.createParkedCarVertical(scene, 'prop_car_v_white', '#e2e8f0', '#f8fafc');
    this.createParkedCarVertical(scene, 'prop_car_v_slate', '#475569', '#94a3b8');

    this.createParkedCarHorizontal(scene, 'prop_car_h_emerald', '#059669', '#34d399');
    this.createParkedCarHorizontal(scene, 'prop_car_h_amber', '#d97706', '#fbbf24');
    this.createParkedCarHorizontal(scene, 'prop_car_h_blue', '#1d4ed8', '#60a5fa');

    // 7. Avatars 32x32 (Élèves, Professeur & Adulte Tutoriel)
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

    this.createAvatarSpritesheet(scene, 'avatar_tutor_adult', {
      hair: '#334155',
      skin: '#f1c7a3',
      jacket: '#1e3a8a',
      accent: '#f59e0b',
      pants: '#0f172a',
      visor: '#1e3a8a',
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
   * Tuile 64x64 : Sol pavé clair ensoleillé pour la Cour du Lycée
   */
  private static createCourtyardFloorTile(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(64, 64);

    ctx.fillStyle = '#c4beb2';
    ctx.fillRect(0, 0, 64, 64);

    const slabs = [
      { x: 1, y: 1, w: 30, h: 30 },
      { x: 33, y: 1, w: 30, h: 30 },
      { x: 1, y: 33, w: 30, h: 30 },
      { x: 33, y: 33, w: 30, h: 30 },
    ];

    for (const s of slabs) {
      ctx.fillStyle = '#dfd9ce';
      ctx.fillRect(s.x, s.y, s.w, s.h);

      ctx.fillStyle = '#ece8e0';
      ctx.fillRect(s.x, s.y, s.w, 2);
      ctx.fillRect(s.x, s.y, 2, s.h);

      ctx.fillStyle = '#cfc8bc';
      ctx.fillRect(s.x, s.y + s.h - 2, s.w, 2);
      ctx.fillRect(s.x + s.w - 2, s.y, 2, s.h);
    }

    this.registerTexture(scene, 'tile_courtyard_floor', canvas);
  }

  /**
   * Tuile 64x64 : Asphalte clair de rue urbaine en plein jour
   */
  private static createStreetAsphaltTile(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(64, 64);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, 64, 64);

    // Léger grain d'asphalte
    ctx.fillStyle = '#58677d';
    ctx.fillRect(8, 12, 3, 3);
    ctx.fillRect(42, 28, 3, 3);
    ctx.fillRect(20, 50, 3, 3);
    ctx.fillStyle = '#718299';
    ctx.fillRect(28, 10, 3, 2);
    ctx.fillRect(52, 46, 3, 2);

    this.registerTexture(scene, 'tile_street_asphalt', canvas);
  }

  /**
   * Tuile 32x32 : Dalles de trottoir extérieur
   */
  private static createSidewalkTile(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(32, 32);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(1, 1, 30, 30);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(1, 1, 30, 2);
    ctx.fillRect(1, 1, 2, 30);
    this.registerTexture(scene, 'tile_sidewalk', canvas);
  }

  /**
   * Tuile 64x64 : Sol clair lumineux (terrazzo gris perle / blanc) pour le Couloir STI2D
   */
  private static createCorridorFloorTile(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(64, 64);

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, 64, 64);

    ctx.fillStyle = '#e8eef5';
    ctx.fillRect(1, 1, 62, 62);

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(1, 1, 62, 2);
    ctx.fillRect(1, 1, 2, 62);

    ctx.fillStyle = '#d8e2ed';
    ctx.fillRect(1, 61, 62, 2);
    ctx.fillRect(61, 1, 2, 62);

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

    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, 64, 96);

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, 64, 12);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 12, 64, 4);

    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(2, 18, 28, 56);
    ctx.fillRect(34, 18, 28, 56);

    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(0, 48, 64, 8);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 48, 64, 2);
    ctx.fillRect(0, 55, 64, 1);

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 76, 64, 20);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 76, 64, 2);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 93, 64, 3);

    this.registerTexture(scene, 'tile_wall_top', canvas);
  }

  /**
   * Façade monumentale du Lycée César Baggio en plein jour
   */
  private static createBaggioFacadeTile(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(64, 112);

    ctx.fillStyle = '#e5dec9';
    ctx.fillRect(0, 0, 64, 112);

    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, 64, 12);
    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(0, 12, 64, 8);

    for (let y = 22; y < 86; y += 8) {
      const offset = (y / 8) % 2 === 0 ? 0 : 8;
      for (let x = -8; x < 64; x += 16) {
        ctx.fillStyle = (x + y) % 16 === 0 ? '#c85a46' : '#d46853';
        ctx.fillRect(x + offset + 1, y + 1, 14, 6);
      }
    }

    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(12, 26, 40, 48);

    ctx.fillStyle = '#0284c7';
    ctx.fillRect(14, 28, 36, 44);
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(16, 30, 15, 18);
    ctx.fillRect(33, 30, 15, 18);
    ctx.fillRect(16, 50, 15, 18);
    ctx.fillRect(33, 50, 15, 18);

    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(18, 32, 5, 12);
    ctx.fillRect(35, 32, 5, 12);

    ctx.fillStyle = '#e2dcd0';
    ctx.fillRect(0, 86, 64, 26);
    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(0, 86, 64, 4);
    ctx.fillStyle = '#b8b0a2';
    ctx.fillRect(0, 109, 64, 3);

    this.registerTexture(scene, 'tile_facade_baggio', canvas);
  }

  /**
   * Grille d'enceinte horizontale (64x48) : muret de brique + barreaux en fer forgé gris anthracite
   */
  private static createFenceHorizontal(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(64, 48);

    // Muret bas en brique rouge et coiffe de pierre blanche
    ctx.fillStyle = '#c85a46';
    ctx.fillRect(0, 32, 64, 14);
    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(0, 29, 64, 4);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 45, 64, 3);

    // Lisses horizontales en acier anthracite
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 8, 64, 3);
    ctx.fillRect(0, 24, 64, 3);

    // Barreaux verticaux + pointes dorées/blanches
    for (let x = 4; x < 64; x += 8) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x, 4, 3, 26);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x, 2, 3, 3);
    }

    // Pilier intermédiaire à gauche
    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(0, 6, 6, 40);
    ctx.fillStyle = '#c85a46';
    ctx.fillRect(1, 10, 4, 34);

    this.registerTexture(scene, 'prop_fence_h', canvas);
  }

  /**
   * Grille d'enceinte verticale (24x64) pour séparer la cour des rues latérales
   */
  private static createFenceVertical(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(24, 64);

    // Muret brique & pierre en vue 3/4
    ctx.fillStyle = '#c85a46';
    ctx.fillRect(4, 0, 16, 64);
    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(6, 0, 12, 64);

    // Grille métallique supérieure
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(10, 0, 4, 64);

    // Piliers tous les 32px
    ctx.fillStyle = '#c85a46';
    ctx.fillRect(2, 0, 20, 10);
    ctx.fillRect(2, 32, 20, 10);
    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(3, 2, 18, 6);
    ctx.fillRect(3, 34, 18, 6);

    this.registerTexture(scene, 'prop_fence_v', canvas);
  }

  /**
   * Grand Portail Sécurisé d'entrée du Lycée (220x76)
   * Illustre clairement que le lycée et l'application sont fermés au public non autorisé.
   */
  private static createSecurityGate(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(220, 76);

    // Piliers massifs gauche et droite en brique et pierre
    const drawGatePillar = (px: number) => {
      ctx.fillStyle = '#f5f0e6';
      ctx.fillRect(px, 4, 28, 70);
      ctx.fillStyle = '#c85a46';
      ctx.fillRect(px + 3, 10, 22, 58);
      ctx.fillStyle = '#f5f0e6';
      ctx.fillRect(px + 2, 24, 24, 6);
      ctx.fillRect(px + 2, 48, 24, 6);
      // Lecteur de badge / Gyrophare sécurité
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px + 8, 32, 12, 14);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(px + 10, 35, 8, 4);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(px + 10, 41, 8, 3);
    };

    drawGatePillar(0);
    drawGatePillar(192);

    // Arche supérieure de sécurité
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(24, 6, 172, 14);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(28, 8, 164, 10);

    // Vantaux du portail blindé en fer forgé (fermés et sécurisés)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(28, 22, 164, 4);
    ctx.fillRect(28, 44, 164, 4);
    ctx.fillRect(28, 64, 164, 5);

    // Montants centraux des 2 battants avec verrou magnétique rouge
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(106, 20, 8, 50);

    for (let x = 34; x < 188; x += 8) {
      ctx.fillStyle = '#334155';
      ctx.fillRect(x, 20, 3, 48);
    }

    // Panneau central "ACCÈS SÉCURISÉ BADGE" sur les grilles
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(68, 30, 84, 22);
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(70, 32, 80, 18);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(76, 39, 68, 4);

    this.registerTexture(scene, 'prop_security_gate', canvas);
  }

  /**
   * Loge de sécurité / Accueil du lycée à côté du portail (76x76)
   */
  private static createGuardBooth(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(76, 76);

    // Toit débordant
    ctx.fillStyle = '#334155';
    ctx.fillRect(2, 4, 72, 14);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(4, 14, 68, 4);

    // Corps de la loge (brique & pierre)
    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(6, 18, 64, 54);
    ctx.fillStyle = '#c85a46';
    ctx.fillRect(8, 44, 60, 26);

    // Baie vitrée panoramique de surveillance
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(12, 22, 52, 20);
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(14, 24, 23, 16);
    ctx.fillRect(39, 24, 23, 16);
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(16, 26, 6, 12);

    this.registerTexture(scene, 'prop_guard_booth', canvas);
  }

  /**
   * Arbre de cour 64x80 dans un bac en pierre claire
   */
  private static createCourtyardTree(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(64, 80);

    // Ombre au sol
    ctx.fillStyle = 'rgba(15, 23, 42, 0.16)';
    ctx.fillRect(10, 62, 44, 14);

    // Bac en pierre autour du tronc
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(16, 58, 32, 16);
    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(18, 60, 28, 12);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(22, 62, 20, 6);

    // Tronc en bois
    ctx.fillStyle = '#78350f';
    ctx.fillRect(27, 38, 10, 26);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(28, 38, 4, 24);

    // Feuillage ensoleillé (3 niveaux de vert lumineux)
    ctx.fillStyle = '#15803d';
    ctx.fillRect(10, 16, 44, 28);
    ctx.fillRect(16, 8, 32, 38);

    ctx.fillStyle = '#22c55e';
    ctx.fillRect(12, 12, 40, 24);
    ctx.fillRect(18, 6, 28, 30);

    ctx.fillStyle = '#4ade80';
    ctx.fillRect(16, 10, 26, 14);
    ctx.fillRect(22, 6, 16, 10);

    this.registerTexture(scene, 'prop_tree', canvas);
  }

  /**
   * Arbuste / Haie taillée 36x28
   */
  private static createShrub(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(36, 28);

    // Jardinière basse
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(4, 20, 28, 7);

    // Buisson vert vif
    ctx.fillStyle = '#15803d';
    ctx.fillRect(2, 6, 32, 16);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(4, 4, 28, 14);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(8, 5, 18, 7);

    this.registerTexture(scene, 'prop_shrub', canvas);
  }

  /**
   * Lampadaire urbain de jour 28x80
   */
  private static createStreetlamp(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(28, 80);

    // Ombre portée
    ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
    ctx.fillRect(6, 70, 16, 6);

    // Socle & Mât gris anthracite
    ctx.fillStyle = '#334155';
    ctx.fillRect(9, 64, 10, 12);
    ctx.fillStyle = '#475569';
    ctx.fillRect(12, 14, 4, 52);

    // Lanterne supérieure
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(6, 4, 16, 4);
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(8, 8, 12, 7);
    ctx.fillStyle = '#334155';
    ctx.fillRect(7, 15, 14, 2);

    this.registerTexture(scene, 'prop_streetlamp', canvas);
  }

  /**
   * Voiture garée verticale (44x78) pour la rue de droite
   */
  private static createParkedCarVertical(
    scene: Phaser.Scene,
    key: string,
    bodyColor: string,
    roofColor: string
  ): void {
    const { canvas, ctx } = this.makeCanvas(44, 78);

    // Ombre sous le véhicule
    ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.fillRect(4, 6, 36, 68);

    // Roues
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(3, 12, 4, 14);
    ctx.fillRect(37, 12, 4, 14);
    ctx.fillRect(3, 52, 4, 14);
    ctx.fillRect(37, 52, 4, 14);

    // Carrosserie
    ctx.fillStyle = bodyColor;
    ctx.fillRect(6, 4, 32, 70);

    // Pare-chocs
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(8, 3, 28, 3);
    ctx.fillRect(8, 72, 28, 3);

    // Phares avant & feux arrière
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(9, 4, 6, 3);
    ctx.fillRect(29, 4, 6, 3);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(9, 71, 6, 3);
    ctx.fillRect(29, 71, 6, 3);

    // Pare-brise & lunette arrière
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(9, 18, 26, 12);
    ctx.fillRect(9, 52, 26, 10);

    // Toit
    ctx.fillStyle = roofColor;
    ctx.fillRect(9, 30, 26, 22);

    this.registerTexture(scene, key, canvas);
  }

  /**
   * Voiture garée horizontale (78x44) pour la rue du bas
   */
  private static createParkedCarHorizontal(
    scene: Phaser.Scene,
    key: string,
    bodyColor: string,
    roofColor: string
  ): void {
    const { canvas, ctx } = this.makeCanvas(78, 44);

    // Ombre
    ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.fillRect(6, 8, 68, 32);

    // Roues
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(14, 34, 14, 6);
    ctx.fillRect(50, 34, 14, 6);

    // Carrosserie
    ctx.fillStyle = bodyColor;
    ctx.fillRect(4, 10, 70, 26);

    // Toit & vitres
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(16, 12, 46, 12);
    ctx.fillStyle = roofColor;
    ctx.fillRect(24, 10, 30, 14);

    // Phares et feux
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(70, 14, 4, 6);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(4, 14, 4, 6);

    this.registerTexture(scene, key, canvas);
  }

  /**
   * Ballon de basket 22x22 bien visible + ombre au sol
   */
  private static createBasketball(scene: Phaser.Scene): void {
    const { canvas, ctx } = this.makeCanvas(22, 22);

    // Contour sombre net pour détacher le ballon du terrain bleu
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(5, 1, 12, 20);
    ctx.fillRect(1, 5, 20, 12);
    ctx.fillRect(3, 3, 16, 16);

    // Corps orange vif du ballon de basket
    ctx.fillStyle = '#f97316';
    ctx.fillRect(6, 2, 10, 18);
    ctx.fillRect(2, 6, 18, 10);
    ctx.fillRect(4, 4, 14, 14);

    // Reflet lumineux haut-gauche
    ctx.fillStyle = '#fdba74';
    ctx.fillRect(6, 4, 4, 4);

    // Rainures noires caractéristiques du ballon de basket
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(10, 2, 2, 18);
    ctx.fillRect(2, 10, 18, 2);
    ctx.fillRect(5, 4, 2, 14);
    ctx.fillRect(15, 4, 2, 14);

    this.registerTexture(scene, 'prop_basketball', canvas);

    // Ombre du ballon au sol
    const { canvas: sCanvas, ctx: sCtx } = this.makeCanvas(22, 10);
    sCtx.fillStyle = 'rgba(15, 23, 42, 0.42)';
    sCtx.fillRect(3, 2, 16, 6);
    this.registerTexture(scene, 'prop_ball_shadow', sCanvas);
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

    ctx.fillStyle = '#0284c7';
    ctx.fillRect(14, 12, 4, 70);

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

    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, 64, 88);

    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(2, 2, 60, 84);

    ctx.fillStyle = primaryColor;
    ctx.fillRect(4, 4, 56, 6);
    ctx.fillRect(4, 10, 3, 74);
    ctx.fillRect(57, 10, 3, 74);

    ctx.fillStyle = isLocked ? '#fecdd3' : '#bae6fd';
    ctx.fillRect(9, 12, 21, 68);
    ctx.fillRect(34, 12, 21, 68);

    ctx.fillStyle = isLocked ? '#ffe4e6' : '#e0f2fe';
    ctx.fillRect(12, 16, 6, 52);
    ctx.fillRect(37, 16, 6, 52);

    if (isLocked) {
      ctx.fillStyle = '#e11d48';
      for (let y = 24; y < 72; y += 14) {
        ctx.fillRect(9, y, 46, 3);
      }
    } else {
      ctx.fillStyle = primaryColor;
      ctx.fillRect(26, 40, 3, 14);
      ctx.fillRect(35, 40, 3, 14);

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

    ctx.fillStyle = '#0284c7';
    ctx.fillRect(6, 6, 116, 6);
    ctx.fillRect(6, 6, 5, 86);
    ctx.fillRect(117, 6, 5, 86);

    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(16, 16, 44, 74);
    ctx.fillRect(68, 16, 44, 74);

    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(22, 22, 12, 62);
    ctx.fillRect(74, 22, 12, 62);

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

    ctx.fillStyle = '#9f1239';
    ctx.fillRect(11, 8, 10, 3);
    ctx.fillRect(11, 8, 3, 7);
    ctx.fillRect(18, 8, 3, 7);

    ctx.fillStyle = '#e11d48';
    ctx.fillRect(9, 14, 14, 11);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(15, 17, 2, 5);

    this.registerTexture(scene, 'icon_holo_lock', canvas);
  }

  /**
   * Distributeurs automatiques "Foyer Tech" 48x72 en plein jour
   */
  private static createVendingMachine(
    scene: Phaser.Scene,
    key: string,
    primaryColor: string,
    secondaryColor: string
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
    ctx.fillStyle = 'rgba(15, 23, 42, 0.14)';
    ctx.fillRect(4, 20, 56, 5);

    ctx.fillStyle = '#475569';
    ctx.fillRect(6, 8, 6, 18);
    ctx.fillRect(52, 8, 6, 18);

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

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 4, 36, 24);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(6, 4, 36, 2);
    ctx.fillRect(6, 26, 36, 2);
    ctx.fillRect(6, 4, 2, 24);
    ctx.fillRect(40, 4, 2, 24);

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(17, 12, 14, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(19, 14, 10, 6);

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

      ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
      ctx.fillRect(ox + 8, 27, 16, 3);

      ctx.fillStyle = palette.pants;
      ctx.fillRect(ox + 10, 21 + leftLegOffset, 5, 7);
      ctx.fillRect(ox + 17, 21 + rightLegOffset, 5, 7);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ox + 10, 27 + leftLegOffset, 5, 2);
      ctx.fillRect(ox + 17, 27 + rightLegOffset, 5, 2);

      ctx.fillStyle = palette.jacket;
      ctx.fillRect(ox + 8, 12 + bobY, 16, 10);

      ctx.fillStyle = palette.accent;
      ctx.fillRect(ox + 9, 13 + bobY, 14, 2);
      ctx.fillRect(ox + 15, 13 + bobY, 2, 8);

      ctx.fillStyle = palette.jacket;
      ctx.fillRect(ox + 5, 13 + bobY + leftArmOffset, 3, 8);
      ctx.fillRect(ox + 24, 13 + bobY + rightArmOffset, 3, 8);

      ctx.fillStyle = palette.skin;
      ctx.fillRect(ox + 5, 20 + bobY + leftArmOffset, 3, 2);
      ctx.fillRect(ox + 24, 20 + bobY + rightArmOffset, 3, 2);

      ctx.fillStyle = palette.skin;
      ctx.fillRect(ox + 9, 4 + bobY, 14, 9);

      ctx.fillStyle = palette.hair;
      ctx.fillRect(ox + 8, 2 + bobY, 16, 4);
      ctx.fillRect(ox + 8, 4 + bobY, 2, 5);
      ctx.fillRect(ox + 22, 4 + bobY, 2, 5);

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
      'avatar_tutor_adult',
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
          frames: [{ key, frame: 0 }],
          frameRate: 1,
          repeat: -1,
        });
      }
    }
  }
}
