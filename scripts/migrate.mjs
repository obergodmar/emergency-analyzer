import { readFile, readdir } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL before running ea-db-migrate');

const sql = neon(process.env.DATABASE_URL);
const directory = new URL('../migrations/', import.meta.url);
const files = (await readdir(directory)).filter((name) => /^\d+_.*\.sql$/.test(name)).sort();
const migration = (
  await Promise.all(files.map((name) => readFile(new URL(name, directory), 'utf8')))
).join('\n');

await sql.transaction(
  migration
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean)
    .map((statement) => sql.query(statement)),
  { isolationLevel: 'ReadCommitted' },
);
console.log('Report schema ready.');
