import { checkOrigin, failure, validId } from '@/server/http';
import { deleteReport, getReport, persistenceEnabled } from '@/server/reports';
import { sessionOwner } from '@/server/session';

export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    validId(id);
    const owner = persistenceEnabled() ? await sessionOwner() : null;
    const report = owner ? await getReport(owner, id) : null;
    return Response.json(report ? { report } : { error: 'Report not found' }, {
      status: report ? 200 : 404,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    return failure(error);
  }
}
export async function DELETE(request: Request, context: Context) {
  try {
    checkOrigin(request);
    const { id } = await context.params;
    validId(id);
    const owner = persistenceEnabled() ? await sessionOwner() : null;
    const deleted = owner ? await deleteReport(owner, id) : false;
    return deleted
      ? new Response(null, { status: 204 })
      : Response.json({ error: 'Report not found' }, { status: 404 });
  } catch (error) {
    return failure(error);
  }
}
