// src/app/cv/cv.component.ts
import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvService } from './cv.service';
import html2pdf from 'html2pdf.js';
import { CvData, Task, Skill } from './cv.interfaces';

@Component({
  selector: 'app-cv',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cv.html'
})
export class Cv implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);
  data = signal<CvData>({ studies: [], works: [], tasks: [], skills: [], abilitiesBySkill: [] });
  showAboutModal = signal(false);

  constructor(private cv: CvService) {}

  ngOnInit(): void {
    this.cv.getCv().subscribe({
      next: d => {
        this.data.set(d);
        this.loading.set(false);
        // Log por cada grupo de skills cuando se cargan los datos
        try {
          const groups = new Map<string, Skill[]>();
          for (const s of d.skills) {
            const key = s.attribute || 'General';
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(s);
          }
          for (const [attr, skills] of groups.entries()) {
            console.log(`[CV] Grupo: ${attr}`, skills);
          }
        } catch (e) {
          console.warn('[CV] Error al calcular grupos de skills para log:', e);
        }
      },
      error: () => { this.error.set('No se pudo cargar el CV'); this.loading.set(false); }
    });
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return 'Buen día';
    if (h >= 12 && h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }

  // Agrupar skills por atributo (Frameworks, Lenguajes, etc.)
  groupedSkills = computed(() => {
    const groups = new Map<string, Skill[]>();
    for (const s of this.data().skills) {
      const key = s.attribute || 'General';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(s);
    }
    return Array.from(groups.entries()); // [ [attribute, Skill[]], ... ]
  });

  tasksByWorkId(workId: number): Task[] {
    return this.data().tasks.filter(t => t.id_job === workId);
  }

  trackByIndex(i: number) { return i; }
  trackById(_: number, item: { id: number }) { return item.id; }

  // Devuelve las skills visibles (oculta cuando type y skill son iguales)
  visibleSkills(list: Skill[]): Skill[] {
    return list.filter(s => (s.type || '') !== (s.skill || ''));
  }

  // Indica si el grupo tiene al menos una skill visible
  hasVisibleSkills(list: Skill[]): boolean {
    return this.visibleSkills(list).length > 0;
  }

  // Dispara la impresión y evita que el enlace navegue
  onPrint(event: Event): void {
    event.preventDefault();
    try {
      window.print();
    } catch (e) {
      console.warn('No se pudo abrir el diálogo de impresión:', e);
    }
  }

  // Exporta solo el contenido del main (#cv-print) a PDF
  exportPdf(event: Event): void {
    event.preventDefault();
    const el = document.getElementById('cv-print');
    if (!el) return;

    const opt = {
      margin:       0.5,
      filename:     'cv-cipriano-gorosito.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, scrollX: 0, scrollY: 0 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    } as const;

    // Añadimos una clase temporal para ocultar elementos marcados como print:hidden
    el.classList.add('print:!block');

    html2pdf().from(el).set(opt as any).save().catch(err => {
      console.error('No se pudo generar el PDF', err);
    });
  }
}
