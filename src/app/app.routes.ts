import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'flood-monitor',
    loadComponent: () =>
      import('./pages/flood-monitor/flood-monitor.component').then(
        (c) => c.FloodMonitorComponent,
      ),
  },
  {
    path: '',
    redirectTo: 'flood-monitor',
    pathMatch: 'full',
  },
];
