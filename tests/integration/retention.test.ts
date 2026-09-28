import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { beforeEach, expect, test, vi } from 'vitest';
import type { SimulationReport } from '../../src/core/simulation/types';

vi.mock('server-only', () => ({}));
// Use the application's actual queries against PostgreSQL; only Neon HTTP transport is replaced.
vi.mock('@neondatabase/serverless', () => ({
  neon: () => {
    const sql = (strings: TemplateStringsArray, ...values: unknown[]) =>
      strings.reduce((query, part, index) => {
        if (index === values.length) return query + part;
        const value = values[index];
        return (
          query +
          part +
          (typeof value === 'number' ? value : `'${String(value).replaceAll("'", "''")}'`)
        );
      }, '');
    sql.transaction = async (queries: string[], options: { isolationLevel: string }) => {
      expect(options.isolationLevel).toBe('ReadCommitted');
      return execute(`BEGIN ISOLATION LEVEL READ COMMITTED; ${queries.join(';')}; COMMIT;`);
    };
    return sql;
  },
}));

import { saveReport } from '../../src/server/reports';
const owner = randomUUID();
async function execute(query: string) {
  const { stdout } = await promisify(execFile)('psql', [
    '-X',
    '-v',
    'ON_ERROR_STOP=1',
    '-At',
    '-c',
    query,
  ]);
  return stdout.trim();
}
function report(): SimulationReport {
  return {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    input: {},
    result: {},
  } as SimulationReport;
}
beforeEach(async () => {
  await execute('DROP TABLE IF EXISTS ea_reports');
  await execute(await readFile('migrations/001_reports.sql', 'utf8'));
  await execute(`INSERT INTO ea_reports (id, owner_id, created_at, input, result)
    SELECT gen_random_uuid(), '${owner}', '2000-01-01 00:00:00+00'::timestamptz + n * interval '1 second', '{}', '{}'
    FROM generate_series(1, 250) n`);
});
test('new report evicts oldest globally, including another owner', async () => {
  const next = report();
  await saveReport(randomUUID(), next);
  expect(await execute('SELECT count(*) FROM ea_reports')).toBe('250');
  expect(
    await execute(`SELECT count(*) FROM ea_reports WHERE created_at = '2000-01-01 00:00:01+00'`),
  ).toBe('0');
  expect(await execute(`SELECT count(*) FROM ea_reports WHERE id = '${next.id}'`)).toBe('1');
});
test('concurrent requests preserve exactly 250 rows and all new reports', async () => {
  const reports = Array.from({ length: 20 }, report);
  await Promise.all(reports.map((item) => saveReport(randomUUID(), item)));
  expect(await execute('SELECT count(*) FROM ea_reports')).toBe('250');
  expect(await execute(`SELECT count(*) FROM ea_reports WHERE created_at >= '2020-01-01'`)).toBe(
    '20',
  );
});
test('failed insert rolls back without deleting existing reports', async () => {
  await expect(saveReport('invalid-uuid', report())).rejects.toThrow();
  expect(await execute('SELECT count(*) FROM ea_reports')).toBe('250');
  expect(
    await execute(`SELECT count(*) FROM ea_reports WHERE created_at = '2000-01-01 00:00:01+00'`),
  ).toBe('1');
});
test('retention migration trims existing excess and is idempotent', async () => {
  await execute(
    `INSERT INTO ea_reports (id, owner_id, input, result) SELECT gen_random_uuid(), '${owner}', '{}', '{}' FROM generate_series(1, 30)`,
  );
  const migration = await readFile('migrations/002_report_retention.sql', 'utf8');
  await execute(`BEGIN; ${migration} COMMIT;`);
  await execute(`BEGIN; ${migration} COMMIT;`);
  expect(await execute('SELECT count(*) FROM ea_reports')).toBe('250');
});
