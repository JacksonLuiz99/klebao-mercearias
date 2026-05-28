import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'clientes', loadComponent: () => import('./pages/clientes/clientes.component').then(m => m.ClientesComponent) },
      { path: 'produtos', loadComponent: () => import('./pages/produtos/produtos.component').then(m => m.ProdutosComponent) },
      { path: 'fiados', loadComponent: () => import('./pages/fiados/fiados.component').then(m => m.FiadosComponent) },
      { path: 'relatorio', loadComponent: () => import('./pages/relatorio/relatorio.component').then(m => m.RelatorioComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];
