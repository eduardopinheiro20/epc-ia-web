import { Routes } from '@angular/router';
import { BilheteComponent } from './pages/bilhete/bilhete';
import { HistoricoComponent } from './pages/historico/historico';

export const routes: Routes = [
  { path: '', redirectTo: 'bilhete', pathMatch: 'full' },
  { path: 'bilhete', component: BilheteComponent },
  {
    path: 'historico',
    loadComponent: () =>
      import('./pages/historico/historico').then(m => m.HistoricoComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
  path: 'jogos',
    loadComponent: () =>
      import('./pages/jogos/jogos').then(m => m.JogosComponent)
  }
];
