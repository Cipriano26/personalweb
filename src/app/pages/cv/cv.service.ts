// src/app/cv/cv.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  RawAbility, RawCvFile, RawSkill, RawStudy, RawTask, RawWork, Status,
  CvData, Skill, Study, Work, Task, AbilityBySkill, AbilityGroupItem
} from './cv.interfaces';
import { map, catchError, of, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CvService {
  private http = inject(HttpClient);
  // Cambiá a environment si querés switchear API/JSON.
  private src = 'assets/cv.json';

  getCv() {
    return this.http.get<RawCvFile>(this.src).pipe(
      map(raw => this.normalize(raw)),
      catchError(() => of({
        studies: [], works: [], tasks: [], skills: [], abilitiesBySkill: []
      } as CvData)),
      shareReplay(1)
    );
  }

  // ---------- Normalización ----------
  private normalize(raw: RawCvFile): CvData {
    const onlyActive = <T extends { status: Status }>(arr: T[]) => arr?.filter(x => x.status === 'active') ?? [];

    const rawSkills = raw.cvSkills ?? [];
    const rawAbilities = raw.cvAbilities ?? [];

    // Índices
    const skillsById = new Map<number, RawSkill>(rawSkills.map(s => [s.id, s]));
    const abilityRefsSkillIds = new Set<number>(rawAbilities.map(a => a.id_skill));

    // 1) Elegimos skills activos o que estén referenciados por abilities.
    const selectedSkills: RawSkill[] = rawSkills.filter(s =>
      s.status === 'active' || abilityRefsSkillIds.has(s.id)
    );

    // 2) Mapeamos skills al formato de UI
    const uiSkills: Skill[] = selectedSkills.map(s => ({
      id: s.id,
      attribute: s.attribute ?? (s.skill ?? 'General'),
      type: (s.type ?? s.skill ?? 'Skill'),
      skill: s.skill ?? 'Skill',
      description: s.description,
      status: s.status
    }));

    // 3) Abilities agrupadas por skill -> ability name
    const abilitiesActive = onlyActive(rawAbilities);
    const abilitiesBySkillMap = new Map<number, Map<string, AbilityGroupItem[]>>();

    for (const ab of abilitiesActive) {
      if (!abilitiesBySkillMap.has(ab.id_skill)) abilitiesBySkillMap.set(ab.id_skill, new Map());
      const groupMap = abilitiesBySkillMap.get(ab.id_skill)!;
      if (!groupMap.has(ab.ability)) groupMap.set(ab.ability, []);
      groupMap.get(ab.ability)!.push({
        id: ab.id,
        id_skill: ab.id_skill,
        ability: ab.ability,
        description: ab.description,
        status: ab.status
      });
    }

    const abilitiesBySkill: AbilityBySkill[] = Array.from(abilitiesBySkillMap.entries()).map(([skillId, groupsMap]) => {
      const rawSkill = skillsById.get(skillId);
      return {
        skillId,
        // Si el skill no existe o está inactivo, igual mostramos un nombre legible:
        skillName: rawSkill?.skill ?? rawSkill?.type ?? 'Skills',
        groups: Array.from(groupsMap.entries()).map(([abilityName, items]) => ({
          abilityName,
          items
        }))
      };
    });

    // 4) Estudios
    const studies: Study[] = onlyActive(raw.cvStudies ?? []).map((s: RawStudy) => ({
      id: s.id,
      place: s.place,
      study: s.study,
      start_date: s.start_date,
      description: s.description
    }));

    // 5) Works + Tasks
    const works: Work[] = onlyActive(raw.cvWorks ?? []).map((w: RawWork) => ({
      id: w.id,
      company: w.company,
      category: w.category,
      start_date: w.start_date,
      end_date: w.end_date,
      job_status: w.job_status
    }));

    const tasks: Task[] = onlyActive(raw.cvTasks ?? []).map((t: RawTask) => ({
      id: t.id,
      id_job: t.id_job,
      task: t.task,
      description: t.description
    }));

    return { studies, works, tasks, skills: uiSkills, abilitiesBySkill };
  }
}
