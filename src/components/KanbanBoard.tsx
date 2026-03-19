"use client";
import React, { useState, useEffect } from "react";
import TaskCard from "./TaskCard";
import TicketDetailModal from "@/components/TicketDetailModal";
import { Ticket, TicketStatus, User } from "@/types";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Loader2 } from "lucide-react";

interface KanbanProps {
  searchQuery?: string;
  users?: User[];
  assets?: { id: number; name: string; type: string }[];
}

const KanbanBoard = ({ searchQuery = "", users, assets }: KanbanProps) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [columns, setColumns] = useState<{ id: number; title: string; order: number }[]>([]);

  const fetchColumns = async () => {
    try {
      const res = await fetch("/api/kanban-columns");
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setColumns(data);
        } else {
          setColumns([
            { id: 1, title: 'TODO', order: 10 },
            { id: 2, title: 'IN_PROGRESS', order: 20 },
            { id: 3, title: 'AWAITING_USER', order: 30 },
            { id: 4, title: 'RESOLVED', order: 40 },
            { id: 5, title: 'CLOSED', order: 50 },
          ]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch columns", err);
    }
  };

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/tickets/kanban");
      if (!res.ok) throw new Error("Failed to fetch tickets");
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (err: unknown) {
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchColumns();

    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      fetchTickets();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      const updated = tickets.find((t: Ticket) => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  }, [tickets, selectedTicket]);

  const moveTicket = async (ticketId: number, newStatus: TicketStatus) => {
    const originalTickets = [...tickets];
    setTickets((prev: Ticket[]) =>
      prev.map((t: Ticket) => (t.id === ticketId ? { ...t, status: newStatus } : t)),
    );

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to move ticket");
    } catch (err: unknown) {
      setTickets(originalTickets);
      console.error(err);
    }
  };

  const onDragEnd = (result: { destination: { droppableId: string } | null; source: { droppableId: string }; draggableId: string }) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const ticketId = parseInt(draggableId);
    if (isNaN(ticketId)) return;
    
    const newStatus = destination.droppableId;
    moveTicket(ticketId, newStatus as TicketStatus);
  };

  const filteredTickets = tickets.filter((t: Ticket) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.requesterName?.toLowerCase().includes(q) ||
      t.id.toString().includes(q)
    );
  });

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-full w-full overflow-x-auto gap-4 p-4 pb-8">
        {columns.map((col: any) => (
          <div
            key={col.id}
            className="min-w-[320px] w-[320px] shrink-0 flex flex-col glass-card custom-scrollbar"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-sm">{col.title}</h3>
              <span className="bg-white/10 text-xs px-2 py-1 rounded-md">
                {filteredTickets.filter((t: Ticket) => t.status === col.title).length}
              </span>
            </div>

            <Droppable droppableId={col.title}>
              {(provided: any) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar min-h-[200px]"
                >
                  {isLoading ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="w-5 h-5 animate-spin text-white/20" />
                    </div>
                  ) : filteredTickets.filter((t: Ticket) => t.status === col.title).length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-white/10 border-2 border-dashed border-white/5 rounded-2xl">
                      <span className="text-[10px] uppercase font-black tracking-widest">Column Empty</span>
                    </div>
                  ) : (
                    filteredTickets
                      .filter((t: Ticket) => t.status === col.title)
                      .map((ticket: Ticket, index: number) => (
                        <Draggable key={ticket.id} draggableId={ticket.id.toString()} index={index}>
                          {(provided: any, snapshot: any) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.8 : 1,
                              }}
                            >
                              <TaskCard
                                ticket={ticket}
                                onClick={() => setSelectedTicket(ticket)}
                                onMove={(newStatus: TicketStatus) =>
                                  moveTicket(ticket.id, newStatus)
                                }
                              />
                            </div>
                          )}
                        </Draggable>
                      ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}

        <TicketDetailModal
          ticket={selectedTicket}
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={fetchTickets}
          users={users}
          assets={assets}
        />
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
