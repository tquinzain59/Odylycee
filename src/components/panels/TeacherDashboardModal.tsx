import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  LayoutDashboard,
  Users,
  CheckCircle2,
  ShieldCheck,
  Radio,
  Unlock,
  Send,
  Layers,
} from 'lucide-react';
import { CORRIDOR_DOORS_TSTI2D3, TEACHER_DASHBOARD_ROSTER } from '../../data/mockBaggioData';
import { useGameStore } from '../../state/useGameStore';

export const TeacherDashboardModal: React.FC = () => {
  const isOpen = useGameStore((s) => s.isTeacherDashboardOpen);
  const setTeacherDashboardOpen = useGameStore((s) => s.setTeacherDashboardOpen);
  const triggerNotification = useGameStore((s) => s.triggerNotification);
  const currentPersona = useGameStore((s) => s.currentPersona);

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [selectedClassFilter, setSelectedClassFilter] = useState<'ALL' | 'T-STI2D-3' | 'T-STI2D-1'>(
    'ALL'
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const filteredStudents = TEACHER_DASHBOARD_ROSTER.filter((s) =>
    selectedClassFilter === 'ALL' ? true : s.classGroup === selectedClassFilter
  );

  return (
    <dialog
      ref={dialogRef}
      id="teacher-dashboard-modal"
      aria-labelledby="teacher-dashboard-title"
      onClose={() => {
        if (dialogRef.current) {
          dialogRef.current.returnValue = '';
        }
        setTeacherDashboardOpen(false);
      }}
      className="m-auto w-[min(94vw,980px)] rounded-2xl border border-amber-400/60 bg-[#080b18]/96 p-0 text-slate-100 shadow-[0_0_60px_rgba(255,170,0,0.28)] backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      {/* En-tête du Dashboard Professeur */}
      <div className="flex items-center justify-between border-b border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-slate-900 to-cyan-500/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/60 bg-amber-500/20 text-amber-300">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2
                id="teacher-dashboard-title"
                className="font-['Orbitron'] text-base font-extrabold tracking-wide text-white"
              >
                DASHBOARD PROFESSEUR // LYCÉE CÉSAR BAGGIO
              </h2>
              <span className="rounded border border-amber-400/50 bg-amber-500/20 px-2 py-0.5 font-['JetBrains_Mono'] text-[10px] font-bold text-amber-300">
                {currentPersona.name}
              </span>
            </div>
            <p className="font-['JetBrains_Mono'] text-xs text-slate-300">
              Classes affectées : Baggio : T-STI2D-3 &amp; T-STI2D-1 • Accès Maître Laboratoires STI2D
            </p>
          </div>
        </div>

        <form method="dialog">
          <button
            type="submit"
            value="close"
            autoFocus
            aria-label="Fermer le Dashboard Professeur"
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-['JetBrains_Mono'] text-xs font-bold text-slate-200 transition hover:border-amber-400 hover:text-amber-300 cursor-pointer"
          >
            <X className="h-4 w-4" />
            <span>Fermer [Esc]</span>
          </button>
        </form>
      </div>

      {/* Corps en vue Split (Suivi Élèves Temps Réel + État des Salles du Couloir T-STI2D-3) */}
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-12">
        {/* Colonne Gauche (7 cols) : Télémétrie Élèves T-STI2D-3 & T-STI2D-1 */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-400" />
              <h3 className="font-['Orbitron'] text-xs font-bold tracking-wider text-slate-200 uppercase">
                Présence &amp; Progression Élèves ({filteredStudents.length})
              </h3>
            </div>

            <div className="flex gap-1.5 font-['JetBrains_Mono'] text-[11px]">
              {(['ALL', 'T-STI2D-3', 'T-STI2D-1'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSelectedClassFilter(filter)}
                  className={`rounded-md border px-2.5 py-1 transition cursor-pointer ${
                    selectedClassFilter === filter
                      ? 'border-amber-400 bg-amber-500/25 font-bold text-amber-300'
                      : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter === 'ALL' ? 'Toutes mes classes' : filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredStudents.map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between rounded-xl border border-slate-800/90 bg-slate-900/75 px-4 py-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        st.online ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-600'
                      }`}
                    />
                    <span className="font-['Orbitron'] text-xs font-bold text-white">
                      {st.name}
                    </span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 font-['JetBrains_Mono'] text-[10px] text-slate-300">
                      {st.classGroup}
                    </span>
                    <span className="rounded border border-cyan-500/40 bg-cyan-500/15 px-1.5 py-0.5 font-['JetBrains_Mono'] text-[10px] font-bold text-[#00f3ff]">
                      Spé {st.specialty}
                    </span>
                  </div>
                  <p className="font-['JetBrains_Mono'] text-[11px] text-slate-400">
                    📍 {st.currentRoom} — <span className="text-slate-200">{st.activeActivity}</span>
                  </p>
                </div>

                <div className="w-28 text-right">
                  <span className="font-['JetBrains_Mono'] text-xs font-bold text-amber-300">
                    {st.progressPercent}%
                  </span>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-amber-400"
                      style={{ width: `${st.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne Droite (5 cols) : Contrôle des Portes & Rooms Socket.io */}
        <div className="space-y-4 lg:col-span-5">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#00f3ff]" />
            <h3 className="font-['Orbitron'] text-xs font-bold tracking-wider text-slate-200 uppercase">
              Supervision Salles Couloir T-STI2D-3
            </h3>
          </div>

          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/80 p-3.5">
            {CORRIDOR_DOORS_TSTI2D3.map((door) => (
              <div
                key={door.id}
                className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/70 px-3 py-2"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-['Orbitron'] text-[11px] font-bold text-white">
                      {door.shortCode}
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[10px] text-slate-400">
                      ({door.roomNumber})
                    </span>
                  </div>
                  <span className="font-['JetBrains_Mono'] text-[10px] text-slate-400">
                    {door.category === 'TRONC_COMMUN'
                      ? 'Ouvert T-STI2D-3'
                      : `Filtré : Spécialité ${door.requiredSpecialty}`}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 rounded border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 font-['JetBrains_Mono'] text-[10px] font-bold text-emerald-300">
                  <Unlock className="h-3 w-3" /> Accès Prof
                </span>
              </div>
            ))}
          </div>

          {/* Action Rapide Enseignant : Annonce Globale Classe */}
          <div className="rounded-xl border border-amber-500/35 bg-amber-950/20 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-['Orbitron'] text-xs font-bold text-amber-300">
                <Radio className="h-3.5 w-3.5" /> Diffusion Room T-STI2D-3
              </span>
              <ShieldCheck className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-xs text-slate-300">
              Envoyer un signal de regroupement aux élèves de <strong>T-STI2D-3</strong> dans leurs
              laboratoires de spécialité respectifs (SIN / EE / ITEC).
            </p>
            <button
              type="button"
              onClick={() => {
                triggerNotification(
                  'Annonce M. Martin diffusée (baggio:tsti2d3)',
                  '« Début du TP #04 dans les Labos SIN, EE et ITEC ! »',
                  '#ffaa00'
                );
                setTeacherDashboardOpen(false);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-400 bg-amber-500/25 px-3 py-2 font-['JetBrains_Mono'] text-xs font-bold text-amber-200 transition hover:bg-amber-500/40 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              Envoyer l’annonce TP aux élèves
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 font-['JetBrains_Mono'] text-[11px] text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-[#00f3ff] shrink-0" />
            <span>Prêt pour branchement Socket.io (Lot 2 : rooms baggio:global &amp; baggio:tsti2d3)</span>
          </div>
        </div>
      </div>
    </dialog>
  );
};
