import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Produto } from '../models/produto.model';

const KEY = 'klebao_produtos';

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  constructor(private storage: StorageService) {}

  getAll(): Produto[] {
    return this.storage.get<Produto>(KEY);
  }

  getById(id: string): Produto | undefined {
    return this.getAll().find(p => p.id === id);
  }

  save(produto: Omit<Produto, 'id'>): Produto {
    const lista = this.getAll();
    const novo: Produto = { ...produto, id: this.storage.generateId() };
    this.storage.set(KEY, [...lista, novo]);
    return novo;
  }

  update(id: string, dados: Partial<Produto>): void {
    const lista = this.getAll().map(p => (p.id === id ? { ...p, ...dados } : p));
    this.storage.set(KEY, lista);
  }

  delete(id: string): void {
    this.storage.set(KEY, this.getAll().filter(p => p.id !== id));
  }
}
