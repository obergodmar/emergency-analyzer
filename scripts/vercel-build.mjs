import { spawnSync } from 'node:child_process';

function run(script, args = []) {
  const result = spawnSync(process.execPath, [script, ...args], { stdio: 'inherit' });

  if (result.error) throw result.error;

  if (result.status !== 0) throw new Error(`${script} failed (${result.status ?? result.signal})`);
}

if (process.env.VERCEL_ENV === 'production' && process.env.DATABASE_URL) {
  run('scripts/migrate.mjs');
} else {
  console.log('Automatic database migrations skipped: production with DATABASE_URL is required.');
}

run('scripts/pnpm.mjs', ['build']);
