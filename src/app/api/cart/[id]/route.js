import { NextResponse } from 'next/server';
import { db } from '@/lib/db.js';
import { requireUser, ApiError } from '@/lib/auth.js';
import { withApi } from '@/lib/withApi.js';

function withProduct(row) {
  const product = db.prepare('SELECT id, name, price, image, slug FROM products WHERE id = ?').get(row.product_id);
  return { ...row, product };
}

export const PUT = withApi(async (request, { params }) => {
  const user = requireUser(request);
  const { id } = await params;
  const { quantity } = await request.json();
  const row = db.prepare('SELECT * FROM cart_items WHERE id = ? AND user_id = ?').get(id, user.id);
  if (!row) throw new ApiError(404, 'Cart item not found');
  db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(Math.max(1, quantity), id);
  return NextResponse.json({ item: withProduct(db.prepare('SELECT * FROM cart_items WHERE id = ?').get(id)) });
});

export const DELETE = withApi(async (request, { params }) => {
  const user = requireUser(request);
  const { id } = await params;
  db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(id, user.id);
  return NextResponse.json({ ok: true });
});
