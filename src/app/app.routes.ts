import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'season' },
  { path: 'season', loadChildren: () => import('@features/season/season.routes').then((m) => m.SEASON_ROUTES) },
  {
    path: 'standings',
    loadChildren: () => import('@features/standings/standings.routes').then((m) => m.STANDINGS_ROUTES),
  },
  { path: 'session', loadChildren: () => import('@features/session/session.routes').then((m) => m.SESSION_ROUTES) },
  { path: '**', redirectTo: '' },
];
