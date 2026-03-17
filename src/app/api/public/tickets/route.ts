import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, requesterName, priority } = body;
    
    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const newTicket = await prisma.ticket.create({
      data: {
        title,
        description,
        requesterName: requesterName || 'Anonymous',
        priority: priority || 'P2',
        status: 'TODO'
      }
    });

    return NextResponse.json({ message: 'Ticket submitted successfully', ticketId: newTicket.id });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to submit ticket' }, { status: 400 });
  }
}
