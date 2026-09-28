import 'server-only';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export async function sessionOwner(create = false): Promise<string | null> {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32)
    throw new Error('SESSION_SECRET must contain at least 32 characters');
  const jar = await cookies();
  const sign = (id: string) => createHmac('sha256', secret).update(id).digest('hex');
  const token = jar.get('ea-session')?.value;
  if (token) {
    const [id, signature] = token.split('.');
    if (
      /^[a-f0-9-]{36}$/.test(id) &&
      /^[a-f0-9]{64}$/.test(signature ?? '') &&
      timingSafeEqual(Buffer.from(signature), Buffer.from(sign(id)))
    )
      return id;
  }
  if (!create) return null;
  const id = randomUUID();
  jar.set('ea-session', `${id}.${sign(id)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  return id;
}
