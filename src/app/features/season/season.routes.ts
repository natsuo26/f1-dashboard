import { Routes } from '@angular/router';
import { currentYear } from '@core';

export const SEASON_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: `${currentYear()}` },
  {
    path: ':year',
    title: 'Season · F1 Dashboard',
    loadComponent: () => import('./season.page').then((m) => m.SeasonPage),
  },
];
