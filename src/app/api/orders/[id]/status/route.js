import { NextResponse } from 'next/server';
import { db } from '@/lib/db.js';
import { requireAdmin } from '@/lib/auth.js';
import { withApi } from '@/lib/withApi.js';

export const PUT = withApi(async (request, { params }) => {
  requireAdmin(request);
  const { id } = await params;
  const { status, tracking_code } = await request.json();
  db.prepare('UPDATE orders SET status = COALESCE(?, status), tracking_code = COALESCE(?, tracking_code) WHERE id = ?')
    .run(status, tracking_code, id);
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  return NextResponse.json({ order });
});
