import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db.js';
import { signToken, ApiError } from '@/lib/auth.js';
import { withApi } from '@/lib/withApi.js';

export const POST = withApi(async (request) => {
  const { email, password } = await request.json();
  if (!email || !password) throw new ApiError(400, 'Email and password are required');

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    throw new ApiError(401, 'Incorrect email or password');
  }
  const { password_hash, ...safeUser } = user;
  const token = signToken(safeUser);
  return NextResponse.json({ user: safeUser, token });
});
