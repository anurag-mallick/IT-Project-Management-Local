import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { TicketPriority, TicketStatus } from '@/generated/prisma';

export const PATCH = withAuth(async (req: NextRequest, user: any) => {
  try {
    const body = await req.json();
    const { ids, data } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No ticket IDs provided' }, { status: 400 });
    }

    // Role check if try to delete
    if (data.delete) {
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { role: true }
      });
      if (dbUser?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden: Only admins can delete tickets' }, { status: 403 });
      }

      await prisma.ticket.deleteMany({
        where: { id: { in: ids } }
      });
      return NextResponse.json({ success: true, count: ids.length, deleted: true });
    }

    // Otherwise it's an update
    const updateData: any = {};
    if (data.status && Object.values(TicketStatus).includes(data.status)) {
      updateData.status = data.status;
    }
    if (data.priority && Object.values(TicketPriority).includes(data.priority)) {
      updateData.priority = data.priority;
    }
    if ('assignedToId' in data) {
      updateData.assignedToId = data.assignedToId ? parseInt(data.assignedToId) : null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid update data provided' }, { status: 400 });
    }

    const result = await prisma.ticket.updateMany({
      where: { id: { in: ids } },
      data: updateData
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error('Bulk update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
