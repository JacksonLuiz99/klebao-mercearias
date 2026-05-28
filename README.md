# Klebão Mercearias — Sistema de Controle de Fiados

Sistema web para controle de fiados de mercearia. Permite cadastrar clientes e produtos, lançar fiados, acompanhar dívidas por cliente e cobrar via WhatsApp.

## Funcionalidades

- **Dashboard** — visão geral dos devedores e total em aberto
- **Fiados** — lançamento por cliente, marcar como pago, quitar tudo e cobrar via WhatsApp
- **Clientes** — cadastro com nome e telefone (WhatsApp)
- **Produtos** — catálogo com nome, preço e unidade
- **Relatório mensal** — consolidado por mês/ano com exportação via impressão/PDF

## Tecnologias

- Angular 19 (standalone components, lazy loading)
- PrimeNG 21 + @primeuix/themes (Aura)
- LocalStorage como banco de dados (sem backend)
- SCSS

## Rodando localmente

```bash
npm install
ng serve
```

Acesse `http://localhost:4200`

## Build de produção

```bash
npm run build
```

Saída em `dist/klebao-mercearias/browser/`

## Deploy na Vercel

O projeto já está configurado via `vercel.json`. Basta:

1. Fazer push para o GitHub
2. Importar o repositório na [Vercel](https://vercel.com)
3. As configurações de build são detectadas automaticamente
