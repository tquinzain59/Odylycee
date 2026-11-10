import React, { useState } from 'react';
import {
  Sparkles,
  UserCheck,
  LayoutDashboard,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { BAGGIO_PERSONAS } from '../../data/mockBaggioData';
import { useGameStore } from '../../state/useGameStore';
import { PersonaId } from '../../types/game';

const PERSONA_ORDER: PersonaId[] = ['eliott', 'camille', 'martin'];

export const PersonaSwitcher: React.FC = () => {
  const currentPersonaId = useGameStore((s) => s.currentPersonaId);
  const currentPersona = useGameStore((s) => s.currentPersona);
  const setPersona = useGameStore((s) => s.setPersona);
  const setTeacherDashboardOpen = useGameStore((s) => s.setTeacherDashboardOpen);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside
      aria-label="Sélecteur de Persona de Test"
      className="pointer-events-auto relative flex flex-col items-end gap-1.5"
    >
      {/* Bouton compact par défaut (n'encombre pas l'écran) */}
      <div className="flex items-center gap-1.5">
        {currentPersona.role === 'TEACHER' && (
          <button
            type="button"
            onClick={() => setTeacherDashboardOpen(true)}
            className="flex h-9 items-center gap-1.5 rounded-full border border-amber-400/80 bg-slate-900/90 px-3.5 font-['Orbitron'] text-[11px] font-bold text-amber-300 shadow-lg backdrop-blur-md transition hover:bg-slate-800 cursor-pointer"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Dashboard Prof</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          className="flex h-9 items-center gap-2 rounded-full border bg-slate-900/85 px-3.5 text-xs font-bold text-white shadow-lg backdrop-blur-md transition hover:bg-slate-800/90 cursor-pointer"
          style={{
            borderColor: currentPersona.accentColor,
            boxShadow: `0 0 14px ${currentPersona.accentColor}30`,
          }}
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor: currentPersona.accentColor,
              boxShadow: `0 0 8px ${currentPersona.accentColor}`,
            }}
          />
          <span className="font-['Orbitron']" style={{ color: currentPersona.accentColor }}>
            {currentPersona.name}
          </span>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 font-['JetBrains_Mono'] text-[10px] text-slate-200">
            {currentPersona.role === 'TEACHER'
              ? 'Prof • T-STI2D-3'
              : `Spé ${currentPersona.specialty}`}
          </span>
          {isOpen ? (
            <ChevronUp className="h-3.5 w-3.5 text-slate-300" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-slate-300" />
          )}
        </button>
      </div>

      {/* Panneau de sélection de Persona (affiché uniquement lorsqu'on clique pour l'ouvrir) */}
      {isOpen && (
        <div className="w-84 rounded-xl border border-cyan-400/45 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-xl">
          <div className="mb-2.5 flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#00f3ff]" />
              <span className="font-['Orbitron'] text-[11px] font-bold tracking-wider text-slate-100 uppercase">
                Changer de Persona (Baggio)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer le sélecteur de Persona"
              className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Profils disponibles">
            {PERSONA_ORDER.map((id) => {
              const p = BAGGIO_PERSONAS[id];
              const active = currentPersonaId === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setPersona(id);
                  }}
                  aria-pressed={active}
                  className={`flex flex-col items-start rounded-lg border px-2.5 py-2 text-left transition cursor-pointer ${
                    active
                      ? 'bg-slate-800/95'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-800/60'
                  }`}
                  style={{
                    borderColor: active ? p.accentColor : undefined,
                    boxShadow: active ? `0 0 14px ${p.accentColor}35` : undefined,
                  }}
                >
                  <div className="flex w-full items-center justify-between">
                    <span
                      className="font-['Orbitron'] text-xs font-bold"
                      style={{ color: active ? p.accentColor : '#e2e8f0' }}
                    >
                      {p.name}
                    </span>
                    {active && (
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: p.accentColor }}
                      />
                    )}
                  </div>
                  <span className="mt-0.5 font-['JetBrains_Mono'] text-[10px] text-slate-300">
                    {p.role === 'TEACHER' ? 'Prof. Ingé.' : `Spé ${p.specialty}`}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 rounded-lg border border-slate-800 bg-slate-950/75 p-2.5">
            <div className="flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5" style={{ color: currentPersona.accentColor }} />
              <span
                className="font-['JetBrains_Mono'] text-[11px] font-bold"
                style={{ color: currentPersona.accentColor }}
              >
                {currentPersona.badgeText}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-300">{currentPersona.specialtyLabel}</p>

            <div className="mt-2 flex flex-wrap items-center gap-1 border-t border-slate-800 pt-2 font-['JetBrains_Mono'] text-[10px]">
              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300 border border-emerald-500/30">
                <Unlock className="h-2.5 w-2.5" /> Tronc Commun
              </span>
              {(['SIN', 'EE', 'ITEC'] as const).map((spe) => {
                const allowed =
                  currentPersona.role === 'TEACHER' || currentPersona.specialty === spe;
                return (
                  <span
                    key={spe}
                    className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 border ${
                      allowed
                        ? 'border-cyan-400/50 bg-cyan-500/15 text-[#00f3ff]'
                        : 'border-rose-500/40 bg-rose-950/50 text-rose-400'
                    }`}
                  >
                    {allowed ? (
                      <Unlock className="h-2.5 w-2.5" />
                    ) : (
                      <Lock className="h-2.5 w-2.5" />
                    )}
                    Labo {spe}
                  </span>
                );
              })}
            </div>

            {currentPersona.role === 'TEACHER' && (
              <button
                type="button"
                onClick={() => {
                  setTeacherDashboardOpen(true);
                  setIsOpen(false);
                }}
                className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-lg border border-amber-400/60 bg-amber-500/20 px-3 py-1.5 font-['Orbitron'] text-xs font-bold text-amber-300 transition hover:bg-amber-500/35 cursor-pointer"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Ouvrir Dashboard Prof (T-STI2D-3 & 1)
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
