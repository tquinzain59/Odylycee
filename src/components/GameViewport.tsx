import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createOdyLyceeGame } from '../game/PhaserGame';
import { useGameStore } from '../state/useGameStore';
import { TopBarHud } from './hud/TopBarHud';
import { PersonaSwitcher } from './hud/PersonaSwitcher';
import { ProximityPrompt } from './hud/ProximityPrompt';
import { CyberSidePanel } from './panels/CyberSidePanel';
import { TeacherDashboardModal } from './panels/TeacherDashboardModal';

declare global {
  interface Window {
    __ODYLYCEE__?: {
      game: Phaser.Game;
      useGameStore: typeof useGameStore;
    };
  }
}

export const GameViewport: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const game = createOdyLyceeGame(containerRef.current);
    gameRef.current = game;
    window.__ODYLYCEE__ = { game, useGameStore };

    return () => {
      delete window.__ODYLYCEE__;
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#dfd9ce]">
      {/* Conteneur du Canvas WebGL Phaser 3 */}
      <div
        ref={containerRef}
        id="phaser-canvas-container"
        className="absolute inset-0 h-full w-full"
      />

      {/* Surimpression HUD Glassmorphism Cyberpunk */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <TopBarHud />
          <PersonaSwitcher />
        </div>
      </div>

      {/* Panneau latéral contextuel ([E] sur une porte, un portail, un distributeur ou un PNJ) */}
      <CyberSidePanel />

      {/* Indicateur de proximité [E] en bas de l'écran */}
      <ProximityPrompt />

      {/* Modal Dashboard Professeur (M. Martin) */}
      <TeacherDashboardModal />
    </div>
  );
};
