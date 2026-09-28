import 'server-only';
import { neon } from '@neondatabase/serverless';
import type { SimulationReport } from '@/core/simulation/types';

export const persistenceEnabled = () => Boolean(process.env.DATABASE_URL);
function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is missing');
  return neon(process.env.DATABASE_URL);
}
export async function saveReport(owner: string, report: SimulationReport) {
  const sql = db();
  await sql`INSERT INTO ea_reports (id, owner_id, created_at, input, result) VALUES (${report.id}, ${owner}, ${report.createdAt}, ${JSON.stringify(report.input)}::jsonb, ${JSON.stringify(report.result)}::jsonb)`;
}
export async function listReports(owner: string): Promise<SimulationReport[]> {
  const sql = db();
  return (await sql`SELECT id, created_at::text AS "createdAt", input, result FROM ea_reports WHERE owner_id = ${owner} ORDER BY created_at DESC LIMIT 200`) as SimulationReport[];
}
export async function getReport(owner: string, id: string): Promise<SimulationReport | null> {
  const sql = db();
  const rows =
    await sql`SELECT id, created_at::text AS "createdAt", input, result FROM ea_reports WHERE owner_id = ${owner} AND id = ${id}::uuid`;
  return (rows[0] as SimulationReport | undefined) ?? null;
}
export async function deleteReport(owner: string, id: string) {
  const sql = db();
  const rows =
    await sql`DELETE FROM ea_reports WHERE owner_id = ${owner} AND id = ${id}::uuid RETURNING id`;
  return rows.length > 0;
}
