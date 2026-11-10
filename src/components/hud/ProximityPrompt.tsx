import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { useGameStore } from '../../state/useGameStore';

export const ProximityPrompt: React.FC = () => {
  const nearby = useGameStore((s) => s.nearbyInteractable);
  const activeSidePanel = useGameStore((s) => s.activeSidePanel);
  const openSidePanel = useGameStore((s) => s.openSidePanel);
  const notification = useGameStore((s) => s.notification);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 flex flex-col items-center gap-2 px-4">
      {/* Notification Toast compacte */}
      {notification && (
        <div
          key={notification.id}
          className="pointer-events-auto flex items-center gap-2.5 rounded-full border bg-slate-900/95 px-3.5 py-1.5 shadow-lg backdrop-blur-md"
          style={{
            borderColor: notification.color,
          }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: notification.color }}
          />
          <span
            className="font-['Orbitron'] text-[11px] font-bold"
            style={{ color: notification.color }}
          >
            {notification.title}
          </span>
          <span className="font-['JetBrains_Mono'] text-[10px] text-slate-300">
            {notification.subtitle}
          </span>
        </div>
      )}

      {/* Pilule d'interaction [E] compacte (masquée si le panneau latéral est déjà ouvert) */}
      {nearby && !activeSidePanel && (
        <button
          type="button"
          onClick={() => openSidePanel(nearby)}
          className={`pointer-events-auto flex items-center gap-2.5 rounded-full border px-4 py-2 shadow-xl backdrop-blur-md transition cursor-pointer ${
            nearby.isLocked
              ? 'border-rose-500/70 bg-rose-950/90 text-rose-200 hover:bg-rose-900/90'
              : 'border-cyan-400/70 bg-slate-900/90 text-white hover:bg-slate-800/95'
          }`}
        >
          {nearby.isLocked ? (
            <Lock className="h-4 w-4 text-rose-400" />
          ) : (
            <Unlock className="h-4 w-4 text-[#00f3ff]" />
          )}
          <span className="font-['Orbitron'] text-xs font-bold">{nearby.title}</span>
          {nearby.isLocked && (
            <span className="font-['JetBrains_Mono'] text-[11px] text-rose-300">
              — {nearby.lockReason}
            </span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 font-['JetBrains_Mono'] text-[11px] font-extrabold ${
              nearby.isLocked
                ? 'bg-rose-500/30 text-rose-200'
                : 'bg-cyan-500/25 text-[#00f3ff]'
            }`}
          >
            [E] {nearby.isLocked ? 'Voir accès' : 'Entrer'}
          </span>
        </button>
      )}
    </div>
  );
};
