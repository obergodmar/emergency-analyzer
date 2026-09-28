import { expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
import { checkOrigin, readJson } from '../../src/server/http';

it('accepts the public host when Next normalizes its internal URL', () => {
  const request = new Request('http://localhost:3100/api/simulations', {
    headers: { host: '127.0.0.1:3100', origin: 'http://127.0.0.1:3100' },
  });

  expect(() => checkOrigin(request)).not.toThrow();
});
it('accepts HTTPS terminated at the deployment proxy', () => {
  expect(() =>
    checkOrigin(
      new Request('http://localhost:3000/api/simulations', {
        headers: {
          host: 'example.com',
          origin: 'https://example.com',
          'x-forwarded-proto': 'https',
        },
      }),
    ),
  ).not.toThrow();
});
it('rejects foreign sites, ports and opaque origins', () => {
  for (const origin of ['https://evil.example', 'http://127.0.0.1:9999', 'null'])
    expect(() =>
      checkOrigin(
        new Request('http://localhost:3100/api/simulations', {
          headers: { host: '127.0.0.1:3100', origin },
        }),
      ),
    ).toThrow('Invalid origin');
});
it('enforces a streaming body size limit', async () => {
  const request = new Request('https://example.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '"' + 'x'.repeat(32768) + '"',
  });

  await expect(readJson(request)).rejects.toThrow('Request too large');
});
