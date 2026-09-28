import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const directory = mkdtempSync(join(tmpdir(), 'ea-postgres-'));
const data = join(directory, 'data');
function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { stdio: 'inherit', env });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed: ${result.status}`);
}
let started = false;
try {
  run('initdb', ['-D', data, '-A', 'trust', '-U', 'postgres', '--no-locale', '--encoding=UTF8']);
  run('pg_ctl', [
    '-D',
    data,
    '-l',
    join(directory, 'postgres.log'),
    '-o',
    `-k ${directory} -h ''`,
    '-w',
    'start',
  ]);
  started = true;
  run('pnpm', ['exec', 'vitest', 'run', '--config', 'vitest.db.config.ts'], {
    ...process.env,
    PGHOST: directory,
    PGPORT: '5432',
    PGUSER: 'postgres',
    PGDATABASE: 'postgres',
    DATABASE_URL: 'postgresql://local-test-only',
  });
} finally {
  if (started) run('pg_ctl', ['-D', data, '-m', 'immediate', '-w', 'stop']);
  rmSync(directory, { recursive: true, force: true });
}
