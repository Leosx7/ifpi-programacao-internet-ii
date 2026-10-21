# Atividade 04 — Arquiteturas em Camadas, ORM e Autenticação

Programação para Internet II — IFPI, ADS IV, 2026.2.

Base oficial: `topico3/base-mini-prontuario-t3`.

## Resultado

Foi implementado o **Nível 1 (ARQ + ORM)** e o **Nível 2 (AUTH)**. O Nível 3 é opcional e não é reivindicado nesta entrega.

### Trilha ARQ

- ports `PatientsRepository`, `EncountersRepository` e `MedicationsRepository`;
- adapters SQLite com todo SQL retirado dos Services;
- violação Controller → banco removida de `encounters.controller.ts`;
- violação Service → Express removida de `medications.service.ts`;
- regra `so-repositories-importam-o-driver` adicionada ao dependency-cruiser;
- nenhuma alteração em `public/`.

### Trilha ORM

- `prisma/schema.prisma` mapeando camelCase ↔ snake_case com `@map` / `@@map`;
- baseline de migrations versionada;
- adapters Prisma implementando **as mesmas interfaces** da ARQ;
- Services continuam dependendo dos ports, não de Prisma;
- `db:reset` passa a usar `prisma migrate reset` + seed Prisma.

### Trilha AUTH

- `UnauthorizedError` (401) e `ForbiddenError` (403);
- tabela `users` criada por migration Prisma;
- `register`, `login` e `me`;
- senha hasheada com Argon2 antes do INSERT;
- JWT com apenas `id`, `name` e `role`;
- `requireAuth` traduz token ausente, adulterado ou expirado para 401;
- autorização por papel nas rotas;
- `recepcao` pode criar paciente/foto, mas não registrar atendimento nem ver/prescrever medicação;
- `admin` pode registrar atendimento e ver prescrições, mas não prescrever;
- `profissional` só prescreve no atendimento que ele próprio registrou.

## Por que o login não valida senha mínima com 400?

No **registro**, o tamanho mínimo é uma regra para criar uma nova credencial e pode ser rejeitado como entrada inválida. No **login**, rejeitar previamente uma senha curta com 400 criaria uma resposta semanticamente diferente do caso de credenciais incorretas e daria ao atacante um sinal extra para classificar tentativas. Por isso o login aceita qualquer string como tentativa de credencial e responde **401 com a mesma mensagem genérica** quando e-mail/senha não autenticam.

## Decisão arquitetural mais difícil

A decisão mais delicada foi a última linha da matriz: “profissional só prescreve no atendimento que registrou”. Colocar isso em `requireRoles("profissional")` seria insuficiente: o middleware sabe o papel, mas não sabe quem é o dono do atendimento. A rota filtra o papel; o `medications.service.ts` consulta o atendimento e compara `professionalId` com `actor.id`. Assim a regra de acesso que depende de estado do domínio fica no Service.

## Como executar

Crie `.env` a partir de `.env.example` e troque o segredo:

```bash
cp .env.example .env
# edite JWT_SECRET com valor forte
npm install
npm run db:reset
npm run gate
npm run dev
```

O frontend não foi alterado. Ao existir AUTH, a tela de login já fornecida passa a ser usada automaticamente.

## Revisão adversarial

**Aceito:** depois da AUTH, os smoke tests antigos sem token deixariam de representar o comportamento protegido e fariam o gate regredir. Eles foram adaptados somente na etapa AUTH, mantendo as mesmas invariantes funcionais e adicionando credenciais adequadas.

**Recusado:** colocar a checagem “é o profissional dono do atendimento?” em middleware. Motivo: isso exigiria consulta de domínio na borda e misturaria autorização por papel com regra de negócio.

## Autoavaliação

A parte mais difícil foi manter três ideias separadas: autenticação, autorização por papel e autorização por domínio. Elas podem todas terminar em 401/403, mas pertencem a lugares diferentes da arquitetura. Outro ponto importante foi desenhar os repositories de modo assíncrono já na trilha ARQ, permitindo que o adapter Prisma substituísse o SQLite sem mudar a assinatura observada pelos Services. Se eu começasse de novo, escreveria primeiro uma tabela curta “decisão → camada → teste que prova” para cada item da matriz de permissões; isso reduziria ainda mais o risco de colocar uma regra correta no lugar errado.

## Evidência

A evidência completa está em `IA.md`. No workflow [Atividade 04 - Gate](https://github.com/Leosx7/ifpi-programacao-internet-ii/actions/runs/39653898232), o banco foi recriado por migrations, tipos e arquitetura passaram, os **18 testes passaram com 0 falhas e 0 SKIP**, o gitleaks não encontrou segredos e o script terminou com **GATE VERDE**.
