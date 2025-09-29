import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { PROJECT_CATEGORY_MAP } from '../blog.config';

@Injectable({ providedIn: 'root' })
export class ProjectCategoryResolver implements Resolve<number> {
  constructor(private router: Router) {}
  resolve(route: ActivatedRouteSnapshot): number {
    const project = route.paramMap.get('project') || '';
    const catId = PROJECT_CATEGORY_MAP[project];
    // Si no existe el project o no mapea, usar por defecto la categoría 'personal' (ID=2)
    return catId ?? 2;
  }
}
