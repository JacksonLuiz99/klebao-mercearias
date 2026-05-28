import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Cliente } from '../models/cliente.model';
import { Produto } from '../models/produto.model';
import { Fiado } from '../models/fiado.model';

const SEED_KEY = 'klebao_seed_v1';

@Injectable({ providedIn: 'root' })
export class SeedService {
  constructor(private storage: StorageService) {}

  inicializar(): void {
    if (localStorage.getItem(SEED_KEY)) return;

    const clientes: Cliente[] = [
      { id: 'c1', nome: 'João Silva', telefone: '65999110001', createdAt: new Date().toISOString() },
      { id: 'c2', nome: 'Maria Souza', telefone: '65999220002', createdAt: new Date().toISOString() },
      { id: 'c3', nome: 'Pedro Santos', telefone: '65999330003', createdAt: new Date().toISOString() },
    ];

    const produtos: Produto[] = [
      { id: 'p1', nome: 'Arroz 5kg', preco: 28.90, unidade: 'pct' },
      { id: 'p2', nome: 'Feijão 1kg', preco: 9.50, unidade: 'pct' },
      { id: 'p3', nome: 'Açúcar 1kg', preco: 4.80, unidade: 'pct' },
      { id: 'p4', nome: 'Óleo de Soja 900mL', preco: 7.90, unidade: 'un' },
      { id: 'p5', nome: 'Macarrão 500g', preco: 3.50, unidade: 'pct' },
      { id: 'p6', nome: 'Sal 1kg', preco: 2.90, unidade: 'pct' },
      { id: 'p7', nome: 'Refrigerante 2L', preco: 8.50, unidade: 'un' },
      { id: 'p8', nome: 'Cerveja lata', preco: 4.50, unidade: 'un' },
    ];

    const hoje = new Date();
    const diasAtras = (d: number) => new Date(hoje.getTime() - d * 86400000).toISOString();

    const fiados: Fiado[] = [
      { id: 'f1', clienteId: 'c1', clienteNome: 'João Silva', produtoId: 'p1', produtoNome: 'Arroz 5kg', precoProduto: 28.90, quantidade: 2, total: 57.80, data: diasAtras(10), pago: false },
      { id: 'f2', clienteId: 'c1', clienteNome: 'João Silva', produtoId: 'p2', produtoNome: 'Feijão 1kg', precoProduto: 9.50, quantidade: 3, total: 28.50, data: diasAtras(8), pago: false },
      { id: 'f3', clienteId: 'c1', clienteNome: 'João Silva', produtoId: 'p7', produtoNome: 'Refrigerante 2L', precoProduto: 8.50, quantidade: 1, total: 8.50, data: diasAtras(3), pago: true, dataPagamento: diasAtras(1) },
      { id: 'f4', clienteId: 'c2', clienteNome: 'Maria Souza', produtoId: 'p3', produtoNome: 'Açúcar 1kg', precoProduto: 4.80, quantidade: 2, total: 9.60, data: diasAtras(15), pago: false },
      { id: 'f5', clienteId: 'c2', clienteNome: 'Maria Souza', produtoId: 'p4', produtoNome: 'Óleo de Soja 900mL', precoProduto: 7.90, quantidade: 2, total: 15.80, data: diasAtras(12), pago: false },
      { id: 'f6', clienteId: 'c2', clienteNome: 'Maria Souza', produtoId: 'p5', produtoNome: 'Macarrão 500g', precoProduto: 3.50, quantidade: 4, total: 14.00, data: diasAtras(7), pago: false },
      { id: 'f7', clienteId: 'c3', clienteNome: 'Pedro Santos', produtoId: 'p8', produtoNome: 'Cerveja lata', precoProduto: 4.50, quantidade: 6, total: 27.00, data: diasAtras(5), pago: false },
      { id: 'f8', clienteId: 'c3', clienteNome: 'Pedro Santos', produtoId: 'p6', produtoNome: 'Sal 1kg', precoProduto: 2.90, quantidade: 1, total: 2.90, data: diasAtras(2), pago: false },
    ];

    this.storage.set<Cliente>('klebao_clientes', clientes);
    this.storage.set<Produto>('klebao_produtos', produtos);
    this.storage.set<Fiado>('klebao_fiados', fiados);
    localStorage.setItem(SEED_KEY, '1');
  }
}
