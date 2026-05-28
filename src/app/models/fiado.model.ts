export interface Fiado {
  id: string;
  clienteId: string;
  clienteNome: string;
  produtoId: string;
  produtoNome: string;
  precoProduto: number;
  quantidade: number;
  total: number;
  data: string;
  pago: boolean;
  dataPagamento?: string;
}
