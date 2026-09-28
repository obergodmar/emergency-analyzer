CREATE TABLE IF NOT EXISTS ea_reports (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  input jsonb NOT NULL,
  result jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS ea_reports_owner_created_idx ON ea_reports (owner_id, created_at DESC);
