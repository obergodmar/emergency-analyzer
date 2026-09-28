-- Global retention, including rows that predate the application limit.
LOCK TABLE ea_reports IN SHARE ROW EXCLUSIVE MODE;
DELETE FROM ea_reports
WHERE id IN (
  SELECT id FROM ea_reports ORDER BY created_at DESC, id DESC OFFSET 250
);
