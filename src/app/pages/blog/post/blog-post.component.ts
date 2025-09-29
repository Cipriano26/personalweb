import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { CmsService } from '../blog.service';
import { SafeHtmlPipe } from '../pipes/safe-html.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './blog-post.component.html'
})
export class BlogPostComponent implements AfterViewInit {
  post: any;
  related: any[] = [];
  relatedByTags: any[] = [];
  tags: { id: number; name: string }[] = [];
  tagIds: number[] = [];
  loading = true;
  relatedLoading = true;
  relatedTagsLoading = true;
  // Likes y comentarios
  likeCount = 0;
  liked = false;
  isLiking = false;
  shareCount = 0;
  comments: any[] = [];
  commentsLoading = false;
  sendingComment = false;
  commentAuthor = '';
  commentEmail = '';
  commentContent = '';
  // Feedback de envío de comentario
  commentSuccessMsg = '';
  commentErrorMsg = '';
  constructor(private route: ActivatedRoute, private cms: CmsService, private router: Router) {}

  ngAfterViewInit(): void {
    // Inicializa Preline cuando la vista ya está renderizada
    queueMicrotask(() => {
      try { (window as any)?.HSStaticMethods?.autoInit?.(); } catch {}
    });
  }

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.cms.postBySlug(slug).subscribe({
      next: (arr) => {
        this.post = arr?.[0];
        // Lee contadores desde meta expuestos por WP REST
        this.likeCount = Number(this.post?.meta?.post_likes) || 0;
        this.shareCount = Number(this.post?.meta?.post_shares) || 0;
        // Estado local de "liked" (solo para UI; el backend no expone si ya dio like)
        this.liked = false;

        // Cargar tags por ID
        this.tagIds = this.post?.tags || [];
        this.cms.tagsByIds(this.tagIds).subscribe({
          next: (tagsArr) => {
            this.tags = (tagsArr || []).map((t: any) => ({ id: t.id, name: t.name }));
          },
          error: () => { this.tags = []; }
        });

        const firstCatId = this.post?.categories?.[0];
        if (firstCatId) {
          // Cargar 4 relacionadas de la misma categoría, excluyendo el slug actual
          this.cms.listByCategory(firstCatId, 1, 4).subscribe({
            next: (list) => {
              this.related = (list || []).filter((p: any) => p.slug !== slug).slice(0, 4);
              this.relatedLoading = false;
            },
            error: () => { this.related = []; this.relatedLoading = false; }
          });
        } else {
          this.relatedLoading = false;
        }

        // Relacionados por etiquetas (si hay tags)
        if (this.tagIds?.length) {
          this.cms.listByTags(this.tagIds, 1, 4).subscribe({
            next: (list) => {
              this.relatedByTags = (list || []).filter((p: any) => p.slug !== slug).slice(0, 4);
              this.relatedTagsLoading = false;
            },
            error: () => { this.relatedByTags = []; this.relatedTagsLoading = false; }
          });
        } else {
          this.relatedTagsLoading = false;
        }

        // Cargar comentarios del post
        if (this.post?.id) {
          this.loadComments();
        }

        this.loading = false;
        // Re-init de Preline por si el contenido dinámico añadió elementos interactivos
        queueMicrotask(() => {
          try { (window as any)?.HSStaticMethods?.autoInit?.(); } catch {}
        });
      },
      error: () => {
        this.loading = false;
        this.relatedLoading = false;
        this.relatedTagsLoading = false;
      }
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

  goBack() { this.router.navigate(['../'], { relativeTo: this.route }); }

  featured(p: any): string | null {
    return p?._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null;
  }

  private extractTags(p: any): string[] {
    // Si más adelante resolves tags por ID, puedes mapearlas; por ahora placeholder vacía
    return [];
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
        // Si el backend devuelve conteo, úsalo; si no, +1 optimista
        if (typeof resp?.count === 'number') {
          this.likeCount = resp.count;
        } else {
          this.likeCount = this.likeCount + 1;
        }
        this.liked = true;
      },
      error: () => {
        // fallback: sin cambios
      },
      complete: () => {
        this.isLiking = false;
      }
    });
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
      next: (resp) => {
        // Limpiar y recargar comentarios desde backend
        this.commentContent = '';
        this.sendingComment = false;
        this.commentSuccessMsg = 'Comentario enviado correctamente. Está pendiente de moderación si corresponde.';
        this.loadComments();
        // Opcional: auto-ocultar mensaje
        setTimeout(() => { this.commentSuccessMsg = ''; }, 4000);
      },
      error: (err) => {
        this.sendingComment = false;
        const code = err?.error?.code || err?.code;
        if (code === 'rest_comment_login_required') {
          this.commentErrorMsg = 'El sitio requiere inicio de sesión para comentar. Para permitir comentarios anónimos, desactiva "Usuarios deben estar registrados para comentar" en WordPress o habilita comentarios anónimos en la API.';
        } else if (code === 'rest_comment_author_data_required') {
          this.commentErrorMsg = 'Debes ingresar nombre y email para comentar.';
        } else {
          this.commentErrorMsg = 'No se pudo enviar el comentario. Intenta nuevamente.';
        }
        setTimeout(() => { this.commentErrorMsg = ''; }, 4000);
      }
    });
  }

  shareTo(network: 'copy' | 'whatsapp' | 'twitter' | 'facebook' | 'linkedin' | 'instagram') {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(this.post?.title?.rendered || document.title);
    if (network === 'copy') {
      this.copyLink();
      // informar share a backend y actualizar contador
      if (this.post?.id) {
        this.cms.share(this.post.id, 'copy').subscribe({
          next: (resp) => {
            if (typeof resp?.count === 'number') {
              this.shareCount = resp.count;
            } else {
              this.shareCount = this.shareCount + 1;
            }
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
                next: (resp) => {
                  if (typeof resp?.count === 'number') {
                    this.shareCount = resp.count;
                  } else {
                    this.shareCount = this.shareCount + 1;
                  }
                },
                error: () => {}
              });
            }
          })
          .catch(() => {/* usuario canceló compartir */});
        return; // evitar continuar con la lógica de window.open
      } else {
        // Instagram Web no permite prellenar enlaces; copiamos el link y abrimos Instagram para que el usuario lo pegue.
        this.copyLink();
        shareUrl = 'https://www.instagram.com/';
      }
    }
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
      // informar share a backend y actualizar contador
      if (this.post?.id) {
        this.cms.share(this.post.id, network).subscribe({
          next: (resp) => {
            if (typeof resp?.count === 'number') {
              this.shareCount = resp.count;
            } else {
              this.shareCount = this.shareCount + 1;
            }
          },
          error: () => {}
        });
      }
    }
  }
}
