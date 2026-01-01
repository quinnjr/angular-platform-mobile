import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.HomePage),
  },
  {
    path: 'getting-started',
    loadComponent: () =>
      import('./pages/getting-started/getting-started').then((m) => m.GettingStartedPage),
  },
  {
    path: 'components',
    loadComponent: () => import('./pages/components/components').then((m) => m.ComponentsPage),
  },
  {
    path: 'components/:id',
    loadComponent: () => import('./pages/components/components').then((m) => m.ComponentsPage),
  },
  {
    path: 'services',
    loadComponent: () => import('./pages/services/services').then((m) => m.ServicesPage),
  },
  {
    path: 'services/:id',
    loadComponent: () => import('./pages/services/services').then((m) => m.ServicesPage),
  },
  {
    path: 'styling',
    loadComponent: () => import('./pages/styling/styling').then((m) => m.StylingPage),
  },
  {
    path: 'animation',
    loadComponent: () => import('./pages/animation/animation').then((m) => m.AnimationPage),
  },
  {
    path: 'platform',
    loadComponent: () => import('./pages/platform/platform').then((m) => m.PlatformPage),
  },
  {
    path: 'bridge',
    loadComponent: () => import('./pages/bridge/bridge').then((m) => m.BridgePage),
  },
  {
    path: 'cli',
    loadComponent: () => import('./pages/cli/cli').then((m) => m.CLIPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
