import { NextResponse } from 'next/server';
import { db } from '@/lib/db.js';
import { requireUser, ApiError } from '@/lib/auth.js';
import { withApi } from '@/lib/withApi.js';

export const GET = withApi(async (request) => {
  const authUser = requireUser(request);
  const user = db.prepare('SELECT id, name, email, phone, location, role, created_at FROM users WHERE id = ?').get(authUser.id);
  if (!user) throw new ApiError(404, 'User not found');
  return NextResponse.json({ user });
});

export const PUT = withApi(async (request) => {
  const authUser = requireUser(request);
  const { name, phone, location } = await request.json();
  db.prepare('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), location = COALESCE(?, location) WHERE id = ?')
    .run(name, phone, location, authUser.id);
  const user = db.prepare('SELECT id, name, email, phone, location, role FROM users WHERE id = ?').get(authUser.id);
  return NextResponse.json({ user });
});
