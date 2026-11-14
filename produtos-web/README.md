# produtos-web

Projeto React + Vite + TypeScript baseado no tutorial oficial **Thinking in React**.

## Objetivo

Implementar a tabela de produtos pesquisável do tutorial seguindo a mesma decomposição conceitual:

- `FilterableProductTable`
- `SearchBar`
- `ProductTable`
- `ProductCategoryRow`
- `ProductRow`

O estado mínimo fica no componente ancestral comum:

- `filterText`
- `inStockOnly`

A lista filtrada não é armazenada em estado; ela é derivada a partir de `products`, `filterText` e `inStockOnly`.

## Tecnologias

- React 19
- Vite
- TypeScript em modo estrito
- CSS Modules

## Executar localmente

Requer Node.js 22.12+.

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
npm run preview
```

## Estrutura

```text
src/
├── components/
│   ├── FilterableProductTable.tsx
│   ├── SearchBar.tsx
│   ├── ProductTable.tsx
│   ├── ProductCategoryRow.tsx
│   └── ProductRow.tsx
├── data/
│   └── products.ts
├── styles/
│   └── global.css
├── types/
│   └── Product.ts
├── App.tsx
└── main.tsx
```

## Referência

Tutorial oficial React: https://react.dev/learn/thinking-in-react
