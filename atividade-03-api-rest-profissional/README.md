# Atividade 03 — API REST Profissional

Programação para Internet II — IFPI, ADS IV, 2026.2.

Refatoração do Mini-Prontuário para arquitetura em camadas, tratamento centralizado de erros, validação com Zod e upload seguro de foto com Multer.

## Como executar

```bash
npm install
npm run db:reset
npm run check
npm run dev
```

Abra `http://localhost:3000` e rode os blocos de `requests.http`.

## Arquitetura

```text
HTTP → Route → Controller → Service → SQLite
```

- **Route:** método + caminho + middlewares.
- **Controller:** traduz HTTP ↔ domínio.
- **Service:** regras de negócio, SQL e tradução snake_case → camelCase.
- **errorHandler:** único ponto que formata erros.

## Nível 1

- Patient e Encounter separados em Route / Controller / Service.
- `mergeParams: true` em Encounter.
- `server.ts` sem SQL e sem regra de negócio.
- Hierarquia `HttpError` para 400, 404, 409, 413 e 422.
- Contrato central `{ error: { message, statusCode, details } }`.
- Zod na criação de paciente e middleware genérico de validação.

## Nível 2

- `POST /api/patients/:id/photo`.
- Multer com `diskStorage`.
- Nome gerado por UUID; nome original do cliente não compõe o caminho.
- JPEG/PNG apenas.
- Limite de 2 MB.
- 422 sem arquivo, 413 arquivo grande e 404 paciente inexistente.
- Frontend com `FormData` sem Content-Type manual.
- Preview local com `URL.createObjectURL()`.
- `renderApiError()` para o contrato central.

## Nível 3 — decisão arquitetural

A fronteira foi traçada pelo tipo de decisão. O controller conhece HTTP: `request.params.id`, `request.file` e status de sucesso. O service recebe valores do domínio e decide regras como “CNS duplicado é conflito” ou “paciente inexistente não pode receber foto”. No upload, `patientsController.uploadPhoto` verifica se o middleware entregou um arquivo e extrai o filename; `patientsService.setPhoto` verifica o paciente, executa o UPDATE e devolve o paciente atualizado. Assim o service não conhece Express nem multipart.

## Auditoria de segurança do upload

- [x] somente `image/jpeg` e `image/png`;
- [x] limite de 2 MB;
- [x] nome de arquivo gerado no servidor;
- [x] diretório de upload fixo;
- [x] FormData sem Content-Type manual no navegador;
- [ ] ainda não há autenticação/autorização;
- [ ] upload para id inexistente pode deixar arquivo órfão porque o Multer grava antes da regra de domínio.

## Validação

A sintaxe de `server.ts` e dos arquivos JS foi verificada. Também foi conferido que não há `db.prepare` fora dos Services/DB, não há resposta manual de erro fora do `errorHandler`, e os `fetch` do frontend ficam apenas em `api.js`. O schema/seed foi executado em SQLite e o update de `photo_path` foi confirmado. Neste ambiente, `npm install` não concluiu dentro do limite por causa da instalação de dependências nativas; por isso `npm run check` e os requests reais devem ser executados numa máquina com as dependências totalmente instaladas antes da entrega.
