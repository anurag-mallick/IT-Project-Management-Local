import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';

export const POST = withAuth(async (req: NextRequest, user: any) => {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const ticketId = formData.get('ticketId') as string;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const uploadDir = path.join(process.cwd(), 'uploads', ticketId);
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Save to database
    const attachment = await prisma.attachment.create({
      data: {
        fileName: file.name,
        filePath: `${ticketId}/${fileName}`,
        fileSize: file.size,
        mimeType: file.type,
        ticketId: parseInt(ticketId),
        authorId: user.id
      }
    });

    return NextResponse.json({
      path: attachment.filePath,
      name: attachment.fileName,
      size: attachment.fileSize,
      type: attachment.mimeType,
      id: attachment.id
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
});
