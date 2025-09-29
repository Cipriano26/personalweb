import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as env } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CmsService {
  private api = `${env.wpApi}/posts`;
  private tagsApi = `${env.wpApi}/tags`;
  private categoriesApi = `${env.wpApi}/categories`;
  private commentsApi = `${env.wpApi}/comments`;

  constructor(private http: HttpClient) {}

  listByCategory(catId: number, page = 1, perPage = 12) {
    const params = new HttpParams({ fromObject: { categories: catId, _embed: '1', per_page: perPage, page } });
    return this.http.get<any[]>(this.api, { params });
  }

  searchInCategory(catId: number, q: string, page = 1) {
    const params = new HttpParams({ fromObject: { categories: catId, search: q, _embed: '1', per_page: 20, page } });
    return this.http.get<any[]>(this.api, { params });
  }

  postBySlug(slug: string) {
    const params = new HttpParams({ fromObject: { slug, _embed: '1' } });
    return this.http.get<any[]>(this.api, { params });
  }

  tagsByIds(ids: number[]) {
    if (!ids?.length) return this.http.get<any[]>(this.tagsApi, { params: new HttpParams() });
    const params = new HttpParams({ fromObject: { include: ids.join(',') } });
    return this.http.get<any[]>(this.tagsApi, { params });
  }

  // Lista subcategorías (categorías hijas) de un padre dado
  subcategoriesOf(parentId: number, perPage = 100, page = 1) {
    const params = new HttpParams({ fromObject: { parent: parentId, per_page: perPage, page } });
    return this.http.get<any[]>(this.categoriesApi, { params });
  }

  // Obtiene una categoría por ID
  categoryById(id: number) {
    return this.http.get<any>(`${this.categoriesApi}/${id}`);
  }

  // Lista posts por conjunto de tags (cualquiera de ellos)
  listByTags(tagIds: number[], page = 1, perPage = 12) {
    const include = (tagIds || []).filter((n) => Number.isFinite(n) && n > 0);
    const params = new HttpParams({ fromObject: { tags: include.join(','), _embed: '1', per_page: perPage, page } });
    return this.http.get<any[]>(this.api, { params });
  }

  // Obtiene un tag por ID
  tagById(id: number) {
    return this.http.get<any>(`${this.tagsApi}/${id}`);
  }

  // Comentarios
  getComments(postId: number, page = 1, perPage = 50) {
    const params = new HttpParams({ fromObject: { post: postId, per_page: perPage, page, order: 'asc' } });
    return this.http.get<any[]>(this.commentsApi, { params });
  }

  addComment(payload: { post: number; author_name?: string; author_email?: string; content: string; parent?: number }) {
    // Nota: Para que funcione sin auth, el sitio WP debe permitir comentarios anónimos (discusión) y/o manejar moderación.
    return this.http.post<any>(this.commentsApi, payload);
  }

  // Engagement
  like(postId: number) {
    return this.http.post<any>(`${env.wpBase}/engagement/v1/like`, { postId });
  }

  share(postId: number, channel: string) {
    return this.http.post<any>(`${env.wpBase}/engagement/v1/share`, { postId, channel });
  }
}
