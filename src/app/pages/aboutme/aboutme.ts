import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CmsService } from '../blog/blog.service';

@Component({
  selector: 'app-aboutme',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './aboutme.html',
  styleUrl: './aboutme.css'
})
export class Aboutme implements AfterViewInit {
  // Datos del post
  post: any;
  loading = true;
  // Tags
  tags: { id: number; name: string }[] = [];
  tagIds: number[] = [];
  // Interacciones
  likeCount = 0;
  liked = false;
  isLiking = false;
  shareCount = 0;
  // Comentarios
  comments: any[] = [];
  commentsLoading = false;
  sendingComment = false;
  commentAuthor = '';
  commentEmail = '';
  commentContent = '';
  commentSuccessMsg = '';
  commentErrorMsg = '';

  private readonly SLUG = 'te-cuento-un-poco-sobre-mi';

  constructor(private cms: CmsService) {}

  ngOnInit() {
    this.cms.postBySlug(this.SLUG).subscribe({
      next: (arr) => {
        this.post = arr?.[0];
        this.likeCount = Number(this.post?.meta?.post_likes) || 0;
        this.shareCount = Number(this.post?.meta?.post_shares) || 0;
        this.liked = false;

        // Cargar tags
        this.tagIds = this.post?.tags || [];
        if (this.tagIds?.length) {
          this.cms.tagsByIds(this.tagIds).subscribe({
            next: (tagsArr) => {
              this.tags = (tagsArr || []).map((t: any) => ({ id: t.id, name: t.name }));
            },
            error: () => { this.tags = []; }
          });
        }

        // Comentarios
        if (this.post?.id) {
          this.loadComments();
        }

        this.loading = false;
        queueMicrotask(() => {
          try { (window as any)?.HSStaticMethods?.autoInit?.(); } catch {}
        });
      },
      error: () => { this.loading = false; }
    });
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      try { (window as any)?.HSStaticMethods?.autoInit?.(); } catch {}
    });
  }

  private loadComments() {
    if (!this.post?.id) return;
    this.commentsLoading = true;
    this.cms.getComments(this.post.id).subscribe({
      next: (list) => { this.comments = list || []; this.commentsLoading = false; },
      error: () => { this.comments = []; this.commentsLoading = false; }
    });
  }

  copyLink() {
    const url = window.location.href;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
    }
  }

  scrollToComments() {
    const el = document.getElementById('comments');
    el?.scrollIntoView({ behavior: 'smooth' });
  }

  toggleLike() {
    if (!this.post?.id || this.liked || this.isLiking) return;
    this.isLiking = true;
    this.cms.like(this.post.id).subscribe({
      next: (resp) => {
        if (typeof resp?.count === 'number') {
          this.likeCount = resp.count;
        } else {
          this.likeCount = this.likeCount + 1;
        }
        this.liked = true;
      },
      error: () => {},
      complete: () => { this.isLiking = false; }
    });
  }

  shareTo(network: 'copy' | 'whatsapp' | 'twitter' | 'facebook' | 'linkedin' | 'instagram') {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(this.post?.title?.rendered || document.title);
    if (network === 'copy') {
      this.copyLink();
      if (this.post?.id) {
        this.cms.share(this.post.id, 'copy').subscribe({
          next: (resp) => {
            if (typeof resp?.count === 'number') this.shareCount = resp.count; else this.shareCount = this.shareCount + 1;
          },
          error: () => {}
        });
      }
      return;
    }
    let shareUrl = '';
    if (network === 'whatsapp') {
      const rawUrl = window.location.href;
      const rawTitle = this.post?.title?.rendered || document.title;
      shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${rawTitle} ${rawUrl}`)}`;
    } else if (network === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
    } else if (network === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    } else if (network === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    } else if (network === 'instagram') {
      const rawUrl = window.location.href;
      const rawTitle = this.post?.title?.rendered || document.title;
      const nav: any = navigator as any;
      if (nav?.share) {
        nav.share({ title: rawTitle, text: rawTitle, url: rawUrl })
          .then(() => {
            if (this.post?.id) {
              this.cms.share(this.post.id, 'instagram').subscribe({
                next: (resp) => { if (typeof resp?.count === 'number') this.shareCount = resp.count; else this.shareCount = this.shareCount + 1; },
                error: () => {}
              });
            }
          })
          .catch(() => {});
        return;
      } else {
        this.copyLink();
        shareUrl = 'https://www.instagram.com/';
      }
    }
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
      if (this.post?.id) {
        this.cms.share(this.post.id, network).subscribe({
          next: (resp) => { if (typeof resp?.count === 'number') this.shareCount = resp.count; else this.shareCount = this.shareCount + 1; },
          error: () => {}
        });
      }
    }
  }

  submitComment() {
    if (!this.post?.id || !this.commentContent?.trim()) return;
    this.sendingComment = true;
    this.commentSuccessMsg = '';
    this.commentErrorMsg = '';
    this.cms.addComment({
      post: this.post.id,
      author_name: this.commentAuthor?.trim() || undefined,
      author_email: this.commentEmail?.trim() || undefined,
      content: this.commentContent.trim()
    }).subscribe({
      next: () => {
        this.commentContent = '';
        this.sendingComment = false;
        this.commentSuccessMsg = 'Comentario enviado correctamente. Está pendiente de moderación si corresponde.';
        this.loadComments();
        setTimeout(() => { this.commentSuccessMsg = ''; }, 4000);
      },
      error: (err) => {
        this.sendingComment = false;
        const code = err?.error?.code || err?.code;
        if (code === 'rest_comment_login_required') {
          this.commentErrorMsg = 'El sitio requiere inicio de sesión para comentar.';
        } else if (code === 'rest_comment_author_data_required') {
          this.commentErrorMsg = 'Debes ingresar nombre y email para comentar.';
        } else {
          this.commentErrorMsg = 'No se pudo enviar el comentario. Intenta nuevamente.';
        }
        setTimeout(() => { this.commentErrorMsg = ''; }, 4000);
      }
    });
  }
}
