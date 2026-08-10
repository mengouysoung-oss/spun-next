import { NextResponse } from 'next/server';
import { db } from '@/lib/db.js';
import { requireAdmin, ApiError } from '@/lib/auth.js';
import { withApi } from '@/lib/withApi.js';

function serialize(p) {
  return { ...p, sizes: JSON.parse(p.sizes), colors: JSON.parse(p.colors) };
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).slice(2, 6);
}

export const GET = withApi(async (request) => {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const q = searchParams.get('q');
  const sort = searchParams.get('sort');
  const newArrivals = searchParams.get('newArrivals');
  const bestsellers = searchParams.get('bestsellers');
  const featured = searchParams.get('featured');

  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];
  if (category && category !== 'all') { sql += ' AND category = ?'; params.push(category); }
  if (q) { sql += ' AND name LIKE ?'; params.push(`%${q}%`); }
  if (newArrivals === 'true') sql += ' AND is_new = 1';
  if (bestsellers === 'true') sql += ' AND is_bestseller = 1';
  if (sort === 'price_asc') sql += ' ORDER BY price ASC';
  else if (sort === 'price_desc') sql += ' ORDER BY price DESC';
  else sql += ' ORDER BY created_at DESC';
  if (featured === 'true') sql += ' LIMIT 4';

  const rows = db.prepare(sql).all(...params);
  return NextResponse.json({ products: rows.map(serialize) });
});

export const POST = withApi(async (request) => {
  requireAdmin(request);
  const { name, category, price, description, image, sizes, colors, customizable, is_new, is_bestseller, stock } = await request.json();
  if (!name || !category || price == null) throw new ApiError(400, 'Name, category, and price are required');
  const slug = slugify(name);
  const info = db.prepare(`INSERT INTO products (name, slug, category, price, description, image, sizes, colors, customizable, is_new, is_bestseller, stock)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    name, slug, category, price, description || '', image || '/img/nav_img.jpg',
    JSON.stringify(sizes || ['S','M','L','XL']), JSON.stringify(colors || ['#141210','#F6F3EA']),
    customizable ? 1 : 0, is_new ? 1 : 0, is_bestseller ? 1 : 0, stock ?? 100
  );
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid);
  return NextResponse.json({ product: serialize(row) }, { status: 201 });
});
