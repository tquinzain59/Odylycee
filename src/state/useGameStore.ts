import { create } from 'zustand';
import { BAGGIO_PERSONAS } from '../data/mockBaggioData';
import { evaluateDoorAccess } from '../game/systems/AccessControl';
import { InteractablePayload, Persona, PersonaId, ZoneId } from '../types/game';

interface GameNotification {
  id: number;
  title: string;
  subtitle: string;
  color: string;
}

interface GameStoreState {
  currentPersonaId: PersonaId;
  currentPersona: Persona;
  currentZone: ZoneId;
  pendingZoneTransition: ZoneId | null;
  nearbyInteractable: InteractablePayload | null;
  activeSidePanel: InteractablePayload | null;
  isTeacherDashboardOpen: boolean;
  notification: GameNotification | null;

  setPersona: (id: PersonaId) => void;
  setCurrentZone: (zone: ZoneId) => void;
  requestZoneTransition: (zone: ZoneId) => void;
  clearPendingZoneTransition: () => void;
  setNearbyInteractable: (payload: InteractablePayload | null) => void;
  openSidePanel: (payload: InteractablePayload) => void;
  closeSidePanel: () => void;
  setTeacherDashboardOpen: (open: boolean) => void;
  triggerNotification: (title: string, subtitle: string, color?: string) => void;
}

function refreshDoorPayloadForPersona(
  payload: InteractablePayload | null,
  persona: Persona
): InteractablePayload | null {
  if (!payload || payload.type !== 'DOOR' || !payload.doorConfig) {
    return payload;
  }
  const access = evaluateDoorAccess(persona, payload.doorConfig);
  return {
    ...payload,
    isLocked: !access.unlocked,
    lockReason: access.reason,
    actionLabel: access.promptText,
    accentColor: access.neonColor,
  };
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  currentPersonaId: 'eliott',
  currentPersona: BAGGIO_PERSONAS.eliott,
  currentZone: 'baggio:global',
  pendingZoneTransition: null,
  nearbyInteractable: null,
  activeSidePanel: null,
  isTeacherDashboardOpen: false,
  notification: null,

  setPersona: (id: PersonaId) => {
    const newPersona = BAGGIO_PERSONAS[id];
    const currentNearby = get().nearbyInteractable;
    const currentPanel = get().activeSidePanel;

    set({
      currentPersonaId: id,
      currentPersona: newPersona,
      nearbyInteractable: refreshDoorPayloadForPersona(currentNearby, newPersona),
      activeSidePanel: refreshDoorPayloadForPersona(currentPanel, newPersona),
      // Fermer le dashboard prof automatiquement si on bascule sur un profil élève
      isTeacherDashboardOpen: newPersona.role === 'TEACHER' ? get().isTeacherDashboardOpen : false,
      notification: {
        id: Date.now(),
        title: `Profil actif : ${newPersona.name}`,
        subtitle: `${newPersona.className} • ${newPersona.specialtyLabel}`,
        color: newPersona.accentColor,
      },
    });
  },

  setCurrentZone: (zone: ZoneId) => {
    set({
      currentZone: zone,
      nearbyInteractable: null,
    });
  },

  requestZoneTransition: (zone: ZoneId) => {
    set({
      pendingZoneTransition: zone,
      activeSidePanel: null,
      nearbyInteractable: null,
    });
  },

  clearPendingZoneTransition: () => {
    set({ pendingZoneTransition: null });
  },

  setNearbyInteractable: (payload: InteractablePayload | null) => {
    set({ nearbyInteractable: payload });
  },

  openSidePanel: (payload: InteractablePayload) => {
    set({ activeSidePanel: payload });
  },

  closeSidePanel: () => {
    set({ activeSidePanel: null });
  },

  setTeacherDashboardOpen: (open: boolean) => {
    set({ isTeacherDashboardOpen: open });
  },

  triggerNotification: (title: string, subtitle: string, color = '#00f3ff') => {
    set({
      notification: {
        id: Date.now(),
        title,
        subtitle,
        color,
      },
    });
  },
}));
