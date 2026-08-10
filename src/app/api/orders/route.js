import { NextResponse } from 'next/server';
import { db } from '@/lib/db.js';
import { requireUser } from '@/lib/auth.js';
import { withApi } from '@/lib/withApi.js';

export const GET = withApi(async (request) => {
  const user = requireUser(request);
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
  const withItems = orders.map((o) => ({ ...o, items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id) }));
  return NextResponse.json({ orders: withItems });
});
