import { NextResponse } from 'next/server';
import { db } from '@/lib/db.js';
import { requireUser, ApiError } from '@/lib/auth.js';
import { withApi } from '@/lib/withApi.js';

export const GET = withApi(async (request, { params }) => {
  const user = requireUser(request);
  const { id } = await params;
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND (user_id = ? OR ? = 1)')
    .get(id, user.id, user.role === 'admin' ? 1 : 0);
  if (!order) throw new ApiError(404, 'Order not found');
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  return NextResponse.json({ order: { ...order, items } });
});
