import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ClienteService } from '../../services/cliente.service';
import { FiadoService } from '../../services/fiado.service';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, FormsModule,
    TableModule, ButtonModule, DialogModule,
    InputTextModule, ConfirmDialogModule, ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="page-header">
      <div>
        <h1><i class="pi pi-users"></i> Clientes</h1>
        <span class="subtitle">Gerencie seus clientes</span>
      </div>
      <button class="btn-primary" (click)="abrirNovo()">
        <i class="pi pi-plus"></i> Novo Cliente
      </button>
    </div>

    <div class="card-table">
      <p-table #dt [value]="clientes" [paginator]="true" [rows]="10"
               [globalFilterFields]="['nome','telefone']"
               styleClass="p-datatable-sm" responsiveLayout="scroll">
        <ng-template pTemplate="caption">
          <div class="table-caption">
            <input pInputText type="text" placeholder="Pesquisar..." class="search-input"
                   (input)="dt.filterGlobal($any($event.target).value, 'contains')" />
          </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Dívida atual</th>
            <th>Ações</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-cliente>
          <tr>
            <td>
              <div class="cliente-nome-cell">
                <div class="avatar">{{ cliente.nome.charAt(0).toUpperCase() }}</div>
                {{ cliente.nome }}
              </div>
            </td>
            <td>{{ cliente.telefone || '—' }}</td>
            <td>
              <span [class]="getDivida(cliente.id) > 0 ? 'badge-red' : 'badge-green'">
                {{ getDivida(cliente.id) | currency:'BRL' }}
              </span>
            </td>
            <td>
              <div class="actions">
                <button class="btn-icon btn-edit" (click)="editar(cliente)" title="Editar">
                  <i class="pi pi-pencil"></i>
                </button>
                <button class="btn-icon btn-delete" (click)="confirmarDelete(cliente)" title="Excluir">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="4" class="empty-row">Nenhum cliente cadastrado.</td></tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [(visible)]="dialogVisible" [header]="editando ? 'Editar Cliente' : 'Novo Cliente'"
              [modal]="true" [style]="{width: '420px'}" [draggable]="false">
      <div class="form-group">
        <label>Nome *</label>
        <input pInputText [(ngModel)]="form.nome" placeholder="Nome do cliente" class="w-full" />
      </div>
      <div class="form-group">
        <label>Telefone (WhatsApp)</label>
        <input pInputText [(ngModel)]="form.telefone" placeholder="Ex: 65999999999" class="w-full" />
        <small class="hint">Somente números com DDD (ex: 65999999999)</small>
      </div>
      <ng-template pTemplate="footer">
        <button class="btn-secondary" (click)="dialogVisible = false">Cancelar</button>
        <button class="btn-primary" (click)="salvar()" [disabled]="!form.nome.trim()">Salvar</button>
      </ng-template>
    </p-dialog>
  `,
  styleUrl: './clientes.component.scss'
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  dialogVisible = false;
  editando = false;
  form = { nome: '', telefone: '' };
  editandoId = '';

  constructor(
    private clienteService: ClienteService,
    private fiadoService: FiadoService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void { this.carregar(); }

  carregar(): void { this.clientes = this.clienteService.getAll(); }

  getDivida(id: string): number { return this.fiadoService.getTotalPendenteCliente(id); }

  abrirNovo(): void {
    this.form = { nome: '', telefone: '' };
    this.editando = false;
    this.editandoId = '';
    this.dialogVisible = true;
  }

  editar(c: Cliente): void {
    this.form = { nome: c.nome, telefone: c.telefone };
    this.editando = true;
    this.editandoId = c.id;
    this.dialogVisible = true;
  }

  salvar(): void {
    if (this.editando) {
      this.clienteService.update(this.editandoId, this.form);
      this.messageService.add({ severity: 'success', summary: 'Atualizado', detail: 'Cliente atualizado com sucesso.' });
    } else {
      this.clienteService.save(this.form);
      this.messageService.add({ severity: 'success', summary: 'Cadastrado', detail: 'Cliente cadastrado com sucesso.' });
    }
    this.dialogVisible = false;
    this.carregar();
  }

  confirmarDelete(c: Cliente): void {
    this.confirmationService.confirm({
      message: `Deseja excluir o cliente <strong>${c.nome}</strong>? Os fiados relacionados serão mantidos.`,
      header: 'Confirmar exclusão',
      icon: 'pi pi-trash',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.clienteService.delete(c.id);
        this.messageService.add({ severity: 'warn', summary: 'Excluído', detail: 'Cliente excluído.' });
        this.carregar();
      }
    });
  }
}
