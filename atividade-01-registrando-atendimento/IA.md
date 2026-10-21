# IA.md — Registro de uso de IA

## Interação 1
- **Ferramenta:** ChatGPT
- **Objetivo:** implementar o recurso Encounter de ponta a ponta sem adicionar bibliotecas fora do escopo.
- **Decisão:** parcial. Mantida a arquitetura simples de um único `server.ts`, SQL explícito com `better-sqlite3`, `fetch` somente em `public/js/api.js` e frontend em JavaScript ES Modules puro.
- **V.E.R.M.:** o código foi revisado contra o enunciado, reduzido ao escopo da semana e as decisões foram registradas antes do commit.

## Interação 2
- **Ferramenta:** ChatGPT
- **Objetivo:** implementar os níveis 2 e 3 da Atividade 01.
- **Decisão:** aceita com revisão: tela de detalhe, formulário, mensagens de erro e 404, componente `.encounter-item`, estados de carregamento/erro, ordenação por data no SQL e contador derivado de atendimentos.
- **Validação estática:** todo `fetch` permanece em `public/js/api.js`; SQL das rotas usa parâmetros; `notes` vazio é normalizado para `null`; a tabela `encounters` possui FK para `patients`.
- **Limitação de validação:** no ambiente usado durante esta interação, `npm install` não concluiu por timeout durante a instalação das dependências nativas. Por isso não foi registrada uma saída falsa de `npm run check` ou de teste HTTP como evidência de sucesso. Antes da entrega final, executar `npm install`, `npm run db:reset`, `npm run check`, `npm run dev` e os casos de `requests.http`.
