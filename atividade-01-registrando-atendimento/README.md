# Atividade 01 — Registrando o Atendimento

Programação para Internet II — IFPI, ADS IV, 2026.2.

## Como rodar

```bash
node -v
npm install
npm run db:reset
npm run check
npm run dev
```

A aplicação fica disponível em `http://localhost:3000`.

## Nível alcançado

**Nível 3 — Avançado**, incluindo os requisitos dos níveis 1 e 2.

### Nível 1
- tabela `encounters` com chave estrangeira para `patients`;
- `GET /api/patients/:id/encounters`;
- `POST /api/patients/:id/encounters`;
- validação de `chiefComplaint` e `startedAt`;
- 404 para paciente inexistente;
- SQL parametrizado;
- casos de sucesso e erro em `requests.http`;
- `notes` vazio salvo como `null`.

### Nível 2
- tela de detalhe do paciente;
- lista de atendimentos;
- formulário para registrar atendimento;
- mensagens de erro vindas do backend;
- tratamento amigável de 404;
- componente `.encounter-item` usando BEM;
- layout responsivo e mobile-first;
- chamadas `fetch` concentradas exclusivamente em `public/js/api.js`.

### Nível 3
- estados de carregamento, erro e vazio tratados separadamente;
- atendimentos ordenados no SQL por `started_at DESC`;
- contador de atendimentos derivado por consulta, sem ser armazenado no banco;
- fluxo documentado abaixo.

## Decisão de ordenação

A ordenação foi feita no SQL com `ORDER BY started_at DESC, id DESC`. Como a data é armazenada em formato ISO `AAAA-MM-DDTHH:MM`, a ordem textual coincide com a ordem cronológica. A API já entrega os dados na ordem esperada, evitando repetir essa regra em clientes diferentes.

## Fluxo

```text
evento do usuário
      ↓
    app.js
      ↓
estado / ação
      ↓
    render
      ↓
   api.js
      ↓
HTTP / Express
      ↓
better-sqlite3
      ↓
    SQLite
```

## Autoavaliação

O ponto mais delicado foi adicionar o recurso de atendimento sem espalhar chamadas de rede pelo frontend. Também foi importante validar `startedAt` e `chiefComplaint` no backend, independentemente das validações do HTML. A ordenação foi colocada no SQL por ser uma propriedade natural da consulta. O contador de atendimentos é derivado com `COUNT`, sem duplicar esse dado no banco. Se a atividade fosse reiniciada, eu escreveria primeiro todos os contratos HTTP e casos de erro e só depois implementaria a interface.
