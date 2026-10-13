import { Routes } from '@angular/router';
import { judgeNameGuard } from './core/guards/judge-name.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'welcome'
  },
  {
    path: 'welcome',
    loadComponent: () =>
      import('./features/welcome/welcome.component').then(m => m.WelcomeComponent)
  },
  {
    path: 'postulacion',
    loadComponent: () =>
      import('./features/postulacion/postulacion.component').then(
        m => m.PostulacionComponent
      )
  },
  {
    path: 'admin',
    canActivate: [judgeNameGuard],
    loadComponent: () =>
      import('./features/admin/admin.component').then(m => m.AdminComponent)
  },
  {
    path: 'categories',
    canActivate: [judgeNameGuard],
    loadComponent: () =>
      import('./features/categories-menu/categories-menu.component').then(
        m => m.CategoriesMenuComponent
      )
  },
  {
    path: 'evaluation/:categoryId',
    canActivate: [judgeNameGuard],
    loadComponent: () =>
      import('./features/evaluation/evaluation.component').then(
        m => m.EvaluationComponent
      )
  },
  {
    path: 'results',
    canActivate: [judgeNameGuard],
    loadComponent: () =>
      import('./features/results/results.component').then(m => m.ResultsComponent)
  },
  {
    path: 'results/evaluation/:id',
    canActivate: [judgeNameGuard],
    loadComponent: () =>
      import('./features/results/components/evaluation-detail/evaluation-detail.component').then(
        m => m.EvaluationDetailComponent
      )
  },
  {
    path: 'results/detail/:id',
    canActivate: [judgeNameGuard],
    loadComponent: () =>
      import('./features/results/components/evaluation-detail/evaluation-detail.component').then(
        m => m.EvaluationDetailComponent
      )
  },
  {
    path: '**',
    redirectTo: 'welcome'
  }
];
