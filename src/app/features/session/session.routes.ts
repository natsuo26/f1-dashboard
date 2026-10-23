import { Routes } from '@angular/router';

export const SESSION_ROUTES: Routes = [
  {
    path: ':sessionKey',
    title: 'Session · F1 Dashboard',
    loadComponent: () => import('./session.page').then((m) => m.SessionPage),
  },
  {
    path: ':sessionKey/replay',
    title: 'Replay · F1 Dashboard',
    loadComponent: () => import('../replay/replay.page').then((m) => m.ReplayPage),
  },
];
