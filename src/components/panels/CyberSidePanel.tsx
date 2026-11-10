import React, { useEffect } from 'react';
import {
  X,
  Lock,
  Unlock,
  BookOpen,
  Cpu,
  FileText,
  Zap,
  Users,
  Clock,
  ArrowRight,
  MessageSquare,
  Coffee,
  ShieldAlert,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { useGameStore } from '../../state/useGameStore';

export const CyberSidePanel: React.FC = () => {
  const panel = useGameStore((s) => s.activeSidePanel);
  const currentPersona = useGameStore((s) => s.currentPersona);
  const closeSidePanel = useGameStore((s) => s.closeSidePanel);
  const requestZoneTransition = useGameStore((s) => s.requestZoneTransition);
  const triggerNotification = useGameStore((s) => s.triggerNotification);

  useEffect(() => {
    if (!panel) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSidePanel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [panel, closeSidePanel]);

  if (!panel) return null;

  const door = panel.doorConfig;

  return (
    <section
      aria-label={`Panneau d'interaction : ${panel.title}`}
      className="pointer-events-auto fixed top-16 left-4 max-h-[calc(100vh-5.5rem)] z-30 flex w-88 flex-col overflow-hidden rounded-2xl border bg-slate-900/94 shadow-[0_0_40px_rgba(0,0,0,0.65)] backdrop-blur-xl transition-all"
      style={{
        borderColor: panel.isLocked ? '#ff2a55' : panel.accentColor,
        boxShadow: panel.isLocked
          ? '0 0 35px rgba(255, 42, 85, 0.25)'
          : `0 0 35px ${panel.accentColor}28`,
      }}
    >
      {/* En-tête du Panneau Latéral Cyberpunk */}
      <header
        className="flex items-start justify-between border-b px-4 py-3.5"
        style={{
          borderColor: panel.isLocked ? 'rgba(255,42,85,0.35)' : 'rgba(0,243,255,0.25)',
          background: panel.isLocked
            ? 'linear-gradient(135deg, rgba(255,42,85,0.18), rgba(15,10,25,0.9))'
            : 'linear-gradient(135deg, rgba(0,243,255,0.14), rgba(10,15,32,0.9))',
        }}
      >
        <div className="pr-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-['JetBrains_Mono'] text-[10px] font-bold uppercase ${
                panel.isLocked
                  ? 'border border-rose-500/50 bg-rose-500/20 text-rose-300'
                  : 'border border-cyan-400/50 bg-cyan-500/20 text-[#00f3ff]'
              }`}
            >
              {panel.isLocked ? (
                <>
                  <Lock className="h-3 w-3" /> ACCÈS VERROUILLÉ
                </>
              ) : (
                <>
                  <Unlock className="h-3 w-3" /> ACCÈS AUTORISÉ
                </>
              )}
            </span>
            {door && (
              <span className="font-['JetBrains_Mono'] text-[10px] text-slate-400">
                {door.roomNumber}
              </span>
            )}
          </div>

          <h2 className="mt-1.5 font-['Orbitron'] text-sm font-extrabold text-white">
            {panel.title}
          </h2>
          <p className="mt-0.5 font-['Space_Grotesk'] text-xs text-slate-300">
            {panel.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={closeSidePanel}
          aria-label="Fermer le panneau latéral"
          className="rounded-lg border border-slate-700/80 bg-slate-900/80 p-1.5 text-slate-300 transition hover:border-cyan-400 hover:text-white cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      {/* Corps déroulant */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* CAS 1 : PORTE DE COURS / LABORATOIRE STI2D */}
        {panel.type === 'DOOR' && door && (
          <>
            {panel.isLocked ? (
              <div className="space-y-3 rounded-xl border border-rose-500/50 bg-rose-950/30 p-4">
                <div className="flex items-center gap-2.5 text-rose-400">
                  <ShieldAlert className="h-6 w-6 shrink-0" />
                  <div>
                    <h3 className="font-['Orbitron'] text-xs font-bold uppercase">
                      Cadenas Holographique Actif
                    </h3>
                    <p className="font-['JetBrains_Mono'] text-xs font-semibold text-rose-200">
                      {panel.lockReason}
                    </p>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-300">
                  Vous êtes actuellement connecté en tant que{' '}
                  <strong className="text-white">{currentPersona.name}</strong> (
                  <span style={{ color: currentPersona.accentColor }}>
                    {currentPersona.specialtyLabel}
                  </span>
                  ). Le système de contrôle d’accès du <strong>Lycée César Baggio</strong> filtre
                  dynamiquement les laboratoires de spécialité STI2D.
                </p>

                <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3 font-['JetBrains_Mono'] text-[11px] text-slate-300">
                  💡 <strong>Astuce Test Lot 1 :</strong> Utilisez le sélecteur de Persona en haut à
                  droite pour basculer sur{' '}
                  {door.requiredSpecialty === 'EE'
                    ? 'Camille (EE) ou M. Martin (Prof)'
                    : 'M. Martin (Prof)'}{' '}
                  et observer cette porte se déverrouiller en temps réel !
                </div>
              </div>
            ) : (
              <>
                {/* Bandeau statut du cours & TP actif */}
                <div className="rounded-xl border border-cyan-500/30 bg-slate-900/75 p-3.5">
                  <div className="flex items-center justify-between text-[11px] font-['JetBrains_Mono'] text-slate-400">
                    <span className="inline-flex items-center gap-1 text-cyan-300">
                      <Users className="h-3.5 w-3.5" /> {door.connectedStudentsCount} élèves en salle
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-fuchsia-400" /> Session active
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-slate-300">{door.description}</p>

                  <div className="mt-3 rounded-lg border border-cyan-400/40 bg-cyan-950/35 p-2.5">
                    <span className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#00f3ff] uppercase">
                      ⚡ Séance / TP en cours :
                    </span>
                    <p className="mt-0.5 font-['Space_Grotesk'] text-xs font-bold text-white">
                      {door.activeTpTitle}
                    </p>
                  </div>
                </div>

                {/* Liste des ressources pédagogiques du cours */}
                <div className="space-y-2">
                  <h3 className="flex items-center gap-1.5 font-['Orbitron'] text-xs font-bold tracking-wider text-slate-200 uppercase">
                    <BookOpen className="h-3.5 w-3.5 text-[#00f3ff]" />
                    Ressources Pédagogiques ({door.resources.length})
                  </h3>

                  {door.resources.map((res) => (
                    <div
                      key={res.id}
                      className="group rounded-xl border border-slate-800/90 bg-slate-900/65 p-3 transition hover:border-cyan-400/60 hover:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {res.type === 'TP_SIMULATION' && (
                            <Cpu className="h-4 w-4 shrink-0 text-[#00f3ff]" />
                          )}
                          {res.type === 'COURS_PDF' && (
                            <FileText className="h-4 w-4 shrink-0 text-fuchsia-400" />
                          )}
                          {res.type === 'QUIZ_FLASH' && (
                            <Zap className="h-4 w-4 shrink-0 text-amber-400" />
                          )}
                          {res.type === 'SCHEMA_TECH' && (
                            <BookOpen className="h-4 w-4 shrink-0 text-emerald-400" />
                          )}
                          <span className="font-['Space_Grotesk'] text-xs font-bold text-white">
                            {res.title}
                          </span>
                        </div>
                        <span className="shrink-0 rounded bg-slate-800 px-1.5 py-0.5 font-['JetBrains_Mono'] text-[10px] text-slate-300">
                          {res.duration}
                        </span>
                      </div>

                      <p className="mt-1.5 text-[11px] leading-snug text-slate-400">
                        {res.description}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 font-['JetBrains_Mono'] text-[10px] text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> {res.status}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            triggerNotification(
                              `Module lancé : ${res.title}`,
                              `Salle ${door.roomNumber} (${currentPersona.name})`,
                              panel.accentColor
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-md border border-cyan-400/50 bg-cyan-500/15 px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] font-bold text-[#00f3ff] transition hover:bg-cyan-500/30 cursor-pointer"
                        >
                          <Play className="h-3 w-3" /> Lancer l’activité
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* CAS 2 : PORTAIL DE TRANSITION OU BORNE D'ORIENTATION */}
        {(panel.type === 'PORTAL' || panel.type === 'TERMINAL') && (
          <div className="space-y-3">
            <div className="rounded-xl border border-cyan-500/35 bg-slate-900/75 p-3.5 text-xs leading-relaxed text-slate-300">
              {panel.targetZone === 'baggio:tsti2d3' ? (
                <>
                  Ce portail connecte la <strong>Cour du Lycée César Baggio</strong> (Zone Globale{' '}
                  <code>baggio:global</code>) au <strong>Couloir d’Étage Terminale STI2D-3</strong>{' '}
                  (Room restreinte <code>baggio:tsti2d3</code>).
                </>
              ) : (
                <>
                  Vous êtes sur le point de quitter l’étage de la <strong>Terminale STI2D-3</strong>{' '}
                  pour redescendre dans la <strong>Cour du Lycée César Baggio</strong>.
                </>
              )}
            </div>

            {panel.targetZone && (
              <button
                type="button"
                onClick={() => requestZoneTransition(panel.targetZone!)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400 bg-cyan-500/25 px-4 py-3 font-['Orbitron'] text-xs font-bold text-[#00f3ff] shadow-[0_0_20px_rgba(0,243,255,0.3)] transition hover:bg-cyan-500/40 cursor-pointer"
              >
                <span>
                  {panel.targetZone === 'baggio:tsti2d3'
                    ? 'ENTRER DANS LE COULOIR T-STI2D-3'
                    : 'RETOURNER DANS LA COUR DE BAGGIO'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* CAS 3 : DISTRIBUTEURS "FOYER TECH" */}
        {panel.type === 'VENDING' && panel.vendingItems && (
          <div className="space-y-2.5">
            <p className="text-xs text-slate-300">
              Sélectionnez une boisson ou collation cybernétique au distributeur du Foyer Baggio :
            </p>
            {panel.vendingItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Coffee className="h-4 w-4" style={{ color: item.color }} />
                    <span className="font-['Orbitron'] text-xs font-bold text-white">
                      {item.name}
                    </span>
                  </div>
                  <p className="mt-1 font-['JetBrains_Mono'] text-[11px] text-slate-400">
                    {item.effect}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    triggerNotification(
                      `Distributeur Foyer Tech : ${item.name}`,
                      item.effect,
                      item.color
                    )
                  }
                  className="shrink-0 rounded-lg border border-fuchsia-400/50 bg-fuchsia-500/20 px-2.5 py-1.5 font-['JetBrains_Mono'] text-xs font-bold text-fuchsia-300 hover:bg-fuchsia-500/35 cursor-pointer"
                >
                  {item.credits}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* CAS 4 : DIALOGUE PNJ ÉLÈVE */}
        {panel.type === 'NPC' && panel.npcData && (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 font-['JetBrains_Mono'] text-[10px] text-cyan-300">
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> CANAL PROXIMITÉ ACTIF
              </span>
              <span>{panel.npcData.statusTag}</span>
            </div>

            <div className="space-y-2.5">
              {panel.npcData.lines.map((line, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800/90 bg-slate-900/70 p-3 text-xs leading-relaxed text-slate-200"
                >
                  « {line} »
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
