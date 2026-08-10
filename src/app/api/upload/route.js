import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import { requireUser, ApiError } from '@/lib/auth.js';
import { withApi } from '@/lib/withApi.js';

const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const MAX_BYTES = 5 * 1024 * 1024;

export const POST = withApi(async (request) => {
  requireUser(request);
  const formData = await request.formData();
  const file = formData.get('image');
  if (!file || typeof file === 'string') throw new ApiError(400, 'No image uploaded');
  if (!ALLOWED.includes(file.type)) throw new ApiError(400, 'Only PNG, JPG, WEBP, or SVG images are allowed');
  if (file.size > MAX_BYTES) throw new ApiError(400, 'Image must be under 5MB');

  const ext = path.extname(file.name) || '.png';
  const filename = `${nanoid(10)}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(process.cwd(), 'public', 'uploads', filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
});
