export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { calculateSlaBreachTime } from '@/lib/sla';
import { runAutomations } from '@/lib/automations';
import { TicketStatus, TicketPriority } from '@/generated/prisma';
import { sendTicketEmail } from '@/lib/email';

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const skip = (page - 1) * pageSize;
    const skipPagination = searchParams.get('all') === 'true';

    const [tickets, totalCount] = await Promise.all([
      prisma.ticket.findMany({
        select: {
          id: true, title: true, status: true, priority: true,
          createdAt: true, updatedAt: true, dueDate: true, slaBreachAt: true,
          tags: true, requesterName: true, assetId: true, folderId: true,
          assignedTo: { select: { id: true, username: true, name: true } },
          _count: { select: { comments: true, checklists: true } }
        },
        orderBy: { createdAt: 'desc' },
        ...(skipPagination ? {} : { skip, take: pageSize })
      }),
      prisma.ticket.count()
    ]);

    return NextResponse.json({
      tickets,
      pagination: {
        page: skipPagination ? 1 : page,
        pageSize: skipPagination ? totalCount : pageSize,
        totalCount,
        totalPages: skipPagination ? 1 : Math.ceil(totalCount / pageSize)
      }
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
});

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { title, description, priority, status, assignedToId, assetId, tags } = body;
    
    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    // Validate priority and status against enums
    const validatedPriority = (priority && Object.values(TicketPriority).includes(priority)) ? (priority as TicketPriority) : TicketPriority.P2;
    const validatedStatus = (status && Object.values(TicketStatus).includes(status)) ? (status as TicketStatus) : TicketStatus.TODO;

    const slaBreachAt = await calculateSlaBreachTime(validatedPriority);

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority: validatedPriority,
        status: validatedStatus,
        assignedToId: assignedToId ? parseInt(assignedToId.toString()) : undefined,
        assetId: assetId ? parseInt(assetId.toString()) : undefined,
        tags: tags || [],
        slaBreachAt: slaBreachAt || undefined
      },
      include: { assignedTo: { select: { id: true, username: true, name: true } } }
    });

    // Run Automations
    const autoUpdatedTicket = await runAutomations('ON_TICKET_CREATED', ticket);

    // Send email to admin for P0 tickets
    if (validatedPriority === TicketPriority.P0) {
      const adminUsers = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const admin of adminUsers) {
        if (admin.username) {
          await sendTicketEmail({
            type: 'CREATED',
            ticket: autoUpdatedTicket as any,
            recipient: { email: admin.username, name: admin.name || 'Admin' }
          });
        }
      }
    }

    return NextResponse.json(autoUpdatedTicket);
  } catch (err: any) {
    console.error('Ticket Create Error Details:', {
      message: err.message,
      stack: err.stack,
      code: err.code
    });
    
    const isAuthError = err.message?.includes('Authentication failed') || err.message?.includes('password authentication failed');
    return NextResponse.json({ 
      error: isAuthError 
        ? 'Database authentication failed. Check your DATABASE_URL in .env.' 
        : `Failed to create ticket: ${err.message || 'Unknown error'}`
    }, { status: 500 });
  }
});

