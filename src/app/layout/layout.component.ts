import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout-wrapper" [class.sidebar-open]="sidebarOpen">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <i class="pi pi-shopping-cart"></i>
            <span>Klebão<br><small>Mercearias</small></span>
          </div>
          <button class="close-btn" (click)="sidebarOpen = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" (click)="sidebarOpen = false">
            <i class="pi pi-home"></i> Dashboard
          </a>
          <a routerLink="/fiados" routerLinkActive="active" (click)="sidebarOpen = false">
            <i class="pi pi-book"></i> Fiados
          </a>
          <a routerLink="/clientes" routerLinkActive="active" (click)="sidebarOpen = false">
            <i class="pi pi-users"></i> Clientes
          </a>
          <a routerLink="/produtos" routerLinkActive="active" (click)="sidebarOpen = false">
            <i class="pi pi-tag"></i> Produtos
          </a>
          <a routerLink="/relatorio" routerLinkActive="active" (click)="sidebarOpen = false">
            <i class="pi pi-chart-bar"></i> Relatório
          </a>
        </nav>
      </aside>
      <div class="sidebar-overlay" *ngIf="sidebarOpen" (click)="sidebarOpen = false"></div>
      <div class="main-content">
        <header class="topbar">
          <button class="menu-btn" (click)="sidebarOpen = !sidebarOpen">
            <i class="pi pi-bars"></i>
          </button>
          <span class="topbar-title">Controle de Fiados</span>
        </header>
        <div class="page-content">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  sidebarOpen = false;
}
