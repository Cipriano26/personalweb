import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CmsService } from './blog.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog.html',
  styleUrl: './blog.css'
})
export class Blog {
  posts: any[] = [];
  heroPosts: any[] = [];
  catId = 2;
  latest: any | null = null;
  q: string = '';
  // subcategorías del padre catId y mapa de posts por subcategoría
  subcats: any[] = [];
  postsBySubcat: Record<number, any[]> = {};

  constructor(private route: ActivatedRoute, private cms: CmsService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.catId = this.resolveCatIdFromRoute();
    // Suscribirse a cambios de query params para búsqueda o cambio de categoría
    this.route.queryParamMap.subscribe((qp) => {
      const catParam = qp.get('cat');
      const parsed = catParam ? parseInt(catParam, 10) : NaN;
      this.catId = Number.isFinite(parsed) && parsed > 0 ? parsed : this.resolveCatIdFromRoute();

      this.q = (qp.get('search') || '').trim();
      this.load();
    });
  }

  private load() {
    const obs = this.q
      ? this.cms.searchInCategory(this.catId, this.q)
      : this.cms.listByCategory(this.catId, 1, 4);
    obs.subscribe((arr) => {
      this.posts = arr ?? [];
      // Toma las primeras 3-5 entradas para el hero
      this.heroPosts = this.posts.slice(0, 3);
      // Última entrada para el hero single
      this.latest = this.posts[0] ?? null;
      // Inicializa/reinicializa el carrusel de Preline cuando ya hay slides en el DOM
      queueMicrotask(() => {
        const anyWin: any = window as any;
        try { anyWin?.HSStaticMethods?.autoInit?.(); } catch {}
      });
    });

  // Cargar subcategorías del padre id=2 (pedido explícito) y traer posts de cada una
  const parentForSubcats = 2;
  this.cms.subcategoriesOf(parentForSubcats).subscribe((cats) => {
      this.subcats = cats ?? [];
      // Reset mapa
      this.postsBySubcat = {};
      // Por cada subcategoría, pedir últimos posts (máximo 4 para esta vista)
      this.subcats.forEach((c) => {
        const id = c?.id;
        if (!Number.isFinite(id)) return;
        this.cms.listByCategory(id, 1, 4).subscribe((list) => {
          this.postsBySubcat[id] = list ?? [];
        });
      });
    });
  }

  featured(p: any): string | null {
    return p?._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null;
  }

  bg(p: any): SafeStyle {
    const url = this.featured(p);
    return this.sanitizer.bypassSecurityTrustStyle(url ? `url('${url}')` : 'none');
  }

  // Construye el link hacia /blog/:slug (sin :project)
  linkFor(p: any): any[] {
    return ['/', 'blog', p?.slug];
  }

  private resolveCatIdFromRoute(): number {
    // Lee catId si existiera (ya no usamos :project). Fallback a defaultCatId o 2
    const selfData = this.route.snapshot.data || {};
    return (selfData['catId'] ?? selfData['defaultCatId'] ?? 2) as number;
  }
}
