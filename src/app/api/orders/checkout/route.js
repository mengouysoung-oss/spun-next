import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { db } from '@/lib/db.js';
import { requireUser, ApiError } from '@/lib/auth.js';
import { withApi } from '@/lib/withApi.js';

export const POST = withApi(async (request) => {
  const user = requireUser(request);
  const { payment_method, shipping_name, shipping_phone, shipping_address, delivery_method } = await request.json();
  if (!payment_method) throw new ApiError(400, 'Payment method is required');
  if (!shipping_address || !shipping_phone) throw new ApiError(400, 'Shipping address and phone are required');

  const cartItems = db.prepare('SELECT * FROM cart_items WHERE user_id = ?').all(user.id);
  if (cartItems.length === 0) throw new ApiError(400, 'Your cart is empty');

  const total = cartItems.reduce((sum, item) => {
    const product = db.prepare('SELECT price FROM products WHERE id = ?').get(item.product_id);
    return sum + product.price * item.quantity;
  }, 0);

  // Mock payment processing — real gateway integration (ABA/ACLEDA/Visa/Mastercard) requires merchant API keys.
  const paymentStatus = payment_method === 'cod' ? 'pending' : 'paid';
  const trackingCode = 'SPUN-' + nanoid(8).toUpperCase();

  const orderInfo = db.prepare(`INSERT INTO orders
    (user_id, status, total, payment_method, payment_status, shipping_name, shipping_phone, shipping_address, delivery_method, tracking_code)
    VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
    user.id, 'processing', total, payment_method, paymentStatus,
    shipping_name || user.name, shipping_phone, shipping_address, delivery_method || 'standard', trackingCode
  );

  const insertItem = db.prepare(`INSERT INTO order_items (order_id, product_id, product_name, price, size, color, quantity, design_preview)
    VALUES (?,?,?,?,?,?,?,?)`);
  for (const item of cartItems) {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id);
    insertItem.run(orderInfo.lastInsertRowid, item.product_id, product.name, product.price, item.size, item.color, item.quantity, item.design_preview);
  }
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(user.id);

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderInfo.lastInsertRowid);
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  return NextResponse.json({ order: { ...order, items } }, { status: 201 });
});
