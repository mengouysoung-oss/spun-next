import { NextResponse } from 'next/server';
import { db } from '@/lib/db.js';
import { ApiError } from '@/lib/auth.js';
import { withApi } from '@/lib/withApi.js';

function serialize(p) {
  return { ...p, sizes: JSON.parse(p.sizes), colors: JSON.parse(p.colors) };
}

export const GET = withApi(async (request, { params }) => {
  const { slug } = await params;
  const row = db.prepare('SELECT * FROM products WHERE slug = ?').get(slug);
  if (!row) throw new ApiError(404, 'Product not found');
  return NextResponse.json({ product: serialize(row) });
});
