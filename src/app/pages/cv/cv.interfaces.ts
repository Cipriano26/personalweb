// src/app/cv/cv.interfaces.ts
// Interfaces RAW (tal como vienen del JSON) + Normalizadas para el componente.

export type Status = 'active' | 'inactive';

export interface RawAbility {
  id: number;
  id_user: number;
  id_skill: number;
  ability: string;
  description: string;
  status: Status;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface RawSkill {
  id: number;
  id_user: number;
  skill: string;      // e.g. "Framework", "Lenguaje", "DevOps"
  type: string | null; // e.g. "Angular", "PHP" (a veces null)
  attribute: string | null; // e.g. "Frameworks", "Lenguajes" (a veces null)
  level: string | null;
  experience: string | null;
  description: string; // ej: "icon: box"
  status: Status;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface RawStudy {
  id: number;
  id_user: number;
  study: string;
  place: string;
  start_date: string;
  end_date: string | null;
  description: string;
  study_status: 'finished' | 'progress' | string;
  status: Status;
}

export interface RawWork {
  id: number;
  id_user: number;
  job: string;
  company: string;
  category: string;
  place: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  job_status: 'current' | 'past' | string;
  status: Status;
}

export interface RawTask {
  id: number;
  id_user: number;
  id_job: number;
  task: string;
  description: string;
  status: Status;
}

export interface RawCvFile {
  cvAbilities: RawAbility[];
  cvSkills: RawSkill[];
  cvStudies: RawStudy[];
  cvTasks: RawTask[];
  cvWorks: RawWork[];
  // users[] existe en el JSON, pero no lo usamos en el front
}

// --------- Normalizadas para el template ---------

export interface Skill {
  id: number;
  attribute: string;   // "Frameworks", "Lenguajes", etc.
  type: string;        // "Angular", "PHP", etc.
  skill: string;       // categoría "Framework", "Lenguaje", etc.
  description: string; // ej: "icon: box"
  status: Status;
}

export interface AbilityGroupItem {
  id: number;
  id_skill: number;
  ability: string;     // nombre del bloque (p.ej. "Stored Procedures y Triggers")
  description: string; // texto que mostramos en el <li>
  status: Status;
}

export interface AbilityBySkill {
  skillId: number;
  skillName: string;             // viene de skill.skill (ej: "Lenguaje", "Framework")
  groups: {                      // abilityName -> items
    abilityName: string;
    items: AbilityGroupItem[];
  }[];
}

export interface Study {
  id: number;
  place: string;
  study: string;
  start_date: string;
  description: string;
}

export interface Work {
  id: number;
  company: string;
  category: string;
  start_date: string;
  end_date: string | null;
  job_status: string;
}

export interface Task {
  id: number;
  id_job: number;
  task: string;
  description: string; // HTML permitido
}

export interface CvData {
  studies: Study[];
  works: Work[];
  tasks: Task[];
  skills: Skill[];
  abilitiesBySkill: AbilityBySkill[]; // ya viene agrupado
}
