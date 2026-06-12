import { db } from '@/lib/db';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const result = await db.query(
    `SELECT data, content_type FROM product_images WHERE id = $1 LIMIT 1`,
    [id],
  );

  const image = result.rows[0];

  if (!image?.data || !image.content_type) {
    return new Response('Image not found.', { status: 404 });
  }

  return new Response(new Uint8Array(image.data), {
    headers: {
      'Content-Type': image.content_type,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
