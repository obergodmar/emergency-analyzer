import { readFile, readdir } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL)
  throw new Error('Set DATABASE_URL before running scripts/migrate.mjs');

let sql;

try {
  sql = neon(process.env.DATABASE_URL.trim());
} catch {
  throw new Error(
    'INVALID_DATABASE_URL: provide a PostgreSQL URL without psql or surrounding quotes.',
  );
}

const directory = new URL('../migrations/', import.meta.url);
const files = (await readdir(directory)).filter((name) => /^\d+_.*\.sql$/.test(name)).sort();
const migration = (
  await Promise.all(files.map((name) => readFile(new URL(name, directory), 'utf8')))
).join('\n');

const statements = migration
  .split(';')
  .map((statement) => statement.trim())
  .filter(Boolean)
  .map((statement) => sql.query(statement));

try {
  await sql.transaction([sql`SELECT pg_advisory_xact_lock(17012020)`, ...statements], {
    isolationLevel: 'ReadCommitted',
  });
} catch (error) {
  const code =
    typeof error?.code === 'string' && /^[0-9A-Z]{5}$/.test(error.code)
      ? error.code
      : 'DATABASE_REQUEST_FAILED';

  // Connection strings can appear in driver errors; only emit a safe code.
  throw new Error(
    `Database migration failed (${code}). Check Neon connectivity and database permissions.`,
  );
}

console.log('Report schema ready.');
