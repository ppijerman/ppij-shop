import { db } from '@/lib/db';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const result = await db.query(
    `SELECT image_data, image_content_type FROM bundles WHERE id = $1 LIMIT 1`,
    [id],
  );

  const row = result.rows[0];

  if (!row?.image_data || !row.image_content_type) {
    return new Response('Image not found.', { status: 404 });
  }

  return new Response(new Uint8Array(row.image_data), {
    headers: {
      'Content-Type': row.image_content_type,
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}
