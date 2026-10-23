import { Routes } from '@angular/router';
import { currentYear } from '@core';

export const STANDINGS_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: `${currentYear()}` },
  {
    path: ':year',
    title: 'Standings · F1 Dashboard',
    loadComponent: () => import('./standings.page').then((m) => m.StandingsPage),
  },
];
