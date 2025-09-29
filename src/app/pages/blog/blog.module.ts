import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { BLOG_ROUTES } from './blog.routes';
import { BlogListComponent } from './list/blog-list.component';
import { BlogPostComponent } from './post/blog-post.component';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';

@NgModule({
  declarations: [],
  imports: [CommonModule, HttpClientModule, RouterModule.forChild(BLOG_ROUTES), BlogListComponent, BlogPostComponent, SafeHtmlPipe],
})
export class BlogModule {}
