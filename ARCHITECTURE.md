# Architecture Technique — OdyLycée (Lycée César Baggio — Lille)

**OdyLycée** est un Serious Game Web Multijoueur 2D Top-Down 3/4 à l'esthétique **Cyberpunk Pixel-Art + Néons WebGL** (inspiré visuellement de *Soulbound*), conçu initialement pour le **Lycée César Baggio (Lille)** et la classe de **Terminale STI2D-3**.

---

## 1. Vue d'Ensemble & Stack Technique (Lot 1 -> Cible Monorepo)

L'architecture est structurée pour séparer strictement le **moteur de simulation graphique 2D (Phaser 3 WebGL)**, l'**interface utilisateur réactive en surimpression (React + Tailwind CSS)** et l'**état métier partagé (Zustand)**, tout en préparant l'intégration transparente du serveur temps réel **Socket.io** aux lots suivants.

```
SeriousGame_OdyLycée/
├── ARCHITECTURE.md                 # Spécification d'architecture & feuille de route technique
├── package.json                    # Dépendances Frontend (React, Phaser 3, Zustand, Tailwind)
├── vite.config.ts                  # Bundler Vite
└── src/
    ├── types/
    │   └── game.ts                 # Modèles de données (Personas, Spécialités STI2D, Portes, Zones, Rooms)
    ├── state/
    │   └── useGameStore.ts         # Pont réactif Zustand (React <-> Phaser 3 + futur middleware Socket.io)
    ├── data/
    │   └── mockBaggioData.ts       # Données métier Lycée César Baggio (Personas, Cours T-STI2D-3, Ressources)
    ├── game/
    │   ├── PhaserGame.ts           # Configuration Phaser 3 (WebGL forcé, pixelArt: true, Physique Arcade)
    │   ├── assets/
    │   │   └── ProceduralPixelAssets.ts # Génération procédurale Canvas Pixel-Art + Normal Maps WebGL
    │   ├── entities/
    │   │   ├── PlayerController.ts # Déplacement ZQSD/Flèches, aura PointLight dynamique, animations 32x32
    │   │   └── NpcActor.ts         # PNJ élèves animés (Cour Baggio) + bulles holographiques
    │   ├── scenes/
    │   │   ├── BootScene.ts        # Initialisation des textures procédurales & animations
    │   │   ├── CourtyardScene.ts   # Zone 1 : Cour du Lycée Baggio (Room cible : `baggio:global`)
    │   │   └── CorridorScene.ts    # Zone 2 : Couloir T-STI2D-3 (Room cible : `baggio:tsti2d3`)
    │   └── systems/
    │       └── AccessControl.ts    # Moteur de règles d'accès (Tronc commun vs Spécialités SIN/EE/ITEC vs Prof)
    └── components/
        ├── hud/
        │   ├── TopBarHud.tsx       # Infos joueur, zone/room active, contrôles, raccourcis rapides
        │   ├── PersonaSwitcher.tsx # Sélecteur temps réel Eliott (SIN) / Camille (EE) / M. Martin (Prof)
        │   └── ProximityPrompt.tsx # Indicateur contextuel `[E] Interagir` / statut de verrouillage
        ├── panels/
        │   ├── CyberSidePanel.tsx  # Panneau latéral Glassmorphism Cyberpunk (Cours, TP, Portail de zone)
        │   └── TeacherDashboardModal.tsx # Modal `<dialog>` native pour le Dashboard Professeur (M. Martin)
        └── GameViewport.tsx        # Conteneur Canvas WebGL + couche HUD React
```

---

## 2. Pipeline Graphique WebGL "Soulbound" (Phaser 3)

Le rendu visuel combine du Pixel-Art net (`pixelArt: true`, `roundPixels: true`) avec le pipeline d'éclairage différé 2D et les effets de post-traitement WebGL de Phaser 3 :

1. **Textures Procédurales & Normal Maps (`ProceduralPixelAssets.ts`)** :
   - Génération au démarrage de spritesheets 32x32 et tuiles architecturales (pavés tech sombres, murs métalliques rivetés, portes vitrées cyber, distributeurs *Foyer Tech*, cadenas holographiques) accompagnées de **Normal Maps** associées pour accentuer les reliefs sous l'éclairage dynamique.
2. **Pipeline `Light2D` (`this.lights.enable()`)** :
   - Lumière ambiante nocturne profonde bleutée/violacée (`0x1a1635`).
   - Toutes les surfaces du sol, des murs, des portes et des personnages activent `.setPipeline('Light2D')`.
3. **Sources Lumineuses Hybrides (`Light` + `PointLight`)** :
   - `this.lights.addLight(...)` projette un éclairage diffus/spéculaire réel sur les tuiles et avatars.
   - `this.add.pointlight(...)` génère des halos volumétriques additifs **Cyan (`#00f3ff`)**, **Magenta (`#ff007f`)**, **Ambre (`#ffaa00`)** et **Rouge Sécurité (`#ff2a55`)** autour des enseignes de classes, des distributeurs et sous les pieds du joueur.
4. **Caméra & PostFX Bloom** :
   - `cameras.main.postFX.addBloom(0xffffff, 1, 1, 1.15, 1.25, 4)` fait rayonner les néons, les marquages au sol du terrain de basket et les enseignes lumineuses.
   - Suivi caméra fluide via `cameras.main.startFollow(player, true, 0.09, 0.09)`.

---

## 3. Pont d'État Partagé React <-> Phaser (Zustand)

Le store Zustand (`useGameStore`) agit comme **Single Source of Truth** bidirectionnel :

- **De React vers Phaser** :
  - Lorsque l'utilisateur change de Persona (`Eliott [SIN]` <-> `Camille [EE]` <-> `M. Martin [Prof]`) dans `PersonaSwitcher.tsx`, le store met à jour `currentPersona`.
  - Les scènes Phaser abonnées via `useGameStore.subscribe()` réagissent **immédiatement à la frame suivante** sans recharger la scène : changement de la texture d'avatar du joueur, recalcul des droits d'accès de chaque porte du couloir `T-STI2D-3`, bascule instantanée des couleurs de néons (`#00f3ff` déverrouillé vs `#ff2a55` verrouillé) et affichage/masquage des cadenas holographiques.
- **De Phaser vers React** :
  - Détection de proximité avec les portes, distributeurs, PNJ ou portails -> mise à jour de `nearbyInteractable`.
  - Pression de la touche `[E]` -> ouverture de `CyberSidePanel.tsx` avec le contexte exact du cours (ressources pédagogiques, TP STI2D, statut d'accès ou téléportation Cour <-> Couloir).

---

## 4. Matrice des Règles Métier (Lot 1 — Couloir `T-STI2D-3`)

| Porte / Salle | Catégorie | Eliott (Élève `SIN`) | Camille (Élève `EE`) | M. Martin (Prof `T-STI2D-3` & `1`) |
| :--- | :--- | :---: | :---: | :---: |
| **MATHS-PHYSIQUE** | Tronc Commun | Déverrouillé (Cyan/Ambre) | Déverrouillé (Cyan/Ambre) | Déverrouillé (Accès Maître) |
| **PHILO / FRANÇAIS** | Tronc Commun | Déverrouillé (Cyan/Ambre) | Déverrouillé (Cyan/Ambre) | Déverrouillé (Accès Maître) |
| **INGÉNIERIE & DÉV. DURABLE (I2D)** | Tronc Commun STI2D | Déverrouillé (Cyan/Ambre) | Déverrouillé (Cyan/Ambre) | Déverrouillé (Accès Maître) |
| **LABO SIN** | Spécialité `SIN` | **DÉVERROUILLÉ (`#00f3ff`)** | Verrouillé (`#ff2a55` + Cadenas) | **DÉVERROUILLÉ (Prof)** |
| **LABO EE** | Spécialité `EE` | Verrouillé (`#ff2a55` + Cadenas) | **DÉVERROUILLÉ (`#00f3ff`)** | **DÉVERROUILLÉ (Prof)** |
| **LABO ITEC** | Spécialité `ITEC` | Verrouillé (`#ff2a55` + Cadenas) | Verrouillé (`#ff2a55` + Cadenas) | **DÉVERROUILLÉ (Prof)** |

---

## 5. Architecture Évolutive pour les Lots Suivants (Lots 2 à 4)

### 5.1. Multijoueur Temps Réel Socket.io & Cloisonnement par Rooms (Lot 2)
Chaque scène Phaser correspond déjà dans `useGameStore` à un identifiant de **Room réseau normalisé** :
- **`baggio:global`** (*La Cour du Lycée Baggio*) :
  - Room publique de l'établissement où tous les élèves et professeurs connectés du Lycée César Baggio se croisent.
  - Synchronisation des positions par interpolation (`player:moved` à 15 Hz, buffer d'interpolation côté client).
- **`baggio:tsti2d3`** (*Couloir d'Étage Terminale STI2D-3*) :
  - Room restreinte vérifiée côté serveur par un middleware JWT/Session : seuls les élèves inscrits en `T-STI2D-3` et les professeurs affectés à cette classe (`M. Martin`) peuvent rejoindre la room Socket.io `baggio:tsti2d3`.
- **Sub-Rooms de Salles & Laboratoires (`baggio:tsti2d3:sin`, `baggio:tsti2d3:ee`, `baggio:tsti2d3:i2d`)** :
  - Lorsqu'un élève entre dans une salle déverrouillée, le client émet `room:join` vers la sous-room correspondante. Le serveur valide `AccessControl.canAccessDoor(user, door)` avant d'autoriser la souscription.

### 5.2. Chat de Proximité Spatialisé (Lot 2)
- **Canal de Proximité (`chat:proximity`)** :
  - Chaque message envoyé est rattaché aux coordonnées `(x, y)` de l'émetteur dans sa room active (`baggio:global` ou `baggio:tsti2d3`).
  - Seuls les joueurs situés dans un rayon `PROXIMITY_RADIUS = 180px` reçoivent le message en clair (avec affichage d'une bulle néon temporaire au-dessus du sprite 32x32 de l'émetteur et atténuation d'opacité selon la distance).
  - En salle de TP, bascule automatique sur des **îlots collaboratifs de groupe** (3-4 élèves).

### 5.3. PNJ Directeur, Annonces & Quêtes Pédagogiques (Lot 3)
- **PNJ Directeur (Cour de Baggio & Bureau de Direction)** :
  - Entité pilotée par un graphe de dialogues (`DialogueNode`) + annonces globales diffusées sur l'événement Socket.io `school:broadcast` (affiché sur le panneau lumineux géant `"LYCÉE CÉSAR BAGGIO"` de la cour et dans le HUD).
  - Attribution des quêtes d'intégration STI2D (ex: *"Rejoindre le Labo de votre spécialité et valider le diagnostic système du TP #1"*).

### 5.4. LMS Intégré & Dashboard Enseignant Temps Réel (Lot 4)
- Le `TeacherDashboardModal` (initié au Lot 1 pour `M. Martin`) se connectera aux événements `lms:student_progress` et `room:presence` :
  - Vue radar en direct de la présence des élèves dans `baggio:global` vs `baggio:tsti2d3` vs Labos.
  - Verrouillage/déverrouillage dynamique d'une salle de cours ou lancement d'un quiz synchrone en un clic par l'enseignant.
