import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import { startServer, jsonRequest, randomCns } from "./helpers";

let base = "";
let server: Server;
let api: ReturnType<typeof jsonRequest>;
let profissionalToken = "";
let recepcaoToken = "";

const suffix = Math.floor(Math.random() * 1e9);
const PROFISSIONAL = {
  name: "Profissional Smoke",
  email: `smoke.prof.${suffix}@teste.local`,
  password: "senha-forte-de-teste",
  role: "profissional",
};
const RECEPCAO = {
  name: "Recepcao Smoke",
  email: `smoke.recepcao.${suffix}@teste.local`,
  password: "senha-forte-de-teste",
  role: "recepcao",
};

before(async () => {
  ({ base, server } = await startServer());
  api = jsonRequest(base);

  for (const user of [PROFISSIONAL, RECEPCAO]) {
    const register = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(user),
    });
    assert.equal(register.status, 201);
  }

  profissionalToken = await login(PROFISSIONAL);
  recepcaoToken = await login(RECEPCAO);
});

after(() => server.close());

async function login(credentials: { email: string; password: string }) {
  const res = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  assert.equal(res.status, 200);
  const body = (await res.json()) as { token: string };
  return body.token;
}

function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

test("GET /api/health responde 200 ok", async () => {
  const res = await api("/api/health");
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: "ok" });
});

test("GET /api/patients devolve lista em camelCase", async () => {
  const res = await api("/api/patients", { headers: auth(recepcaoToken) });
  assert.equal(res.status, 200);
  const list = (await res.json()) as Record<string, unknown>[];
  assert.ok(list.length >= 1);
  const first = list[0]!;
  assert.ok("birthDate" in first && "nationalId" in first);
  assert.ok(!("birth_date" in first));
  assert.equal(typeof first.active, "boolean");
});

test("GET /api/patients/:id inexistente -> 404", async () => {
  const res = await api("/api/patients/999999", { headers: auth(recepcaoToken) });
  assert.equal(res.status, 404);
  const body = (await res.json()) as { error: { statusCode: number } };
  assert.equal(body.error.statusCode, 404);
});

test("POST /api/patients válido -> 201 com id gerado", async () => {
  const res = await api("/api/patients", {
    method: "POST",
    headers: auth(recepcaoToken),
    body: JSON.stringify({
      name: "Paciente Teste",
      birthDate: "1990-01-01",
      nationalId: randomCns(),
    }),
  });
  assert.equal(res.status, 201);
  const created = (await res.json()) as { id: number; active: boolean };
  assert.ok(created.id > 0);
  assert.equal(created.active, true);
});

test("POST /api/patients inválido -> 400 com details por campo", async () => {
  const res = await api("/api/patients", {
    method: "POST",
    headers: auth(recepcaoToken),
    body: JSON.stringify({ name: "   ", birthDate: "12/04/1990" }),
  });
  assert.equal(res.status, 400);
  const body = (await res.json()) as { error: { details: { field: string }[] } };
  const fields = body.error.details.map((d) => d.field);
  assert.ok(fields.includes("name"));
  assert.ok(fields.includes("birthDate"));
  assert.ok(fields.includes("nationalId"));
});

test("POST /api/patients com CNS duplicado -> 409", async () => {
  const cns = randomCns();
  const payload = {
    name: "Duplicado Um",
    birthDate: "1980-01-01",
    nationalId: cns,
  };

  const first = await api("/api/patients", {
    method: "POST",
    headers: auth(recepcaoToken),
    body: JSON.stringify(payload),
  });
  assert.equal(first.status, 201);

  const second = await api("/api/patients", {
    method: "POST",
    headers: auth(recepcaoToken),
    body: JSON.stringify(payload),
  });
  assert.equal(second.status, 409);
});

test("Encounters: lista e criação autenticadas", async () => {
  const list = await api("/api/patients/1/encounters", {
    headers: auth(recepcaoToken),
  });
  assert.equal(list.status, 200);
  assert.ok(((await list.json()) as unknown[]).length >= 1);

  const created = await api("/api/patients/1/encounters", {
    method: "POST",
    headers: auth(profissionalToken),
    body: JSON.stringify({
      startedAt: "2026-09-01T10:00",
      chiefComplaint: "Teste automatizado",
    }),
  });
  assert.equal(created.status, 201);

  const ghost = await api("/api/patients/999999/encounters", {
    headers: auth(recepcaoToken),
  });
  assert.equal(ghost.status, 404);
});

test("Medications: profissional prescreve apenas no próprio atendimento", async () => {
  const ownEncounter = await api("/api/patients/1/encounters", {
    method: "POST",
    headers: auth(profissionalToken),
    body: JSON.stringify({
      startedAt: "2026-09-01T11:00",
      chiefComplaint: "Atendimento para prescrição",
    }),
  });
  assert.equal(ownEncounter.status, 201);
  const { id: encounterId } = (await ownEncounter.json()) as { id: number };

  const list = await api(`/api/encounters/${encounterId}/medications`, {
    headers: auth(profissionalToken),
  });
  assert.equal(list.status, 200);

  const created = await api(`/api/encounters/${encounterId}/medications`, {
    method: "POST",
    headers: auth(profissionalToken),
    body: JSON.stringify({
      medication: "Paracetamol 750mg",
      dosage: "1 comprimido de 8/8h por 2 dias",
    }),
  });
  assert.equal(created.status, 201);
  const med = (await created.json()) as { encounterId: number };
  assert.equal(med.encounterId, encounterId);

  const ghost = await api("/api/encounters/999999/medications", {
    headers: auth(profissionalToken),
  });
  assert.equal(ghost.status, 404);
});

test("Upload: PNG pequeno -> 200 com photoUrl; sem arquivo -> 422", async () => {
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  const form = new FormData();
  form.append("photo", new Blob([png], { type: "image/png" }), "pixel.png");

  const ok = await fetch(`${base}/api/patients/2/photo`, {
    method: "POST",
    headers: auth(recepcaoToken),
    body: form,
  });
  assert.equal(ok.status, 200);
  const patient = (await ok.json()) as { photoUrl: string };
  assert.match(patient.photoUrl, /^\/uploads\/.+\.png$/);
  assert.ok(!patient.photoUrl.includes("pixel"));

  const empty = await fetch(`${base}/api/patients/2/photo`, {
    method: "POST",
    headers: auth(recepcaoToken),
    body: new FormData(),
  });
  assert.equal(empty.status, 422);
});

test("Upload: mimetype proibido -> 422", async () => {
  const form = new FormData();
  form.append(
    "photo",
    new Blob(["não sou uma imagem"], { type: "text/plain" }),
    "disfarce.jpg",
  );
  const res = await fetch(`${base}/api/patients/2/photo`, {
    method: "POST",
    headers: auth(recepcaoToken),
    body: form,
  });
  assert.equal(res.status, 422);
});
