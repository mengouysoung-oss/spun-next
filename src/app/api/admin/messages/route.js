import { NextResponse } from 'next/server';
import { db } from '@/lib/db.js';
import { requireAdmin } from '@/lib/auth.js';
import { withApi } from '@/lib/withApi.js';

export const GET = withApi(async (request) => {
  requireAdmin(request);
  const messages = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
  return NextResponse.json({ messages });
});
