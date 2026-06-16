import { NextRequest, NextResponse } from 'next/server';
import { getCurrentDbUserOrThrow } from '@/lib/users';
import { reorderBundles } from '@/lib/dal/bundles';

export async function PATCH(req: NextRequest) {
  const user = await getCurrentDbUserOrThrow();
  if (user.role !== 'ADMIN_IT' && user.role !== 'ADMIN_KK') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { orderedIds } = await req.json();
  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: 'orderedIds must be an array' }, { status: 400 });
  }
  await reorderBundles(orderedIds);
  return NextResponse.json({ ok: true });
}
