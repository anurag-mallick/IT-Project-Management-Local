import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { readFile } from 'fs/promises';
import path from 'path';

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const filePath = req.nextUrl.searchParams.get('path');
    if (!filePath) return NextResponse.json({ error: 'No path' }, { status: 400 });

    // Prevent path traversal
    const safePath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(process.cwd(), 'uploads', safePath);

    const buffer = await readFile(fullPath);
    return new NextResponse(buffer);
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
});
