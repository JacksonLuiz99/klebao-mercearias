import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FiadoService } from '../../services/fiado.service';
import { Fiado } from '../../models/fiado.model';

interface SelectItem { label: string; value: number; }

@Component({
  selector: 'app-relatorio',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule, SelectModule, TableModule, ButtonModule],
  template: `
    <div class="page-header no-print">
      <div>
        <h1><i class="pi pi-chart-bar"></i> Relatório Mensal</h1>
        <span class="subtitle">Consolidado de fiados por mês</span>
      </div>
      <button class="btn-print" (click)="imprimir()">
        <i class="pi pi-print"></i> Imprimir / PDF
      </button>
    </div>
    <div class="print-header print-only">
      <h2>Klebão Mercearias — Relatório de Fiados</h2>
      <p>{{ getMesNome() }} / {{ anoSelecionado }}</p>
    </div>

    <div class="filtros-card no-print">
      <div class="filtro-item">
        <label>Mês</label>
        <p-select [(ngModel)]="mesSelecionado" [options]="meses"
                    (onChange)="carregar()" class="w-160" />
      </div>
      <div class="filtro-item">
        <label>Ano</label>
        <p-select [(ngModel)]="anoSelecionado" [options]="anos"
                    (onChange)="carregar()" class="w-120" />
      </div>
    </div>

    <div class="resumo-cards">
      <div class="resumo-card">
        <span class="resumo-label">Total fiado no mês</span>
        <span class="resumo-valor">{{ totalMes | currency:'BRL' }}</span>
      </div>
      <div class="resumo-card">
        <span class="resumo-label">Total pendente</span>
        <span class="resumo-valor red">{{ totalPendente | currency:'BRL' }}</span>
      </div>
      <div class="resumo-card">
        <span class="resumo-label">Total recebido</span>
        <span class="resumo-valor green">{{ totalPago | currency:'BRL' }}</span>
      </div>
      <div class="resumo-card">
        <span class="resumo-label">Clientes devedores</span>
        <span class="resumo-valor">{{ resumo.length }}</span>
      </div>
    </div>

    <div *ngIf="resumo.length === 0" class="empty-state">
      <i class="pi pi-calendar-times"></i>
      <p>Nenhum fiado registrado neste período.</p>
    </div>

    <div class="clientes-resumo" *ngIf="resumo.length > 0">
      <div class="cliente-resumo-card" *ngFor="let r of resumo">
        <div class="cr-header" (click)="r['aberto'] = !r['aberto']">
          <div class="cr-info">
            <div class="avatar">{{ r.clienteNome.charAt(0).toUpperCase() }}</div>
            <div>
              <div class="cr-nome">{{ r.clienteNome }}</div>
              <div class="cr-meta">{{ r.itens.length }} item(ns)</div>
            </div>
          </div>
          <div class="cr-valores">
            <span class="cr-total">{{ r.total | currency:'BRL' }}</span>
            <span class="badge-pendente" *ngIf="calcPendente(r.itens) > 0">
              {{ calcPendente(r.itens) | currency:'BRL' }} pendente
            </span>
            <span class="badge-pago" *ngIf="calcPendente(r.itens) === 0">Quitado</span>
            <i class="pi" [class.pi-chevron-down]="!r['aberto']" [class.pi-chevron-up]="r['aberto']"></i>
          </div>
        </div>
        <div class="cr-itens" *ngIf="r['aberto']">
          <table>
            <thead><tr><th>Produto</th><th>Qtd</th><th>Total</th><th>Data</th><th>Status</th></tr></thead>
            <tbody>
              <tr *ngFor="let f of r.itens">
                <td>{{ f.produtoNome }}</td>
                <td>{{ f.quantidade }}</td>
                <td>{{ f.total | currency:'BRL' }}</td>
                <td>{{ f.data | date:'dd/MM/yy' }}</td>
                <td><span [class]="f.pago ? 'badge-pago' : 'badge-pendente'">{{ f.pago ? 'Pago' : 'Pendente' }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styleUrl: './relatorio.component.scss'
})
export class RelatorioComponent implements OnInit {
  mesSelecionado = new Date().getMonth();
  anoSelecionado = new Date().getFullYear();
  resumo: ({ clienteId: string; clienteNome: string; total: number; itens: Fiado[] } & { aberto?: boolean })[] = [];
  totalMes = 0;
  totalPendente = 0;
  totalPago = 0;

  meses: SelectItem[] = [
    { label: 'Janeiro', value: 0 }, { label: 'Fevereiro', value: 1 },
    { label: 'Março', value: 2 }, { label: 'Abril', value: 3 },
    { label: 'Maio', value: 4 }, { label: 'Junho', value: 5 },
    { label: 'Julho', value: 6 }, { label: 'Agosto', value: 7 },
    { label: 'Setembro', value: 8 }, { label: 'Outubro', value: 9 },
    { label: 'Novembro', value: 10 }, { label: 'Dezembro', value: 11 },
  ];

  anos: SelectItem[] = [];

  constructor(private fiadoService: FiadoService) {}

  ngOnInit(): void {
    const anoAtual = new Date().getFullYear();
    this.anos = [anoAtual - 1, anoAtual, anoAtual + 1].map(a => ({ label: String(a), value: a }));
    this.carregar();
  }

  carregar(): void {
    this.resumo = this.fiadoService.getResumoMensal(this.mesSelecionado, this.anoSelecionado)
      .map(r => ({ ...r, aberto: false }));

    const todosItens = this.resumo.flatMap(r => r.itens);
    this.totalMes = todosItens.reduce((acc, f) => acc + f.total, 0);
    this.totalPendente = todosItens.filter(f => !f.pago).reduce((acc, f) => acc + f.total, 0);
    this.totalPago = todosItens.filter(f => f.pago).reduce((acc, f) => acc + f.total, 0);
  }

  calcPendente(itens: Fiado[]): number {
    return itens.filter(f => !f.pago).reduce((acc, f) => acc + f.total, 0);
  }

  getMesNome(): string {
    return this.meses.find(m => m.value === this.mesSelecionado)?.label ?? '';
  }

  imprimir(): void {
    this.resumo.forEach(r => (r['aberto'] = true));
    setTimeout(() => window.print(), 150);
  }
}
