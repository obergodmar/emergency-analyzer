import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const buildScript = new URL('../../scripts/vercel-build.mjs', import.meta.url).href;

const { spawn } = vi.hoisted(() => ({ spawn: vi.fn() }));

vi.mock('node:child_process', () => ({ spawnSync: spawn }));

beforeEach(() => {
  vi.resetModules();
  spawn.mockReset().mockReturnValue({ status: 0 });
  vi.stubEnv('VERCEL_ENV', 'production');
  vi.stubEnv('DATABASE_URL', 'postgresql://test:test@example.invalid/test');
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

it('runs migrations before the production build using Node.js', async () => {
  await import(buildScript);
  expect(spawn.mock.calls.map((call) => call.slice(0, 2))).toEqual([
    [process.execPath, ['scripts/migrate.mjs']],
    [process.execPath, ['scripts/pnpm.mjs', 'build']],
  ]);
});

it('does not start a build after a failed migration', async () => {
  spawn.mockReturnValueOnce({ status: 1 });
  await expect(import(buildScript)).rejects.toThrow('migrate.mjs failed');
  expect(spawn).toHaveBeenCalledTimes(1);
});

it('does not migrate the database during preview builds', async () => {
  vi.stubEnv('VERCEL_ENV', 'preview');
  await import(buildScript);
  expect(spawn.mock.calls.map((call) => call[1])).toEqual([['scripts/pnpm.mjs', 'build']]);
});

it('builds without a database when persistence is disabled', async () => {
  vi.stubEnv('DATABASE_URL', '');
  await import(buildScript);
  expect(spawn.mock.calls.map((call) => call[1])).toEqual([['scripts/pnpm.mjs', 'build']]);
});
