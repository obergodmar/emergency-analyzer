export function GET() {
  return Response.json({
    status: 'ok',
    modelVersion: 'legacy-corrected-v2',
    dataVersion: 'legacy-2020',
  });
}
