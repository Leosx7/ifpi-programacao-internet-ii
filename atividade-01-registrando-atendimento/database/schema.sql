-- ============================================================
-- Mini-Prontuario - Esquema do banco
-- ============================================================
DROP TABLE IF EXISTS encounters;
DROP TABLE IF EXISTS patients;

CREATE TABLE patients (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  birth_date  TEXT    NOT NULL,
  national_id TEXT    NOT NULL UNIQUE,
  active      INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE encounters (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id      INTEGER NOT NULL,
  started_at      TEXT    NOT NULL,
  chief_complaint TEXT    NOT NULL,
  notes           TEXT,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
