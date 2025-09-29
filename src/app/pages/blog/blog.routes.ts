import { Routes } from '@angular/router';
import { BlogListComponent } from './list/blog-list.component';
import { BlogPostComponent } from './post/blog-post.component';
import { ProjectCategoryResolver } from './resolvers/project-category.resolver';
import { Blog } from './blog';
import { BlogCategoryListComponent } from './category-list.component';
import { BlogTagListComponent } from './tag-list.component';

export const BLOG_ROUTES: Routes = [
  // Listado por defecto: /blog
  { path: '', component: Blog, data: { defaultCatId: 2 } },
  // Listado por categoría específica: /blog/cat/:catId
  { path: 'cat/:catId', component: BlogCategoryListComponent },
  // Listado por etiqueta específica: /blog/tag/:tagId
  { path: 'tag/:tagId', component: BlogTagListComponent },
  // Detalle sin project: /blog/:slug
  { path: ':slug', component: BlogPostComponent }
];
