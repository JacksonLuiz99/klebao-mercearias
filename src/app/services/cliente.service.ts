import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Cliente } from '../models/cliente.model';

const KEY = 'klebao_clientes';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  constructor(private storage: StorageService) {}

  getAll(): Cliente[] {
    return this.storage.get<Cliente>(KEY);
  }

  getById(id: string): Cliente | undefined {
    return this.getAll().find(c => c.id === id);
  }

  save(cliente: Omit<Cliente, 'id' | 'createdAt'>): Cliente {
    const lista = this.getAll();
    const novo: Cliente = {
      ...cliente,
      id: this.storage.generateId(),
      createdAt: new Date().toISOString(),
    };
    this.storage.set(KEY, [...lista, novo]);
    return novo;
  }

  update(id: string, dados: Partial<Cliente>): void {
    const lista = this.getAll().map(c => (c.id === id ? { ...c, ...dados } : c));
    this.storage.set(KEY, lista);
  }

  delete(id: string): void {
    this.storage.set(KEY, this.getAll().filter(c => c.id !== id));
  }
}
