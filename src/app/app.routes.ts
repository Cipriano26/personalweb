import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
    { path: 'contact', loadComponent: () => import('./pages/contact/contact').then(m => m.Contact) },
    { path: 'cv', loadComponent: () => import('./pages/cv/cv').then(m => m.Cv) },
    { path: 'blog', loadChildren: () => import('./pages/blog/blog.module').then(m => m.BlogModule) },
    { path: 'projects', loadComponent: () => import('./pages/projects/projects').then(m => m.Projects) },
    { path: 'media', loadComponent: () => import('./pages/media/media').then(m => m.Media) },
    { path: 'aboutme', loadComponent: () => import('./pages/aboutme/aboutme').then(m => m.Aboutme) }
];
