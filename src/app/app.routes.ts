import { Routes } from '@angular/router';
import { BilheteComponent } from './pages/bilhete/bilhete';
import { HistoricoComponent } from './pages/historico/historico';
import { EstatisticasComponent } from './pages/estatisticas/estatisticas';

import { authGuard } from './services/auth.guard';

export const routes: Routes = [

  // 🔓 LOGIN (público)
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },

  // 🔐 HOME (protegido)
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.HomeComponent),
    canActivate: [authGuard]
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then(m => m.RegisterComponent)
  },

  // 🔐 BILHETE (protegido)
  {
    path: 'bilhete',
    component: BilheteComponent
  },

  // 🔐 HISTÓRICO
  {
    path: 'historico',
    loadComponent: () =>
      import('./pages/historico/historico')
        .then(m => m.HistoricoComponent),
    canActivate: [authGuard]
  },

  // 🔐 JOGOS
  {
    path: 'jogos',
    loadComponent: () =>
      import('./pages/jogos/jogos')
        .then(m => m.JogosComponent),
    canActivate: [authGuard]
  },

  // 🔐 ESTATÍSTICAS
  {
    path: 'estatisticas',
    loadComponent: () =>
      import('./pages/estatisticas/estatisticas')
        .then(m => m.EstatisticasComponent),
    canActivate: [authGuard]
  },

  // 🔐 IMPORTAÇÃO DE DADOS
  {
    path: 'importar',
    loadComponent: () =>
      import('./pages/importar-planilha/importar-planilha')
        .then(m => m.ImportarPlanilhaComponent),
    canActivate: [authGuard]
  },

  // 🔁 REDIRECT PADRÃO
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

  // 🧹 FALLBACK
  {
    path: '**',
    redirectTo: 'home'
  }
];
