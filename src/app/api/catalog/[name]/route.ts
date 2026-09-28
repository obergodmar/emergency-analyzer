import { catalog, dataVersion, type CatalogName } from '@/core/catalog';

export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;

  if (!Object.hasOwn(catalog, name))
    return Response.json({ error: 'Unknown catalog' }, { status: 404 });

  const country = new URL(request.url).searchParams.get('countryId');
  const items =
    name === 'regions' && country
      ? catalog.regions.filter((r) => r.country === Number(country))
      : catalog[name as CatalogName];

  return Response.json(
    { items, dataVersion, historical: true },
    { headers: { 'Cache-Control': 'public, max-age=86400' } },
  );
}
