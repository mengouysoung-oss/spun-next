import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db.js';
import { signToken } from '@/lib/auth.js';
import { withApi } from '@/lib/withApi.js';
import { ApiError } from '@/lib/auth.js';

export const POST = withApi(async (request) => {
  const { name, email, phone, location, password } = await request.json();
  if (!name || !email || !password) throw new ApiError(400, 'Name, email, and password are required');
  if (password.length < 6) throw new ApiError(400, 'Password must be at least 6 characters');

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare(
    `INSERT INTO users (name, email, phone, location, password_hash) VALUES (?, ?, ?, ?, ?)`
  ).run(name, email.toLowerCase(), phone || null, location || null, hash);

  const user = db.prepare('SELECT id, name, email, phone, location, role FROM users WHERE id = ?').get(info.lastInsertRowid);
  const token = signToken(user);
  return NextResponse.json({ user, token }, { status: 201 });
});
