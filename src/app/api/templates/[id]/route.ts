import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, isAdmin } from '@/lib/auth';

export const DELETE = withAuth(async (req, { params }: { params: { id: string } }) => {
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    return NextResponse.json({ error: 'Unauthorized. Admins only.' }, { status: 403 });
  }

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await prisma.ticketTemplate.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
