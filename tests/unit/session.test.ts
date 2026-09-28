import { beforeEach, expect, it, vi } from 'vitest';
import { createHmac } from 'node:crypto';

const { store, write } = vi.hoisted(() => ({ store: new Map<string, string>(), write: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (key: string) => (store.has(key) ? { value: store.get(key) } : undefined),
    set: write,
  }),
}));
import { sessionOwner } from '../../src/server/session';

beforeEach(() => {
  store.clear();
  write.mockReset();
  vi.stubEnv('SESSION_SECRET', 'test-secret-with-at-least-thirty-two-characters');
});
it('does not create a session on read-only requests', async () => {
  expect(await sessionOwner()).toBeNull();
  expect(write).not.toHaveBeenCalled();
});
it('creates signed HTTP-only same-site cookies', async () => {
  const owner = await sessionOwner(true);
  expect(owner).toMatch(/^[a-f0-9-]{36}$/);
  expect(write).toHaveBeenCalledWith(
    'ea-session',
    expect.stringContaining(owner + '.'),
    expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' }),
  );
  store.set('ea-session', write.mock.calls[0][1]);
  expect(await sessionOwner()).toBe(owner);
});
it('rejects a forged owner ID or signature', async () => {
  const owner = '7b3778a4-b027-424d-bb59-c25ccf18bf42';
  const signature = createHmac('sha256', process.env.SESSION_SECRET!).update(owner).digest('hex');
  store.set('ea-session', owner + '.' + signature);
  expect(await sessionOwner()).toBe(owner);
  store.set('ea-session', '8' + owner.slice(1) + '.' + signature);
  expect(await sessionOwner()).toBeNull();
  store.set('ea-session', owner + '.invalid');
  expect(await sessionOwner()).toBeNull();
});
it('refuses persistent sessions with a missing or weak secret', async () => {
  vi.stubEnv('SESSION_SECRET', 'short');
  await expect(sessionOwner(true)).rejects.toThrow('SESSION_SECRET');
});
