import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProdutoService } from '../../services/produto.service';
import { Produto } from '../../models/produto.model';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, FormsModule,
    TableModule, ButtonModule, DialogModule,
    InputTextModule, InputNumberModule, SelectModule,
    ConfirmDialogModule, ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="page-header">
      <div>
        <h1><i class="pi pi-tag"></i> Produtos</h1>
        <span class="subtitle">Gerencie seu catálogo de produtos</span>
      </div>
      <button class="btn-primary" (click)="abrirNovo()">
        <i class="pi pi-plus"></i> Novo Produto
      </button>
    </div>

    <div class="card-table">
      <p-table [value]="produtos" [paginator]="true" [rows]="10"
               [globalFilterFields]="['nome','unidade']"
               styleClass="p-datatable-sm" responsiveLayout="scroll" #dt>
        <ng-template pTemplate="caption">
          <div class="table-caption">
            <input pInputText type="text" placeholder="Pesquisar produto..."
                   class="search-input"
                   (input)="dt.filterGlobal($any($event.target).value, 'contains')" />
          </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th>Nome</th>
            <th>Preço</th>
            <th>Unidade</th>
            <th>Ações</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-produto>
          <tr>
            <td>
              <div class="produto-nome-cell">
                <div class="produto-icon"><i class="pi pi-shopping-bag"></i></div>
                {{ produto.nome }}
              </div>
            </td>
            <td><span class="preco">{{ produto.preco | currency:'BRL' }}</span></td>
            <td><span class="badge-unit">{{ produto.unidade }}</span></td>
            <td>
              <div class="actions">
                <button class="btn-icon btn-edit" (click)="editar(produto)" title="Editar">
                  <i class="pi pi-pencil"></i>
                </button>
                <button class="btn-icon btn-delete" (click)="confirmarDelete(produto)" title="Excluir">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="4" class="empty-row">Nenhum produto cadastrado.</td></tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [(visible)]="dialogVisible"
              [header]="editando ? 'Editar Produto' : 'Novo Produto'"
              [modal]="true" [style]="{width: '420px'}" [draggable]="false">
      <div class="form-group">
        <label>Nome *</label>
        <input pInputText [(ngModel)]="form.nome" placeholder="Ex: Arroz 5kg" class="w-full" />
      </div>
      <div class="form-group">
        <label>Preço (R$) *</label>
        <p-inputNumber [(ngModel)]="form.preco" mode="currency" currency="BRL"
                       locale="pt-BR" [min]="0.01" class="w-full" />
      </div>
      <div class="form-group">
        <label>Unidade *</label>
        <p-select [(ngModel)]="form.unidade" [options]="unidades"
                    placeholder="Selecionar..." class="w-full" />
      </div>
      <ng-template pTemplate="footer">
        <button class="btn-secondary" (click)="dialogVisible = false">Cancelar</button>
        <button class="btn-primary" (click)="salvar()"
                [disabled]="!form.nome.trim() || !form.preco || !form.unidade">
          Salvar
        </button>
      </ng-template>
    </p-dialog>
  `,
  styleUrl: './produtos.component.scss'
})
export class ProdutosComponent implements OnInit {
  produtos: Produto[] = [];
  dialogVisible = false;
  editando = false;
  editandoId = '';
  form = { nome: '', preco: 0, unidade: '' };

  unidades = ['un', 'kg', 'g', 'L', 'mL', 'pct', 'cx', 'dz', 'fardo'];

  constructor(
    private produtoService: ProdutoService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void { this.carregar(); }

  carregar(): void { this.produtos = this.produtoService.getAll(); }

  abrirNovo(): void {
    this.form = { nome: '', preco: 0, unidade: '' };
    this.editando = false;
    this.editandoId = '';
    this.dialogVisible = true;
  }

  editar(p: Produto): void {
    this.form = { nome: p.nome, preco: p.preco, unidade: p.unidade };
    this.editando = true;
    this.editandoId = p.id;
    this.dialogVisible = true;
  }

  salvar(): void {
    if (this.editando) {
      this.produtoService.update(this.editandoId, this.form);
      this.messageService.add({ severity: 'success', summary: 'Atualizado', detail: 'Produto atualizado.' });
    } else {
      this.produtoService.save(this.form);
      this.messageService.add({ severity: 'success', summary: 'Cadastrado', detail: 'Produto cadastrado.' });
    }
    this.dialogVisible = false;
    this.carregar();
  }

  confirmarDelete(p: Produto): void {
    this.confirmationService.confirm({
      message: `Deseja excluir o produto <strong>${p.nome}</strong>?`,
      header: 'Confirmar exclusão',
      icon: 'pi pi-trash',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.produtoService.delete(p.id);
        this.messageService.add({ severity: 'warn', summary: 'Excluído', detail: 'Produto excluído.' });
        this.carregar();
      }
    });
  }
}
