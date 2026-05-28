import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ClienteService } from '../../services/cliente.service';
import { ProdutoService } from '../../services/produto.service';
import { FiadoService } from '../../services/fiado.service';
import { Cliente } from '../../models/cliente.model';
import { Produto } from '../../models/produto.model';
import { Fiado } from '../../models/fiado.model';

interface SelectItem { label: string; value: string; }

interface ClienteComFiados {
  cliente: Cliente;
  fiados: Fiado[];
  pendentes: Fiado[];
  totalPendente: number;
  aberto: boolean;
}

@Component({
  selector: 'app-fiados',
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, DatePipe, FormsModule,
    ButtonModule, DialogModule, SelectModule,
    InputNumberModule, ConfirmDialogModule, ToastModule,
    AccordionModule, TableModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="page-header">
      <div>
        <h1><i class="pi pi-book"></i> Fiados</h1>
        <span class="subtitle">Controle de produtos fiados por cliente</span>
      </div>
      <button class="btn-primary" (click)="abrirLancamento()" [disabled]="clientes.length === 0">
        <i class="pi pi-plus"></i> Lançar Fiado
      </button>
    </div>

    <div *ngIf="clientes.length === 0" class="empty-state-page">
      <i class="pi pi-users"></i>
      <p>Cadastre clientes antes de lançar fiados.</p>
    </div>

    <div class="filtro-bar" *ngIf="clientes.length > 0">
      <button [class]="filtroAtivo === 'todos' ? 'filtro-btn active' : 'filtro-btn'" (click)="setFiltro('todos')">Todos</button>
      <button [class]="filtroAtivo === 'pendentes' ? 'filtro-btn active' : 'filtro-btn'" (click)="setFiltro('pendentes')">Com pendência</button>
      <button [class]="filtroAtivo === 'quitados' ? 'filtro-btn active' : 'filtro-btn'" (click)="setFiltro('quitados')">Quitados</button>
    </div>

    <div class="clientes-lista" *ngIf="clientesFiltrados.length > 0">
      <div class="cliente-bloco" *ngFor="let cc of clientesFiltrados">
        <div class="cliente-header" (click)="cc.aberto = !cc.aberto">
          <div class="cliente-info">
            <div class="avatar">{{ cc.cliente.nome.charAt(0).toUpperCase() }}</div>
            <div>
              <div class="cliente-nome">{{ cc.cliente.nome }}</div>
              <div class="cliente-meta">{{ cc.fiados.length }} fiado(s) | {{ cc.pendentes.length }} pendente(s)</div>
            </div>
          </div>
          <div class="cliente-header-right">
            <span [class]="cc.totalPendente > 0 ? 'total-devendo' : 'total-quitado'">
              {{ cc.totalPendente | currency:'BRL' }}
            </span>
            <div class="header-actions" (click)="$event.stopPropagation()">
              <button class="btn-icon btn-whatsapp"
                      *ngIf="cc.totalPendente > 0 && cc.cliente.telefone"
                      (click)="cobrarWhatsApp(cc)" title="Cobrar via WhatsApp">
                <i class="pi pi-whatsapp"></i>
              </button>
              <button class="btn-icon btn-add"
                      (click)="abrirLancamento(cc.cliente)" title="Lançar fiado">
                <i class="pi pi-plus"></i>
              </button>
              <button *ngIf="cc.totalPendente > 0" class="btn-icon btn-pay-all"
                      (click)="confirmarQuitarTodos(cc)" title="Quitar tudo">
                <i class="pi pi-check-circle"></i>
              </button>
            </div>
            <i class="pi" [class.pi-chevron-down]="!cc.aberto" [class.pi-chevron-up]="cc.aberto"></i>
          </div>
        </div>

        <div class="fiados-table" *ngIf="cc.aberto">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Qtd</th>
                <th>Preço</th>
                <th>Total</th>
                <th>Data</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let f of cc.fiados">
                <td>{{ f.produtoNome }}</td>
                <td>{{ f.quantidade }} {{ getUnidade(f.produtoId) }}</td>
                <td>{{ f.precoProduto | currency:'BRL' }}</td>
                <td><strong>{{ f.total | currency:'BRL' }}</strong></td>
                <td>{{ f.data | date:'dd/MM/yy' }}</td>
                <td>
                  <span [class]="f.pago ? 'badge-pago' : 'badge-pendente'">
                    {{ f.pago ? 'Pago' : 'Pendente' }}
                  </span>
                </td>
                <td>
                  <div class="row-actions">
                    <button *ngIf="!f.pago" class="btn-icon btn-pay"
                            (click)="marcarPago(f)" title="Marcar como pago">
                      <i class="pi pi-check"></i>
                    </button>
                    <button class="btn-icon btn-delete"
                            (click)="confirmarDeleteFiado(f)" title="Excluir">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div *ngIf="clientes.length > 0 && clientesFiltrados.length === 0" class="empty-state-page">
      <i class="pi pi-check-circle"></i>
      <p>Nenhum resultado para este filtro.</p>
    </div>

    <!-- Dialog lançar fiado -->
    <p-dialog [(visible)]="dialogVisible" header="Lançar Fiado"
              [modal]="true" [style]="{width: '460px'}" [draggable]="false">
      <div class="form-group">
        <label>Cliente *</label>
        <p-select [(ngModel)]="lancamento.clienteId" [options]="clienteOptions"
                    placeholder="Selecionar cliente..." class="w-full" [filter]="true"
                    (onChange)="onClienteChange()" />
      </div>
      <div class="form-group">
        <label>Produto *</label>
        <p-select [(ngModel)]="lancamento.produtoId" [options]="produtoOptions"
                    placeholder="Selecionar produto..." class="w-full" [filter]="true"
                    (onChange)="onProdutoChange()" [disabled]="produtoOptions.length === 0" />
        <small class="hint" *ngIf="produtoOptions.length === 0">Cadastre produtos antes de lançar fiados.</small>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Quantidade *</label>
          <p-inputNumber [(ngModel)]="lancamento.quantidade" [min]="0.1" [step]="1"
                         [minFractionDigits]="0" [maxFractionDigits]="3"
                         (ngModelChange)="calcTotal()" class="w-full" />
        </div>
        <div class="form-group">
          <label>Preço unit.</label>
          <p-inputNumber [(ngModel)]="lancamento.preco" mode="currency" currency="BRL"
                         locale="pt-BR" [min]="0" (ngModelChange)="calcTotal()" class="w-full" />
        </div>
      </div>
      <div class="total-preview" *ngIf="lancamento.quantidade && lancamento.preco">
        Total: <strong>{{ lancamento.quantidade * lancamento.preco | currency:'BRL' }}</strong>
      </div>
      <ng-template pTemplate="footer">
        <button class="btn-secondary" (click)="dialogVisible = false">Cancelar</button>
        <button class="btn-primary" (click)="salvarFiado()"
                [disabled]="!lancamento.clienteId || !lancamento.produtoId || !lancamento.quantidade">
          Lançar
        </button>
      </ng-template>
    </p-dialog>
  `,
  styleUrl: './fiados.component.scss'
})
export class FiadosComponent implements OnInit {
  clientes: Cliente[] = [];
  produtos: Produto[] = [];
  todosFiados: Fiado[] = [];
  clientesFiltrados: ClienteComFiados[] = [];
  clientesComFiados: ClienteComFiados[] = [];
  filtroAtivo: 'todos' | 'pendentes' | 'quitados' = 'todos';

  dialogVisible = false;
  clienteOptions: SelectItem[] = [];
  produtoOptions: SelectItem[] = [];

  lancamento = { clienteId: '', produtoId: '', quantidade: 1, preco: 0 };

  constructor(
    private clienteService: ClienteService,
    private produtoService: ProdutoService,
    private fiadoService: FiadoService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.carregar();
    this.route.queryParams.subscribe(params => {
      if (params['clienteId']) {
        const cc = this.clientesComFiados.find(x => x.cliente.id === params['clienteId']);
        if (cc) cc.aberto = true;
      }
    });
  }

  carregar(): void {
    this.clientes = this.clienteService.getAll();
    this.produtos = this.produtoService.getAll();
    this.todosFiados = this.fiadoService.getAll();

    this.clienteOptions = this.clientes.map(c => ({ label: c.nome, value: c.id }));
    this.produtoOptions = this.produtos.map(p => ({ label: `${p.nome} — ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.preco)}`, value: p.id }));

    this.clientesComFiados = this.clientes.map(c => {
      const fiados = this.todosFiados.filter(f => f.clienteId === c.id)
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      const pendentes = fiados.filter(f => !f.pago);
      const totalPendente = pendentes.reduce((acc, f) => acc + f.total, 0);
      return { cliente: c, fiados, pendentes, totalPendente, aberto: false };
    });

    this.aplicarFiltro();
  }

  setFiltro(f: 'todos' | 'pendentes' | 'quitados'): void {
    this.filtroAtivo = f;
    this.aplicarFiltro();
  }

  aplicarFiltro(): void {
    if (this.filtroAtivo === 'pendentes') {
      this.clientesFiltrados = this.clientesComFiados.filter(cc => cc.totalPendente > 0);
    } else if (this.filtroAtivo === 'quitados') {
      this.clientesFiltrados = this.clientesComFiados.filter(cc => cc.totalPendente === 0 && cc.fiados.length > 0);
    } else {
      this.clientesFiltrados = [...this.clientesComFiados];
    }
  }

  getUnidade(produtoId: string): string {
    return this.produtos.find(p => p.id === produtoId)?.unidade ?? '';
  }

  abrirLancamento(cliente?: Cliente): void {
    this.lancamento = { clienteId: cliente?.id ?? '', produtoId: '', quantidade: 1, preco: 0 };
    this.dialogVisible = true;
  }

  onClienteChange(): void {}

  onProdutoChange(): void {
    const p = this.produtos.find(x => x.id === this.lancamento.produtoId);
    if (p) this.lancamento.preco = p.preco;
  }

  calcTotal(): void {}

  salvarFiado(): void {
    const cliente = this.clientes.find(c => c.id === this.lancamento.clienteId)!;
    const produto = this.produtos.find(p => p.id === this.lancamento.produtoId)!;

    this.fiadoService.save({
      clienteId: cliente.id,
      clienteNome: cliente.nome,
      produtoId: produto.id,
      produtoNome: produto.nome,
      precoProduto: this.lancamento.preco,
      quantidade: this.lancamento.quantidade,
      total: +(this.lancamento.quantidade * this.lancamento.preco).toFixed(2),
      data: new Date().toISOString(),
      pago: false,
    });

    this.messageService.add({ severity: 'success', summary: 'Lançado', detail: `Fiado de ${cliente.nome} registrado.` });
    this.dialogVisible = false;
    this.carregar();
  }

  marcarPago(f: Fiado): void {
    this.fiadoService.marcarPago(f.id);
    this.messageService.add({ severity: 'success', summary: 'Pago', detail: 'Fiado marcado como pago.' });
    this.carregar();
  }

  confirmarQuitarTodos(cc: ClienteComFiados): void {
    this.confirmationService.confirm({
      message: `Quitar todos os fiados pendentes de <strong>${cc.cliente.nome}</strong> (${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cc.totalPendente)})?`,
      header: 'Confirmar quitação',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Quitar tudo',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.fiadoService.marcarTodosPagos(cc.cliente.id);
        this.messageService.add({ severity: 'success', summary: 'Quitado', detail: `Todos os fiados de ${cc.cliente.nome} foram quitados.` });
        this.carregar();
      }
    });
  }

  confirmarDeleteFiado(f: Fiado): void {
    this.confirmationService.confirm({
      message: `Deseja excluir este fiado de <strong>${f.produtoNome}</strong>?`,
      header: 'Confirmar exclusão',
      icon: 'pi pi-trash',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.fiadoService.delete(f.id);
        this.messageService.add({ severity: 'warn', summary: 'Excluído', detail: 'Fiado excluído.' });
        this.carregar();
      }
    });
  }

  cobrarWhatsApp(cc: ClienteComFiados): void {
    const itens = cc.pendentes
      .map(f => `• ${f.produtoNome} x${f.quantidade} = ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(f.total)}`)
      .join('\n');

    const total = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cc.totalPendente);
    const msg = `Olá, ${cc.cliente.nome}! 😊\n\nPassando para informar seu saldo na mercearia:\n\n${itens}\n\n*Total: ${total}*\n\nQualquer dúvida estou à disposição! 🛒`;
    const telefone = cc.cliente.telefone.replace(/\D/g, '');
    const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }
}
