# Painel de Medicação — Atividade B

Atividade de Programação para Internet II (IFPI) com CRUD reativo para `MedicationOrder`, usando Express, TypeScript, SQLite com `better-sqlite3` e JavaScript ES Modules puro.

## Como executar

```bash
node -v
npm install
npm run db:reset
npm run check
npm run dev
```

Acesse `http://localhost:3000`.

## Rotas

- `GET /api/medications` → 200
- `POST /api/medications` → 201 ou 400
- `GET /api/medications/:id` → 200 ou 404
- `DELETE /api/medications/:id` → 204 ou 404

## Decisões

- SQL explícito e parametrizado, sem ORM.
- Tradução de `snake_case` para `camelCase` antes de responder.
- `notes` vazio persistido como `null`.
- Frontend: `evento → ação → estado → render → tela`.
- `api.js` é o único arquivo que usa `fetch`.
- O detalhe usa uma nova chamada `GET /api/medications/:id`.
- Ordenação no SQL por `scheduled_at ASC`, porque a regra pertence à consulta e a API já entrega a coleção ordenada.

## Bônus

Incluído `GET /api/medications?patientName=Ana`, com `WHERE patient_name LIKE ?`.

## Pergunta de saída

A operação mais direta foi listar. A que exige mais cuidado é remover, porque `204` não tem corpo e o frontend precisa atualizar o estado e fechar o painel sem chamar `.json()`.

## Uso de IA

Foi usada IA para revisão e construção de uma solução de referência. O roteiro da atividade determina uso apenas em modo chat, em pequenas partes; portanto esta implementação completa deve ser estudada e validada pelo aluno antes de uma eventual entrega acadêmica.

## Validação feita neste ambiente

- Os quatro arquivos JS passaram em `node --check`.
- Foi confirmado por busca que todos os usos de `fetch` estão apenas em `public/js/api.js`.
- `npm ci` não concluiu neste ambiente por timeout durante a instalação de dependências nativas; por isso não foi registrada evidência falsa de `npm run db:reset` ou `npm run check`.
