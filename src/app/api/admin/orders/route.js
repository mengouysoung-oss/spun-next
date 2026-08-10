import { NextResponse } from 'next/server';
import { db } from '@/lib/db.js';
import { requireAdmin } from '@/lib/auth.js';
import { withApi } from '@/lib/withApi.js';

export const GET = withApi(async (request) => {
  requireAdmin(request);
  const orders = db.prepare(`SELECT o.*, u.name as customer_name, u.email as customer_email FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC`).all();
  const withItems = orders.map((o) => ({ ...o, items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id) }));
  return NextResponse.json({ orders: withItems });
});
