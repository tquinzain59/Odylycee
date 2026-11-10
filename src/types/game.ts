export type PersonaId = 'eliott' | 'camille' | 'martin';

export type UserRole = 'STUDENT' | 'TEACHER';

export type Sti2dSpecialty = 'SIN' | 'EE' | 'ITEC' | 'AC';

export type ZoneId = 'baggio:global' | 'baggio:tsti2d3';

export interface Persona {
  id: PersonaId;
  name: string;
  role: UserRole;
  school: string;
  className: string;
  assignedClasses: string[];
  specialty?: Sti2dSpecialty;
  specialtyLabel: string;
  avatarKey: string;
  accentColor: string;
  accentHex: number;
  badgeText: string;
  bio: string;
}

export type DoorCategory = 'TRONC_COMMUN' | 'SPECIALITE';

export interface CourseResource {
  id: string;
  title: string;
  type: 'TP_SIMULATION' | 'COURS_PDF' | 'QUIZ_FLASH' | 'SCHEMA_TECH';
  duration: string;
  status: 'DISPONIBLE' | 'EN_COURS' | 'TERMINE';
  description: string;
}

export interface ClassroomDoorConfig {
  id: string;
  title: string;
  shortCode: string;
  category: DoorCategory;
  requiredSpecialty?: Sti2dSpecialty;
  classGroup: string;
  x: number;
  y: number;
  roomNumber: string;
  teacherName: string;
  schedule: string;
  description: string;
  activeTpTitle: string;
  connectedStudentsCount: number;
  baseNeonColor: string;
  baseNeonHex: number;
  resources: CourseResource[];
}

export interface DoorAccessResult {
  unlocked: boolean;
  reason: string;
  neonColor: string;
  neonHex: number;
  promptText: string;
  badgeLabel: string;
}

export interface InteractablePayload {
  id: string;
  type: 'DOOR' | 'PORTAL' | 'VENDING' | 'NPC' | 'TERMINAL';
  title: string;
  subtitle: string;
  isLocked: boolean;
  lockReason?: string;
  actionLabel: string;
  accentColor: string;
  targetZone?: ZoneId;
  doorConfig?: ClassroomDoorConfig;
  npcData?: {
    speaker: string;
    role: string;
    specialty?: string;
    lines: string[];
    statusTag: string;
  };
  vendingItems?: {
    id: string;
    name: string;
    effect: string;
    credits: string;
    color: string;
  }[];
}
