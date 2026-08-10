import { NextResponse } from 'next/server';
import { db } from '@/lib/db.js';
import { requireAdmin } from '@/lib/auth.js';
import { withApi } from '@/lib/withApi.js';

export const PUT = withApi(async (request, { params }) => {
  requireAdmin(request);
  const { id } = await params;
  const { status } = await request.json();
  db.prepare('UPDATE contact_messages SET status = ? WHERE id = ?').run(status, id);
  const message = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(id);
  return NextResponse.json({ message });
});
