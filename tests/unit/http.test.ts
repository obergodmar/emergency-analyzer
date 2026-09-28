import { expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
import { checkOrigin, readJson, failure } from '../../src/server/http';
import { ConfigurationError } from '../../src/server/configuration-error';

it('logs safe configuration diagnostics without exposing values to the client', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});

  try {
    const response = failure(new ConfigurationError('INVALID_DATABASE_URL'), 'save-report');

    expect(response.status).toBe(503);
    expect(log).toHaveBeenCalledWith('Emergency Analyzer request failed:', {
      stage: 'save-report',
      kind: 'ConfigurationError',
      code: 'INVALID_DATABASE_URL',
    });
    expect(await response.text()).not.toContain('INVALID_DATABASE_URL');
  } finally {
    log.mockRestore();
  }
});

it('logs SQLSTATE without driver messages or connection credentials', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});

  try {
    const error = Object.assign(new Error('postgresql://user:secret@example.com/db'), {
      code: '42P01',
    });
    const response = failure(error, 'save-report');

    expect(log.mock.calls[0][1]).toMatchObject({ stage: 'save-report', code: '42P01' });
    expect(JSON.stringify(log.mock.calls)).not.toContain('secret');
    expect(await response.text()).not.toContain('secret');
  } finally {
    log.mockRestore();
  }
});

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
