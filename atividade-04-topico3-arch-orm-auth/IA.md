# IA.md — Atividade 04

## Tarefa: extrair repositories · Trilha: ARQ · Rota: agente
- **Ferramenta/modelo:** ChatGPT GPT-5.6 Sol
- **Tarefa (4 campos):**
  - **Goal:** criar ports/adapters para Patient, Encounter e MedicationRequest e remover SQL dos services.
  - **Context:** AGENTS.md, INVARIANTES.md, services existentes e regra executável do dependency-cruiser.
  - **Constraints:** não alterar public/, smoke tests, gate.sh; sem bibliotecas novas; preservar contrato HTTP.
  - **Done when:** fronteiras corrigidas, regra ARQ-6 presente e gate verde.
- **Plano editado?:** mantive a tradução banco→API no adapter e tornei os ports assíncronos para preparar a troca por Prisma sem redesenhar o Service.
- **Evidência de pronto:** pendente do workflow de gate.
- **O que EU decidi:** a interface descreve necessidades do Service; não expõe query, Prisma ou SQLite.

## Tarefa: trocar persistência por Prisma · Trilha: ORM · Rota: agente
- **Ferramenta/modelo:** ChatGPT GPT-5.6 Sol
- **Tarefa (4 campos):**
  - **Goal:** colocar Prisma atrás das mesmas interfaces e versionar baseline de migrations.
  - **Context:** ports da ARQ, schema SQLite existente e prisma/LEIA-ME.md.
  - **Constraints:** Service e comportamento não mudam; sem `$queryRaw`; camelCase via @map/@@map; migrations versionadas.
  - **Done when:** adapters Prisma ativos, nenhum import de driver fora de repositories e gate verde.
- **Plano editado?:** mantive os adapters SQLite como implementações alternativas, mas o binding padrão passou para Prisma.
- **Evidência de pronto:** pendente do workflow de gate.
- **O que EU decidi:** a baseline representa o estado anterior à AUTH; `users` nasce em migration posterior.

## Tarefa: identidade e permissões · Trilha: AUTH · Rota: agente
- **Ferramenta/modelo:** ChatGPT GPT-5.6 Sol
- **Tarefa (4 campos):**
  - **Goal:** implementar register/login/me, JWT, papéis e a matriz completa.
  - **Context:** matriz do README oficial, auth.attacks.test.ts e frontend congelado.
  - **Constraints:** Argon2 antes do banco; segredo só em env; JWT sem dado sensível; 401 ≠ 403; recepção continua criando paciente.
  - **Done when:** ataques acordam sem SKIP, matriz respeitada e gate continua verde.
- **Plano editado?:** a checagem de papel ficou no middleware; a propriedade do atendimento ficou no Service de medicação.
- **Evidência de pronto:** pendente do workflow de gate.
- **O que EU decidi:** atendimento criado por profissional grava `professional_id`; atendimento criado por admin fica sem proprietário profissional.

## Tarefa: revisão adversarial · Trilha: AUTH · Rota: chat
- **Ferramenta/modelo:** ChatGPT GPT-5.6 Sol
- **Prompt (C-P-T-R-F-A):** revisar o diff contra frontend congelado, testes, matriz de permissões e fronteiras; apontar apenas riscos concretos e não sugerir camadas extras.
- **Revisão adversarial:** 
  - **Aceito:** smoke tests precisavam passar tokens depois que AUTH foi ativada; correção aplicada apenas na trilha AUTH.
  - **Recusado:** mover a regra de propriedade da prescrição para middleware; recusado porque o middleware não possui a informação de domínio necessária.
- **Evidência de pronto:** comparação de blobs confirmou **0 diferenças nos 9 arquivos de `public/`** em relação à base oficial; gate pendente do workflow.
- **O que EU decidi:** manter o Nível 3 opcional fora do escopo para não adicionar complexidade que não é necessária ao contrato obrigatório.
