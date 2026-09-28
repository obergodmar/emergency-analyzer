import { randomUUID } from 'node:crypto';
import { inputSchema } from '@/core/simulation/schema';
import { simulate } from '@/core/simulation/engine';
import { checkOrigin, failure, readJson } from '@/server/http';
import { listReports, persistenceEnabled, saveReport } from '@/server/reports';
import { sessionOwner } from '@/server/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const persistent = persistenceEnabled();
    const owner = persistent ? await sessionOwner() : null;
    return Response.json(
      { reports: owner ? await listReports(owner) : [], persistent },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const input = inputSchema.parse(await readJson(request));
    const report = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      input,
      result: simulate(input),
    };
    const persistent = persistenceEnabled();
    if (persistent) await saveReport((await sessionOwner(true))!, report);
    return Response.json(
      { report, persistent },
      { status: 201, headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    return failure(error);
  }
}
