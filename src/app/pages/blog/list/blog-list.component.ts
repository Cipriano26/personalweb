import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { CmsService } from '../blog.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <section class="max-w-5xl mx-auto px-4 py-10">
    <div class="flex items-center justify-between gap-4 mb-6">
      <h1 class="text-2xl font-semibold tracking-tight">Blog</h1>
      <input
        type="search"
        placeholder="Buscar..."
        class="w-64 rounded-xl border px-3 py-2"
        (input)="onSearch($any($event.target).value)"
      />
    </div>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <a *ngFor="let p of posts" [routerLink]="[p.slug]"
         class="group block rounded-2xl border hover:shadow-md transition">
        <div class="aspect-[16/9] overflow-hidden rounded-t-2xl bg-gray-100">
          <img *ngIf="featured(p)" [src]="featured(p)" class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" />
        </div>
        <div class="p-4">
          <h2 class="text-lg font-medium line-clamp-2">{{ p.title.rendered }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ p.date | date:'mediumDate' }}</p>
          <p class="text-sm text-gray-600 mt-2" [innerHTML]="p.excerpt.rendered"></p>
        </div>
      </a>
    </div>
  </section>
  `
})
export class BlogListComponent {
  posts: any[] = [];
  catId!: number;
  q = '';

  constructor(private route: ActivatedRoute, private cms: CmsService, private router: Router) {}

  ngOnInit() {
    // Si venimos de /blog (sin :project), no hay resolver y usamos defaultCatId=2
    this.catId = this.route.snapshot.data['catId'] ?? this.route.snapshot.data['defaultCatId'] ?? 2;
    this.load();
  }

  load() {
    const req = this.q ? this.cms.searchInCategory(this.catId, this.q) : this.cms.listByCategory(this.catId);
    req.subscribe(d => this.posts = d);
  }

  onSearch(value: string) {
    this.q = value.trim();
    this.load();
  }

  featured(p: any): string | null {
    return p?._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null;
  }
}
