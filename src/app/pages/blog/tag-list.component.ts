import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CmsService } from './blog.service';

@Component({
  selector: 'app-blog-tag-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tag-list.component.html'
})
export class BlogTagListComponent {
  tagId!: number;
  tag: any | null = null;
  posts: any[] = [];

  constructor(private route: ActivatedRoute, private cms: CmsService) {}

  ngOnInit() {
    this.route.paramMap.subscribe((pm) => {
      const id = parseInt(pm.get('tagId') || '0', 10);
      if (!Number.isFinite(id) || id <= 0) return;
      this.tagId = id;
      this.load();
    });
  }

  private load() {
    this.cms.tagById(this.tagId).subscribe((tag) => (this.tag = tag));
    this.cms.listByTags([this.tagId], 1, 24).subscribe((arr) => (this.posts = arr ?? []));
  }

  featured(p: any): string | null {
    return p?._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null;
  }

  linkFor(p: any): any[] {
    return ['/', 'blog', p?.slug];
  }
}
