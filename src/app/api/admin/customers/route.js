import { NextResponse } from 'next/server';
import { db } from '@/lib/db.js';
import { requireAdmin } from '@/lib/auth.js';
import { withApi } from '@/lib/withApi.js';

export const GET = withApi(async (request) => {
  requireAdmin(request);
  const customers = db.prepare(`
    SELECT u.id, u.name, u.email, u.phone, u.location, u.created_at,
      COUNT(o.id) as order_count, COALESCE(SUM(o.total),0) as lifetime_value
    FROM users u LEFT JOIN orders o ON o.user_id = u.id
    WHERE u.role = 'customer'
    GROUP BY u.id ORDER BY u.created_at DESC
  `).all();
  return NextResponse.json({ customers });
});
