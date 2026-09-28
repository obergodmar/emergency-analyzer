import 'server-only';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function readJson(request: Request) {
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    throw new HttpError(415, 'JSON required');
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'Body required');
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > 32768) {
      await reader.cancel();
      throw new HttpError(413, 'Request too large');
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
  } catch {
    throw new HttpError(400, 'Invalid JSON');
  }
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return;
  const url = new URL(request.url);
  // Next may normalize request.url to localhost. Host is the browser-facing authority.
  const host = request.headers.get('host') ?? url.host;
  const forwardedProtocol = request.headers.get('x-forwarded-proto');
  const protocol =
    forwardedProtocol === 'https' || forwardedProtocol === 'http'
      ? `${forwardedProtocol}:`
      : url.protocol;
  if (origin !== `${protocol}//${host}`) throw new HttpError(403, 'Invalid origin');
}
export function failure(error: unknown) {
  if (error instanceof ZodError)
    return Response.json(
      { error: 'Invalid simulation settings', issues: error.issues },
      { status: 400 },
    );
  if (error instanceof HttpError)
    return Response.json({ error: error.message }, { status: error.status });
  // Do not return driver errors, connection strings, or submitted content to the browser.
  console.error(
    'Emergency Analyzer request failed:',
    error instanceof Error ? error.name : 'UnknownError',
  );
  return Response.json(
    { error: 'Service unavailable. Check server configuration.' },
    { status: 503 },
  );
}
export function validId(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))
    throw new HttpError(400, 'Invalid report ID');
}
