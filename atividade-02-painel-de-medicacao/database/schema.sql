DROP TABLE IF EXISTS medication_orders;

CREATE TABLE medication_orders (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_name    TEXT    NOT NULL,
  medication_name TEXT    NOT NULL,
  dosage          TEXT    NOT NULL,
  route           TEXT    NOT NULL,
  scheduled_at    TEXT    NOT NULL,
  notes           TEXT
);
