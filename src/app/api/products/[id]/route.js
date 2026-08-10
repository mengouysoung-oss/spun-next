import { NextResponse } from 'next/server';
import { db } from '@/lib/db.js';
import { requireAdmin, ApiError } from '@/lib/auth.js';
import { withApi } from '@/lib/withApi.js';

function serialize(p) {
  return { ...p, sizes: JSON.parse(p.sizes), colors: JSON.parse(p.colors) };
}

export const PUT = withApi(async (request, { params }) => {
  requireAdmin(request);
  const { id } = await params;
  const { name, category, price, description, image, sizes, colors, customizable, is_new, is_bestseller, stock } = await request.json();
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) throw new ApiError(404, 'Product not found');
  db.prepare(`UPDATE products SET name=?, category=?, price=?, description=?, image=?, sizes=?, colors=?, customizable=?, is_new=?, is_bestseller=?, stock=? WHERE id=?`)
    .run(
      name ?? existing.name, category ?? existing.category, price ?? existing.price,
      description ?? existing.description, image ?? existing.image,
      JSON.stringify(sizes ?? JSON.parse(existing.sizes)), JSON.stringify(colors ?? JSON.parse(existing.colors)),
      customizable != null ? (customizable ? 1 : 0) : existing.customizable,
      is_new != null ? (is_new ? 1 : 0) : existing.is_new,
      is_bestseller != null ? (is_bestseller ? 1 : 0) : existing.is_bestseller,
      stock ?? existing.stock, id
    );
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  return NextResponse.json({ product: serialize(row) });
});

export const DELETE = withApi(async (request, { params }) => {
  requireAdmin(request);
  const { id } = await params;
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  return NextResponse.json({ ok: true });
});
