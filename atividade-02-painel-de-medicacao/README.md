# Painel de Medicação

Atividade B de Programação para Internet II — IFPI, 2026.2.

CRUD reativo de `MedicationOrder` com Express + TypeScript + SQLite (`better-sqlite3`) no backend e JavaScript ES Modules puro no frontend.

## Como executar

```bash
node -v          # Node 22 ou superior
npm install
npm run db:reset
npm run check
npm run dev
```

Abra <http://localhost:3000>.

## Contrato implementado

| Método | Rota | Resultado |
|---|---|---|
| GET | `/api/medications` | `200` + lista |
| POST | `/api/medications` | `201` + criado ou `400` |
| GET | `/api/medications/:id` | `200` ou `404` |
| DELETE | `/api/medications/:id` | `204` sem corpo ou `404` |

## Checklist final

- [x] `GET /api/medications` devolve os registros do banco.
- [x] A lista do frontend é carregada pela API.
- [x] O formulário cadastra uma prescrição e atualiza o estado sem recarregar a página.
- [x] Clicar em um cartão abre o detalhe usando uma nova chamada `GET /api/medications/:id`.
- [x] Id inexistente resulta em `404` tratado no frontend.
- [x] Suspender remove no backend, responde `204`, remove do estado e fecha o painel.
- [x] Todo `fetch` está exclusivamente em `public/js/api.js`.
- [x] O banco mantém os dados enquanto o servidor é reiniciado; o reset só ocorre ao executar `npm run db:reset`.
- [x] SQL parametrizado nas operações que recebem entrada.
- [x] Tradução `snake_case → camelCase` antes da resposta HTTP.
- [x] `notes` vazio é armazenado como `null`.

## Separação do frontend

O fluxo segue o padrão da disciplina:

```text
evento → ação → estado → render → tela
```

- `api.js`: única camada que chama `fetch`;
- `state.js`: guarda e altera o estado, sem acessar o DOM;
- `render.js`: desenha o estado, sem fazer requisições nem decidir regras de negócio;
- `app.js`: recebe eventos e orquestra API + estado.

## Bônus 1 — filtro por paciente

Também foi implementado:

```http
GET /api/medications?patientName=Ana
```

O filtro é feito no SQL com `WHERE patient_name LIKE ?`, mantendo o valor como parâmetro.

## Bônus 2 — ordenação justificada

A lista é ordenada no SQL por `scheduled_at ASC`. Como `scheduled_at` usa o formato ISO `AAAA-MM-DDTHH:MM`, a ordem textual também representa a ordem cronológica. Fazer isso na consulta deixa a API entregar o conjunto já ordenado e evita duplicar a mesma regra no JavaScript.

## Pergunta de saída

A operação mais simples de entender foi **listar**, pois o fluxo é direto: consulta → tradução → resposta → estado → render. A que exigiu mais atenção foi **remover**, porque uma resposta `204` não possui corpo; portanto `api.js` não pode chamar `.json()`, e a aplicação ainda precisa remover o registro do estado e fechar o painel de detalhe.

## Uso de IA

Usei IA para revisar a implementação e conferir o contrato, mas mantive as restrições da atividade: sem ORM, sem biblioteca adicional, SQL explícito/parametrizado e frontend em JavaScript puro. Uma sugestão que deve ser recusada neste exercício é adicionar React ou Prisma, porque ambos estão fora do escopo definido pelo roteiro.

## Validações realizadas neste ambiente

Foram executadas as seguintes verificações:

- `node --experimental-strip-types --check src/server.ts` → sintaxe válida;
- `node --check public/js/*.js` → sintaxe válida;
- busca por `fetch` → todas as chamadas estão somente em `public/js/api.js`;
- testes diretos de `state.js` e `render.js` → adicionar, selecionar, renderizar e remover funcionando;
- testes de `api.js` com `fetch` simulado → GET/POST/DELETE e tratamento de `404` funcionando;
- schema/seed e operações SQL testadas em SQLite → 3 registros iniciais, filtro, inserção com `notes = null` e remoção confirmados.

O `npm ci` não concluiu neste ambiente devido à instalação da dependência nativa `better-sqlite3`. Por isso a execução real do Express deve ser confirmada em uma máquina com as dependências instaladas usando os comandos da seção **Como executar**.
