import { NextResponse } from 'next/server';
import { db } from '@/lib/db.js';
import { requireAdmin } from '@/lib/auth.js';
import { withApi } from '@/lib/withApi.js';

export const GET = withApi(async (request) => {
  requireAdmin(request);

  const totalRevenue = db.prepare(`SELECT COALESCE(SUM(total),0) as v FROM orders WHERE payment_status = 'paid' OR payment_method = 'cod'`).get().v;
  const totalOrders = db.prepare('SELECT COUNT(*) as v FROM orders').get().v;
  const totalCustomers = db.prepare(`SELECT COUNT(*) as v FROM users WHERE role = 'customer'`).get().v;
  const totalProducts = db.prepare('SELECT COUNT(*) as v FROM products').get().v;
  const newMessages = db.prepare(`SELECT COUNT(*) as v FROM contact_messages WHERE status = 'new'`).get().v;
  const recentOrders = db.prepare(`SELECT o.*, u.name as customer_name FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC LIMIT 8`).all();
  const topProducts = db.prepare(`
    SELECT product_name, SUM(quantity) as units_sold, SUM(quantity * price) as revenue
    FROM order_items GROUP BY product_name ORDER BY units_sold DESC LIMIT 5
  `).all();
  const salesByDay = db.prepare(`
    SELECT date(created_at) as day, SUM(total) as revenue, COUNT(*) as orders
    FROM orders GROUP BY day ORDER BY day DESC LIMIT 14
  `).all();

  return NextResponse.json({ totalRevenue, totalOrders, totalCustomers, totalProducts, newMessages, recentOrders, topProducts, salesByDay });
});
