import React, { useState } from 'react';
import {
  Building2,
  Compass,
  Keyboard,
  Radio,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { useGameStore } from '../../state/useGameStore';

export const TopBarHud: React.FC = () => {
  const currentZone = useGameStore((s) => s.currentZone);
  const requestZoneTransition = useGameStore((s) => s.requestZoneTransition);
  const [isOpen, setIsOpen] = useState(false);

  const isCourtyard = currentZone === 'baggio:global';

  return (
    <div className="pointer-events-auto relative flex flex-col items-start gap-1.5">
      {/* Barre compacte par défaut (non intrusive) */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          className="flex h-9 items-center gap-2 rounded-full border border-cyan-400/50 bg-slate-900/85 px-3.5 text-xs font-bold text-white shadow-lg backdrop-blur-md transition hover:border-cyan-300 hover:bg-slate-800/90 cursor-pointer"
        >
          <Building2 className="h-4 w-4 text-[#00f3ff]" />
          <span className="font-['Orbitron'] tracking-wide">
            {isCourtyard ? 'Cour Baggio' : 'Couloir T-STI2D-3'}
          </span>
          <span className="rounded-full bg-cyan-500/20 px-1.5 py-0.5 font-['JetBrains_Mono'] text-[10px] text-cyan-300">
            {isCourtyard ? 'Zone 1' : 'Zone 2'}
          </span>
          {isOpen ? (
            <ChevronUp className="h-3.5 w-3.5 text-slate-300" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-slate-300" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            requestZoneTransition(isCourtyard ? 'baggio:tsti2d3' : 'baggio:global');
            setIsOpen(false);
          }}
          title="Basculer rapidement entre la Cour et le Couloir T-STI2D-3"
          className="flex h-9 items-center gap-1.5 rounded-full border border-sky-500/70 bg-slate-900/90 px-3 font-['JetBrains_Mono'] text-[11px] font-bold text-sky-300 shadow-lg backdrop-blur-md transition hover:bg-slate-800 cursor-pointer"
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
          <span>{isCourtyard ? 'Couloir T-STI2D-3' : 'Cour Baggio'}</span>
        </button>
      </div>

      {/* Menu détaillé affiché uniquement lorsqu'on l'active */}
      {isOpen && (
        <div className="w-80 rounded-xl border border-cyan-400/45 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Orbitron'] text-xs font-extrabold text-white">
                  ODYLYCÉE // CÉSAR BAGGIO
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/15 px-2 py-0.5 font-['JetBrains_Mono'] text-[9px] font-semibold text-fuchsia-300">
                  <Radio className="h-2.5 w-2.5 animate-pulse" />
                  {currentZone}
                </span>
              </div>
              <p className="mt-1 font-['Space_Grotesk'] text-xs text-slate-300">
                {isCourtyard
                  ? 'Zone 1 : La Cour du Lycée César Baggio (Lille)'
                  : 'Zone 2 : Couloir d’Étage Terminale STI2D-3'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer le menu zone"
              className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-2.5 space-y-2 font-['JetBrains_Mono'] text-[11px] text-slate-300">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-slate-400">
                <Keyboard className="h-3.5 w-3.5 text-cyan-400" /> Déplacement :
              </span>
              <kbd className="rounded border border-slate-700 bg-slate-950 px-1.5 py-0.5 text-[10px] text-cyan-300">
                ZQSD / Flèches
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-slate-400">
                <Compass className="h-3.5 w-3.5 text-fuchsia-400" /> Interaction :
              </span>
              <kbd className="rounded border border-fuchsia-500/40 bg-fuchsia-950/60 px-1.5 py-0.5 text-[10px] text-fuchsia-300">
                Touche [E]
              </kbd>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
