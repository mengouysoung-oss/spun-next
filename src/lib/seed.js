import { db } from './db.js';
import bcrypt from 'bcryptjs';

const products = [
  { name: 'Blank Canvas Tee', category: 'unisex', price: 18, description: 'Heavyweight 240gsm cotton tee. Our most-customized piece — a true blank canvas for your design.', image: '/img/nav_img.jpg', sizes: ['XS','S','M','L','XL','XXL'], colors: ['#141210','#F6F3EA','#5B3CC4'], is_new: 1, is_bestseller: 1 },
  { name: 'Oversized Hoodie', category: 'unisex', price: 42, description: 'Drop-shoulder oversized hoodie, brushed fleece interior. Built for layering and stitching on your own patches.', image: '/img/clothes_home.jpg', sizes: ['S','M','L','XL'], colors: ['#141210','#8A8578'], is_bestseller: 1 },
  { name: 'Cropped Bomber', category: 'women', price: 58, description: 'Cropped bomber jacket with ribbed cuffs. Customize the back panel with your own print.', image: '/img/nav_img.jpg', sizes: ['XS','S','M','L'], colors: ['#141210','#E8432C'] },
  { name: 'Cargo Joggers', category: 'men', price: 39, description: 'Utility cargo joggers, tapered fit, six pockets.', image: '/img/clothes_home.jpg', sizes: ['S','M','L','XL','XXL'], colors: ['#141210','#3F4A34'], is_new: 1 },
  { name: 'Ringer Tee', category: 'unisex', price: 21, description: 'Contrast-collar ringer tee. Retro cut, modern print zone on the chest.', image: '/img/nav_img.jpg', sizes: ['S','M','L','XL'], colors: ['#F6F3EA','#5B3CC4'] },
  { name: 'Bucket Hat', category: 'accessories', price: 16, description: 'Reversible bucket hat. Small enough print zone to make it personal, big enough to make a statement.', image: '/img/nav_img.jpg', sizes: ['One Size'], colors: ['#141210','#D7FF3F'], is_new: 1 },
  { name: 'Canvas Tote', category: 'accessories', price: 14, description: 'Heavy canvas tote, reinforced handles. Print your own design edge-to-edge.', image: '/img/clothes_home.jpg', sizes: ['One Size'], colors: ['#F6F3EA'] },
  { name: 'Varsity Jacket', category: 'men', price: 74, description: 'Wool-blend body, leather-look sleeves. Custom chenille patch placement on request.', image: '/img/clothes_home.jpg', sizes: ['S','M','L','XL'], colors: ['#141210','#5B3CC4'], is_bestseller: 1 },
  { name: 'Slip Dress', category: 'women', price: 46, description: 'Bias-cut satin slip dress. Minimal, customizable hem embroidery.', image: '/img/clothes_home.jpg', sizes: ['XS','S','M','L'], colors: ['#141210','#E8432C'] },
  { name: 'Crew Socks 3-Pack', category: 'accessories', price: 12, description: 'Ribbed crew socks, three pairs. Add your initials to each pair.', image: '/img/nav_img.jpg', sizes: ['One Size'], colors: ['#141210','#F6F3EA','#D7FF3F'], customizable: 0 },
];

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const insert = db.prepare(`INSERT OR IGNORE INTO products
  (name, slug, category, price, description, image, sizes, colors, customizable, is_new, is_bestseller, stock)
  VALUES (@name, @slug, @category, @price, @description, @image, @sizes, @colors, @customizable, @is_new, @is_bestseller, 100)`);

const tx = db.transaction((items) => {
  for (const p of items) {
    insert.run({
      ...p,
      slug: slugify(p.name),
      sizes: JSON.stringify(p.sizes),
      colors: JSON.stringify(p.colors),
      customizable: p.customizable === 0 ? 0 : 1,
      is_new: p.is_new || 0,
      is_bestseller: p.is_bestseller || 0,
    });
  }
});
tx(products);

const adminEmail = 'admin@spun.shop';
const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
if (!existing) {
  const hash = bcrypt.hashSync('admin1234', 10);
  db.prepare(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')`)
    .run('Admin', adminEmail, hash);
  console.log('Created admin user: admin@spun.shop / admin1234');
}

console.log(`Seeded ${products.length} products.`);
