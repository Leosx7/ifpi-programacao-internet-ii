# Atividade 03 — API REST Profissional

Programação para Internet II — IFPI, ADS IV, 2026.2.

Esta atividade usa **o projeto final da Atividade A como base**. O comportamento de Patient e Encounter foi preservado e reorganizado conforme o roteiro da Atividade C.

## Evolução em relação à Atividade A

Antes, as regras de Patient/Encounter e o SQL estavam concentrados em `src/server.ts`. Agora o mesmo domínio segue:

```text
Route → Controller → Service → SQLite
```

O frontend da Atividade A também foi preservado: busca/filtro de pacientes, detalhe do paciente, listagem e cadastro de atendimentos. Sobre essa base foram adicionados cadastro de paciente com erro estruturado e upload de foto.

## Como executar

```bash
npm install
npm run db:reset
npm run check
npm run dev
```

Depois rode `requests.http` do início ao fim.

## Nível 1 — Essencial

- Patient em `routes/patients.routes.ts`, `controllers/patients.controller.ts` e `services/patients.service.ts`.
- Encounter em `routes/encounters.routes.ts`, `controllers/encounters.controller.ts` e `services/encounters.service.ts`.
- `Router({ mergeParams: true })` para Encounter.
- Service concentra SQL, regras e tradução `snake_case → camelCase`.
- `HttpError` centraliza 400, 404, 409, 413 e 422.
- `errorHandler` é o único ponto que formata falhas HTTP.
- Zod valida `name`, `birthDate` e `nationalId` na criação de paciente.
- `validate(schema)` transforma erros do Zod em `BadRequestError` com `details`.

## Nível 2 — Proficiente

- `POST /api/patients/:id/photo`.
- Multer com `diskStorage`.
- Nome gerado pelo servidor.
- Somente JPEG e PNG.
- Limite de 2 MB.
- 404 para paciente inexistente.
- 422 sem arquivo/tipo inválido.
- 413 para arquivo grande.
- `photoUrl` no paciente atualizado.
- Frontend usa `FormData` sem definir `Content-Type`.
- Preview local com `URL.createObjectURL`.
- `renderApiError(body)` interpreta `{ error: { message, details } }`.

## Nível 3 — decisão arquitetural

A fronteira Controller/Service foi definida pelo tipo de conhecimento necessário. O Controller conhece Express: lê `request.params`, `request.body` e `request.file`, chama o Service e escolhe apenas o status de sucesso. O Service não conhece `Request` nem `Response`; ele decide regras como CNS duplicado, paciente inexistente, validação de Encounter e operações SQL. No upload, o Controller verifica se o Multer entregou arquivo e repassa apenas `id` e `filename`; o Service verifica o paciente, atualiza `photo_path` e devolve o domínio traduzido.

## Auditoria de segurança do upload

- [x] JPEG/PNG filtrados por MIME.
- [x] limite de 2 MB.
- [x] nome gerado no servidor, sem usar o nome original.
- [x] diretório fixo de upload.
- [x] frontend não define manualmente o boundary multipart.
- [ ] ainda não existe autenticação/autorização.
- [ ] um upload para paciente inexistente pode deixar arquivo órfão, pois o Multer grava antes da regra do Service.

## Preservação da Atividade A

A listagem de pacientes continua devolvendo `encounterCount`; o detalhe ainda busca Patient e Encounters; o cadastro de Encounter mantém `notes` vazio como `null` e ordenação por `started_at DESC, id DESC`. Ou seja, a Atividade C refatora e estende a A em vez de substituí-la por outro projeto.

## Validação

Antes da entrega, o checklist oficial pede `npm run check`, blocos 1–13 de `requests.http`, ausência de respostas manuais de erro fora do `errorHandler` e teste de upload com sucesso e falhas.
