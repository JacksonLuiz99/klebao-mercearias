import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Fiado } from '../models/fiado.model';

const KEY = 'klebao_fiados';

@Injectable({ providedIn: 'root' })
export class FiadoService {
  constructor(private storage: StorageService) {}

  getAll(): Fiado[] {
    return this.storage.get<Fiado>(KEY);
  }

  getByCliente(clienteId: string): Fiado[] {
    return this.getAll().filter(f => f.clienteId === clienteId);
  }

  getPendentesCliente(clienteId: string): Fiado[] {
    return this.getByCliente(clienteId).filter(f => !f.pago);
  }

  getTotalPendenteCliente(clienteId: string): number {
    return this.getPendentesCliente(clienteId).reduce((acc, f) => acc + f.total, 0);
  }

  save(fiado: Omit<Fiado, 'id'>): Fiado {
    const lista = this.getAll();
    const novo: Fiado = { ...fiado, id: this.storage.generateId() };
    this.storage.set(KEY, [...lista, novo]);
    return novo;
  }

  marcarPago(id: string): void {
    const lista = this.getAll().map(f =>
      f.id === id ? { ...f, pago: true, dataPagamento: new Date().toISOString() } : f
    );
    this.storage.set(KEY, lista);
  }

  marcarTodosPagos(clienteId: string): void {
    const lista = this.getAll().map(f =>
      f.clienteId === clienteId && !f.pago
        ? { ...f, pago: true, dataPagamento: new Date().toISOString() }
        : f
    );
    this.storage.set(KEY, lista);
  }

  delete(id: string): void {
    this.storage.set(KEY, this.getAll().filter(f => f.id !== id));
  }

  getResumoMensal(mes: number, ano: number): { clienteId: string; clienteNome: string; total: number; itens: Fiado[] }[] {
    const todos = this.getAll().filter(f => {
      const d = new Date(f.data);
      return d.getMonth() === mes && d.getFullYear() === ano;
    });

    const mapa = new Map<string, { clienteId: string; clienteNome: string; total: number; itens: Fiado[] }>();
    todos.forEach(f => {
      if (!mapa.has(f.clienteId)) {
        mapa.set(f.clienteId, { clienteId: f.clienteId, clienteNome: f.clienteNome, total: 0, itens: [] });
      }
      const entry = mapa.get(f.clienteId)!;
      entry.total += f.total;
      entry.itens.push(f);
    });

    return Array.from(mapa.values()).sort((a, b) => b.total - a.total);
  }
}
