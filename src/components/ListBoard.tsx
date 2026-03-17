"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ChevronRight, Loader2, AlertCircle, List, ArrowUpDown, Trash2, CheckCircle, AlertOctagon, User as UserIcon } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Ticket, User } from '@/types';
import TicketDetailModal from '@/components/TicketDetailModal';

const priorityColor: Record<string, string> = {
  P0: 'text-red-400',
  P1: 'text-orange-400',
  P2: 'text-indigo-400',
  P3: 'text-zinc-400',
};

const PRIORITY_LABELS: Record<string, string> = {
  P0: 'P0 – Critical', P1: 'P1 – High', P2: 'P2 – Normal', P3: 'P3 – Low',
};

const statusColors: Record<string, string> = {
  TODO:          'bg-zinc-700/50 text-zinc-300',
  IN_PROGRESS:   'bg-blue-500/15 text-blue-300',
  AWAITING_USER: 'bg-yellow-500/15 text-yellow-300',
  RESOLVED:      'bg-green-500/15 text-green-300',
  CLOSED:        'bg-zinc-600/30 text-zinc-400',
};

interface ListBoardProps {
  searchQuery?: string;
  users?: User[];
  assets?: any[];
}

const ListBoard = ({ searchQuery = "", users, assets }: ListBoardProps) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedTicketIds, setSelectedTicketIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [savingBulk, setSavingBulk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user: authUser } = useAuth();
  const isAdmin = authUser?.role === 'ADMIN';

  const fetchTickets = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets?page=${page}&pageSize=20`);
      if (!res.ok) throw new Error('Failed to fetch tickets');
      const data = await res.json();
      setTickets(data.tickets);
      setPagination(data.pagination);
      setSelectedTicketIds(new Set()); // clear selection on page change
    } catch (err: any) {
      setError(err.message || 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchTickets(pagination.page); 
    const interval = setInterval(() => fetchTickets(pagination.page), 15000);
    return () => clearInterval(interval);
  }, [pagination.page]);

  const toggleSelectAll = () => {
    if (selectedTicketIds.size === filteredTickets.length) {
      setSelectedTicketIds(new Set());
    } else {
      setSelectedTicketIds(new Set(filteredTickets.map(t => t.id)));
    }
  };

  const toggleSelectTicket = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedTicketIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTicketIds(newSelected);
  };

  const handleBulkAction = async (actionType: 'status' | 'priority' | 'assignee' | 'delete', value?: string) => {
    if (selectedTicketIds.size === 0) return;
    if (actionType === 'delete' && !window.confirm(`Are you sure you want to delete ${selectedTicketIds.size} tickets?`)) return;

    setSavingBulk(true);
    try {
      const data: any = {};
      if (actionType === 'status') data.status = value;
      if (actionType === 'priority') data.priority = value;
      if (actionType === 'assignee') data.assignedToId = value;
      if (actionType === 'delete') data.delete = true;

      const res = await fetch('/api/tickets/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedTicketIds),
          data
        })
      });

      if (res.ok) {
        setSelectedTicketIds(new Set());
        fetchTickets(pagination.page);
      } else {
        const err = await res.json();
        alert(`Bulk action failed: ${err.error || 'Unknown error'}`);
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred during bulk action.');
    } finally {
      setSavingBulk(false);
    }
  };

  const parentRef = React.useRef<HTMLDivElement>(null);

  const filteredTickets = tickets.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    // Safety check for all fields used in search
    const title = t.title || "";
    const description = t.description || "";
    const requester = t.requesterName || t.authorName || "";
    const id = t.id?.toString() || "";

    return (
      title.toLowerCase().includes(q) ||
      description.toLowerCase().includes(q) ||
      requester.toLowerCase().includes(q) ||
      id.includes(q)
    );
  });

  const rowVirtualizer = useVirtualizer({
    count: filteredTickets.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 5,
  });

  if (loading) return (
    <div className="flex-1 flex items-center justify-center py-24">
      <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="glass-card p-6 flex items-center gap-3 text-red-400">
      <AlertCircle size={18} />
      <span className="text-sm">{error}</span>
      <button onClick={() => fetchTickets(1)} className="ml-auto text-indigo-400 hover:underline text-xs font-bold">Retry</button>
    </div>
  );

  return (
    <>
      <div className="glass-card overflow-hidden flex flex-col h-[700px] relative">
        {/* Table Header */}
        <div className="flex border-b border-white/5 bg-white/5 text-[10px] uppercase tracking-widest text-white/40 font-bold items-center">
          <div className="w-12 px-4 py-4 flex-shrink-0 flex items-center justify-center">
            <input 
              type="checkbox" 
              checked={selectedTicketIds.size === filteredTickets.length && filteredTickets.length > 0}
              onChange={toggleSelectAll}
              className="rounded border-white/10 bg-black/20 text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer w-4 h-4"
            />
          </div>
          <div className="w-16 px-4 py-4 flex-shrink-0">ID</div>
          <div className="flex-1 px-6 py-4 min-w-0">Title</div>
          <div className="w-32 px-6 py-4 flex-shrink-0">Status</div>
          <div className="w-32 px-6 py-4 flex-shrink-0">Priority</div>
          <div className="w-40 px-6 py-4 flex-shrink-0">Requester</div>
          <div className="w-32 px-6 py-4 flex-shrink-0">Created</div>
          <div className="w-12 px-6 py-4 flex-shrink-0"></div>
        </div>

        {/* virtualized Scroll Container */}
        <div 
          ref={parentRef} 
          className="flex-1 overflow-auto scrollbar-hide"
          style={{ contain: 'strict' }}
        >
          {filteredTickets.length === 0 ? (
            <div className="flex items-center justify-center p-24 text-white/20 text-sm">No tickets found</div>
          ) : (
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const ticket = filteredTickets[virtualRow.index];
                return (
                  <div
                    key={virtualRow.key}
                    className="absolute top-0 left-0 w-full flex items-center hover:bg-white/5 transition-colors group cursor-pointer border-b border-white/5"
                    style={{
                      height: `${virtualRow.size}px`,
                      top: 0,
                      left: 0,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="w-12 px-4 py-4 h-full flex items-center justify-center flex-shrink-0" onClick={e => e.stopPropagation()}>
                       <input 
                        type="checkbox" 
                        checked={selectedTicketIds.has(ticket.id)}
                        onChange={(e) => toggleSelectTicket(ticket.id, e as any)}
                        className="rounded border-white/10 bg-black/20 text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer w-4 h-4"
                      />
                    </div>
                    <div className="w-16 px-4 py-4 h-full flex items-center font-mono text-xs text-white/30 flex-shrink-0">
                      #{ticket.id}
                    </div>
                    <div className="flex-1 px-6 py-4 h-full flex items-center text-sm font-medium overflow-hidden">
                      <span className="truncate">{ticket.title}</span>
                    </div>
                    <div className="w-32 px-6 py-4 h-full flex items-center flex-shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight ${statusColors[ticket.status] ?? 'bg-white/5 text-white/50'}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="w-32 px-6 py-4 h-full flex items-center flex-shrink-0">
                      <span className={`text-[10px] font-bold ${priorityColor[ticket.priority] ?? 'text-white/40'}`}>
                        {PRIORITY_LABELS[ticket.priority] ?? ticket.priority}
                      </span>
                    </div>
                    <div className="w-40 px-6 py-4 h-full flex items-center text-xs text-white/40 flex-shrink-0">
                      <span className="truncate">{ticket.requesterName || ticket.authorName || '—'}</span>
                    </div>
                    <div className="w-32 px-6 py-4 h-full flex items-center text-xs text-white/30 flex-shrink-0">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                    <div className="w-12 px-6 py-4 h-full flex items-center justify-end flex-shrink-0">
                      <ChevronRight size={16} className="text-white/20 group-hover:text-white/60 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating Action Bar */}
        {selectedTicketIds.size > 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-zinc-800 border border-white/10 shadow-2xl rounded-2xl px-4 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-5 z-20">
            <span className="text-sm font-bold text-white px-2">
              {selectedTicketIds.size} selected
            </span>
            <div className="h-4 w-px bg-white/10"></div>
            
            <div className="flex items-center gap-2">
               <select 
                  className="bg-zinc-900 border border-white/10 rounded-lg text-xs px-2 py-1.5 focus:outline-none focus:border-indigo-500 text-white/80"
                  onChange={(e) => e.target.value && handleBulkAction('status', e.target.value)}
                  value=""
               >
                 <option value="" disabled>Set Status...</option>
                 <option value="TODO">TODO</option>
                 <option value="IN_PROGRESS">IN PROGRESS</option>
                 <option value="AWAITING_USER">AWAITING USER</option>
                 <option value="RESOLVED">RESOLVED</option>
                 <option value="CLOSED">CLOSED</option>
               </select>

               <select 
                  className="bg-zinc-900 border border-white/10 rounded-lg text-xs px-2 py-1.5 focus:outline-none focus:border-indigo-500 text-white/80"
                  onChange={(e) => e.target.value && handleBulkAction('priority', e.target.value)}
                  value=""
               >
                 <option value="" disabled>Set Priority...</option>
                 <option value="P0">P0 - Critical</option>
                 <option value="P1">P1 - High</option>
                 <option value="P2">P2 - Normal</option>
                 <option value="P3">P3 - Low</option>
               </select>

               <select 
                  className="bg-zinc-900 border border-white/10 rounded-lg text-xs px-2 py-1.5 focus:outline-none focus:border-indigo-500 text-white/80"
                  onChange={(e) => e.target.value && handleBulkAction('assignee', e.target.value)}
                  value=""
               >
                 <option value="" disabled>Assign To...</option>
                 <option value="">Unassigned</option>
                 {users?.map(u => (
                   <option key={u.id} value={u.id}>{u.name || u.username}</option>
                 ))}
               </select>

               {isAdmin && (
                 <button 
                  onClick={() => handleBulkAction('delete')}
                  className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ml-2 flex items-center gap-1"
                 >
                   <Trash2 size={12} /> Delete
                 </button>
               )}
            </div>
            {savingBulk && <Loader2 className="w-4 h-4 animate-spin text-indigo-500 ml-2" />}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-6 px-2">
        <div className="text-xs text-white/40 font-medium">
          Showing <span className="text-white/70">{tickets.length}</span> of <span className="text-white/70">{pagination.totalCount}</span> tickets
        </div>
        <div className="flex items-center gap-2">
          <button 
            disabled={pagination.page <= 1}
            onClick={() => fetchTickets(pagination.page - 1)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 rounded-xl border border-white/5 text-xs font-bold transition-all"
          >
            Prev
          </button>
          <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold px-4">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <button 
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchTickets(pagination.page + 1)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 rounded-xl border border-white/5 text-xs font-bold transition-all"
          >
            Next
          </button>
        </div>
      </div>

      <TicketDetailModal
        isOpen={!!selectedTicket}
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onUpdate={() => fetchTickets(pagination.page)}
        users={users}
        assets={assets}
      />
    </>
  );
};

export default ListBoard;
