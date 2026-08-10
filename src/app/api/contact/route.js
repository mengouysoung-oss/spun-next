import { NextResponse } from 'next/server';
import { db } from '@/lib/db.js';
import { ApiError } from '@/lib/auth.js';
import { withApi } from '@/lib/withApi.js';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST = withApi(async (request) => {
  const { name, email, subject, message } = await request.json();

  if (!name || !name.trim()) throw new ApiError(400, 'Please enter your name');
  if (!email || !isValidEmail(email)) throw new ApiError(400, 'Please enter a valid email address');
  if (!message || message.trim().length < 10) throw new ApiError(400, 'Message must be at least 10 characters');
  if (message.length > 5000) throw new ApiError(400, 'Message is too long');

  const info = db.prepare(
    `INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)`
  ).run(name.trim(), email.trim().toLowerCase(), (subject || '').trim() || null, message.trim());

  const row = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(info.lastInsertRowid);
  return NextResponse.json({ message: row }, { status: 201 });
});
