import { ClassroomDoorConfig, DoorAccessResult, Persona } from '../../types/game';

/**
 * Moteur de règles métier d'accès aux salles de cours OdyLycée (Lycée César Baggio).
 * Évalue en temps réel les permissions selon le rôle (STUDENT / TEACHER),
 * la classe rattachée (T-STI2D-3) et la spécialité STI2D (SIN / EE / ITEC).
 */
export function evaluateDoorAccess(persona: Persona, door: ClassroomDoorConfig): DoorAccessResult {
  // 1. Règle Enseignant : M. Martin a accès à toutes les portes de ses classes affectées (dont T-STI2D-3)
  if (persona.role === 'TEACHER') {
    const isAssignedClass = persona.assignedClasses.includes(door.classGroup);
    if (isAssignedClass) {
      return {
        unlocked: true,
        reason: `Accès Enseignant autorisé (${persona.name} — ${door.classGroup})`,
        neonColor: door.category === 'SPECIALITE' ? '#00f3ff' : door.baseNeonColor,
        neonHex: door.category === 'SPECIALITE' ? 0x00f3ff : door.baseNeonHex,
        promptText: `[E] Entrer (${door.shortCode} • Mode Prof)`,
        badgeLabel: 'ACCÈS PROF MAÎTRE',
      };
    }

    return {
      unlocked: false,
      reason: `Classe ${door.classGroup} hors affectation enseignant`,
      neonColor: '#ff2a55',
      neonHex: 0xff2a55,
      promptText: `[VERROUILLÉ] Hors affectation`,
      badgeLabel: 'VERROUILLÉ',
    };
  }

  // 2. Règle Élève : Vérification de l'appartenance à la classe du couloir
  if (!persona.assignedClasses.includes(door.classGroup)) {
    return {
      unlocked: false,
      reason: `Accès réservé aux élèves de la classe ${door.classGroup}`,
      neonColor: '#ff2a55',
      neonHex: 0xff2a55,
      promptText: `[VERROUILLÉ] Réservé ${door.classGroup}`,
      badgeLabel: 'VERROUILLÉ',
    };
  }

  // 3. Portes du Tronc Commun : ouvertes à toute la Terminale STI2D-3
  if (door.category === 'TRONC_COMMUN') {
    return {
      unlocked: true,
      reason: `Tronc commun ouvert à toute la ${persona.className}`,
      neonColor: door.baseNeonColor,
      neonHex: door.baseNeonHex,
      promptText: `[E] Entrer`,
      badgeLabel: 'TRONC COMMUN • OUVERT',
    };
  }

  // 4. Portes de Spécialités STI2D (SIN, EE, ITEC) : filtrage dynamique strict
  if (door.category === 'SPECIALITE' && door.requiredSpecialty) {
    if (persona.specialty === door.requiredSpecialty) {
      return {
        unlocked: true,
        reason: `Spécialité ${door.requiredSpecialty} validée pour ${persona.name}`,
        neonColor: '#00f3ff',
        neonHex: 0x00f3ff,
        promptText: `[E] Entrer`,
        badgeLabel: `SPÉCIALITÉ ${door.requiredSpecialty} • AUTORISÉ`,
      };
    }

    return {
      unlocked: false,
      reason: `Accès réservé aux élèves de la spécialité ${door.requiredSpecialty}`,
      neonColor: '#ff2a55',
      neonHex: 0xff2a55,
      promptText: `[E] Verrouillé (Spé. ${door.requiredSpecialty})`,
      badgeLabel: `RÉSERVÉ SPÉ. ${door.requiredSpecialty}`,
    };
  }

  return {
    unlocked: false,
    reason: 'Accès restreint',
    neonColor: '#ff2a55',
    neonHex: 0xff2a55,
    promptText: '[VERROUILLÉ]',
    badgeLabel: 'VERROUILLÉ',
  };
}
