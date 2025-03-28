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
    path: 'vehicles',
    loadComponent: () =>
      import('./pages/vehicles/vehicles.component').then(
        (c) => c.VehiclesComponent,
      ),
  },
  {
    path: '',
    redirectTo: 'vehicles',
    pathMatch: 'full',
  },
];
