import { readFile } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';
if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL before running ea-db-migrate');
const sql = neon(process.env.DATABASE_URL);
const migration = await readFile(new URL('../migrations/001_reports.sql', import.meta.url), 'utf8');
await sql.transaction(
  migration
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean)
    .map((statement) => sql.query(statement)),
);
console.log('Report schema ready.');
