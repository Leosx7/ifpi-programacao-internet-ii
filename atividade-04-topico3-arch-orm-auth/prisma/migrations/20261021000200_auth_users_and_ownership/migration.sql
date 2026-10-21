CREATE TABLE "users" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "role" TEXT NOT NULL
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

ALTER TABLE "encounters"
  ADD COLUMN "professional_id" INTEGER
  REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "idx_encounters_professional"
  ON "encounters"("professional_id");
