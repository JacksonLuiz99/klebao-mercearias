import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ClienteService } from '../../services/cliente.service';
import { FiadoService } from '../../services/fiado.service';
import { ProdutoService } from '../../services/produto.service';

interface ResumoCliente {
  id: string;
  nome: string;
  telefone: string;
  totalPendente: number;
  qtdItens: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, CardModule, ButtonModule],
  template: `
    <div class="page-header">
      <h1><i class="pi pi-home"></i> Dashboard</h1>
      <span class="subtitle">Visão geral dos fiados</span>
    </div>

    <div class="stats-grid">
      <div class="stat-card stat-green">
        <div class="stat-icon"><i class="pi pi-users"></i></div>
        <div class="stat-info">
          <span class="stat-value">{{ totalClientes }}</span>
          <span class="stat-label">Clientes</span>
        </div>
      </div>
      <div class="stat-card stat-red">
        <div class="stat-icon"><i class="pi pi-exclamation-circle"></i></div>
        <div class="stat-info">
          <span class="stat-value">{{ clientesComDivida }}</span>
          <span class="stat-label">Com dívida</span>
        </div>
      </div>
      <div class="stat-card stat-orange">
        <div class="stat-icon"><i class="pi pi-dollar"></i></div>
        <div class="stat-info">
          <span class="stat-value">{{ totalGeral | currency:'BRL' }}</span>
          <span class="stat-label">Total em aberto</span>
        </div>
      </div>
      <div class="stat-card stat-blue">
        <div class="stat-icon"><i class="pi pi-tag"></i></div>
        <div class="stat-info">
          <span class="stat-value">{{ totalProdutos }}</span>
          <span class="stat-label">Produtos cadastrados</span>
        </div>
      </div>
    </div>

    <div class="section-title">
      <h2><i class="pi pi-exclamation-triangle"></i> Maiores devedores</h2>
      <a routerLink="/fiados" class="ver-todos">Ver todos <i class="pi pi-arrow-right"></i></a>
    </div>

    <div *ngIf="devedores.length === 0" class="empty-state">
      <i class="pi pi-check-circle"></i>
      <p>Nenhum fiado pendente! Tudo em dia.</p>
    </div>

    <div class="devedores-list" *ngIf="devedores.length > 0">
      <div class="devedor-card" *ngFor="let d of devedores">
        <div class="devedor-info">
          <div class="devedor-avatar">{{ d.nome.charAt(0).toUpperCase() }}</div>
          <div>
            <div class="devedor-nome">{{ d.nome }}</div>
            <div class="devedor-itens">{{ d.qtdItens }} item(ns) pendente(s)</div>
          </div>
        </div>
        <div class="devedor-actions">
          <span class="devedor-valor">{{ d.totalPendente | currency:'BRL' }}</span>
          <a [routerLink]="['/fiados']" [queryParams]="{clienteId: d.id}" class="btn-cobrar" title="Ver fiados">
            <i class="pi pi-eye"></i>
          </a>
        </div>
      </div>
    </div>
  `,
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  totalClientes = 0;
  clientesComDivida = 0;
  totalGeral = 0;
  totalProdutos = 0;
  devedores: ResumoCliente[] = [];

  constructor(
    private clienteService: ClienteService,
    private fiadoService: FiadoService,
    private produtoService: ProdutoService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    const clientes = this.clienteService.getAll();
    this.totalClientes = clientes.length;
    this.totalProdutos = this.produtoService.getAll().length;

    this.devedores = clientes
      .map(c => ({
        id: c.id,
        nome: c.nome,
        telefone: c.telefone,
        totalPendente: this.fiadoService.getTotalPendenteCliente(c.id),
        qtdItens: this.fiadoService.getPendentesCliente(c.id).length,
      }))
      .filter(d => d.totalPendente > 0)
      .sort((a, b) => b.totalPendente - a.totalPendente)
      .slice(0, 8);

    this.clientesComDivida = this.devedores.length;
    this.totalGeral = this.devedores.reduce((acc, d) => acc + d.totalPendente, 0);
  }
}
