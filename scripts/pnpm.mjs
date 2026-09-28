// Vercel's build image may provide an older pnpm. Bootstrap the repository's exact version.
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const { packageManager } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);

if (!/^pnpm@\d+\.\d+\.\d+$/.test(packageManager)) {
  throw new Error('packageManager must pin an exact pnpm version');
}

const inNix = Boolean(process.env.DEVENV_ROOT || process.env.IN_NIX_SHELL);
const args = process.argv.slice(2);
const result = spawnSync(
  inNix ? 'pnpm' : 'npx',
  inNix ? args : ['--yes', `--package=${packageManager}`, 'pnpm', ...args],
  {
    stdio: 'inherit',
  },
);

if (result.error) throw result.error;

process.exit(result.status ?? 1);
