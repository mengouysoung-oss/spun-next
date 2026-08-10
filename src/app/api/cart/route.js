import { NextResponse } from 'next/server';
import { db } from '@/lib/db.js';
import { requireUser, ApiError } from '@/lib/auth.js';
import { withApi } from '@/lib/withApi.js';

function withProduct(row) {
  const product = db.prepare('SELECT id, name, price, image, slug FROM products WHERE id = ?').get(row.product_id);
  return { ...row, product };
}

export const GET = withApi(async (request) => {
  const user = requireUser(request);
  const rows = db.prepare('SELECT * FROM cart_items WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
  return NextResponse.json({ items: rows.map(withProduct) });
});

export const POST = withApi(async (request) => {
  const user = requireUser(request);
  const { product_id, size, color, quantity, design_json, design_preview } = await request.json();
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
  if (!product) throw new ApiError(404, 'Product not found');

  const info = db.prepare(`INSERT INTO cart_items (user_id, product_id, size, color, quantity, design_json, design_preview)
    VALUES (?,?,?,?,?,?,?)`).run(
    user.id, product_id, size || null, color || null, quantity || 1,
    design_json ? JSON.stringify(design_json) : null, design_preview || null
  );
  const row = db.prepare('SELECT * FROM cart_items WHERE id = ?').get(info.lastInsertRowid);
  return NextResponse.json({ item: withProduct(row) }, { status: 201 });
});
