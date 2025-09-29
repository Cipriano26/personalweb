import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CmsService } from './blog.service';

@Component({
  selector: 'app-blog-category-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-list.component.html'
})
export class BlogCategoryListComponent {
  catId!: number;
  category: any | null = null;
  posts: any[] = [];

  constructor(private route: ActivatedRoute, private cms: CmsService) {}

  ngOnInit() {
    this.route.paramMap.subscribe((pm) => {
      const id = parseInt(pm.get('catId') || '0', 10);
      if (!Number.isFinite(id) || id <= 0) return;
      this.catId = id;
      this.load();
    });
  }

  private load() {
    this.cms.categoryById(this.catId).subscribe((cat) => (this.category = cat));
    this.cms.listByCategory(this.catId, 1, 24).subscribe((arr) => (this.posts = arr ?? []));
  }

  featured(p: any): string | null {
    return p?._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null;
  }

  linkFor(p: any): any[] {
    return ['/', 'blog', p?.slug];
  }
}
