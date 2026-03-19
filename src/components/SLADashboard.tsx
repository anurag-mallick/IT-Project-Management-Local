"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, ShieldAlert, Timer } from 'lucide-react';

interface SLATicket {
  id: number;
  title: string;
  priority: string;
  status: string;
  slaBreachAt: string;
  assignedTo: { name: string; username: string } | null;
}

interface SLAData {
  breached: SLATicket[];
  under1h: SLATicket[];
  under4h: SLATicket[];
  under24h: SLATicket[];
  safe: SLATicket[];
}

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        return 'BREACHED';
      }

      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return `${hours}h ${minutes}m ${seconds}s`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return <span className="font-mono">{timeLeft}</span>;
};

const TicketCard = ({ ticket, type }: { ticket: SLATicket, type: 'breached' | 'warning' | 'safe', key?: any }) => {
  const styles = {
    breached: 'bg-red-500/10 border-red-500/20 text-red-500',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
    safe: 'bg-green-500/10 border-green-500/20 text-green-500'
  };

  return (
    <div className={`p-4 rounded-xl border ${styles[type]} mb-3 transition-all hover:scale-[1.02] cursor-pointer`}
         onClick={() => window.location.href = '/'}>
      <div className="flex justify-between items-start mb-2">
         <span className="text-xs font-bold uppercase tracking-widest opacity-80">{ticket.priority}</span>
         <span className="text-xs opacity-60">#{ticket.id}</span>
      </div>
      <h4 className="font-bold text-sm mb-3 text-white">{ticket.title}</h4>
      <div className="flex justify-between items-center text-xs font-medium">
         <span className="text-white/60">{ticket.assignedTo?.name || ticket.assignedTo?.username || 'Unassigned'}</span>
         <div className="flex items-center gap-1.5 opacity-90">
            <Timer size={14} />
            <CountdownTimer targetDate={ticket.slaBreachAt} />
         </div>
      </div>
    </div>
  );
};

export default function SLADashboard() {
  const [data, setData] = useState<SLAData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/tickets/sla');
        if (res.ok) {
          setData(await res.json());
        }
      } catch (e) {
        console.error("Failed to fetch SLA data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/40 min-h-[400px]">
         <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-4" />
         Loading SLA Metrics...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">SLA Dashboard</h2>
            <p className="text-sm text-white/40 mt-1">Real-time monitoring of service level agreements.</p>
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         
         {/* Breached */}
         <div className="bg-zinc-900/50 border border-red-500/20 rounded-2xl p-5 flex flex-col h-[600px]">
            <div className="flex items-center gap-2 mb-4 text-red-500 font-bold uppercase tracking-widest text-xs">
               <ShieldAlert size={16} /> Breached ({data.breached.length})
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
               {data.breached.length === 0 ? (
                 <p className="text-sm text-white/40 italic text-center mt-8">No breached tickets.</p>
               ) : (
                 data.breached.map((t: SLATicket) => <TicketCard key={t.id} ticket={t} type="breached" />)
               )}
            </div>
         </div>

         {/* < 1h */}
         <div className="bg-zinc-900/50 border border-orange-500/20 rounded-2xl p-5 flex flex-col h-[600px]">
            <div className="flex items-center gap-2 mb-4 text-orange-500 font-bold uppercase tracking-widest text-xs">
               <AlertTriangle size={16} /> &lt; 1 Hour ({data.under1h.length})
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
               {data.under1h.length === 0 ? (
                 <p className="text-sm text-white/40 italic text-center mt-8">No tickets at critical risk.</p>
               ) : (
                 data.under1h.map((t: SLATicket) => <TicketCard key={t.id} ticket={t} type="warning" />)
               )}
            </div>
         </div>

         {/* < 4h */}
         <div className="bg-zinc-900/50 border border-yellow-500/20 rounded-2xl p-5 flex flex-col h-[600px]">
            <div className="flex items-center gap-2 mb-4 text-yellow-500 font-bold uppercase tracking-widest text-xs">
               <Clock size={16} /> &lt; 4 Hours ({data.under4h.length})
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
               {data.under4h.length === 0 ? (
                 <p className="text-sm text-white/40 italic text-center mt-8">No tickets at high risk.</p>
               ) : (
                 data.under4h.map((t: SLATicket) => <TicketCard key={t.id} ticket={t} type="warning" />)
               )}
            </div>
         </div>

         {/* < 24h & Safe */}
         <div className="bg-zinc-900/50 border border-green-500/20 rounded-2xl p-5 flex flex-col h-[600px]">
            <div className="flex items-center gap-2 mb-4 text-green-500 font-bold uppercase tracking-widest text-xs">
               <ShieldAlert size={16} /> &lt; 24h & Safe ({data.under24h.length + data.safe.length})
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {data.under24h.map((t: SLATicket) => <TicketCard key={t.id} ticket={t} type="safe" />)}
                  {/* Assuming 'safeTickets' is meant to be 'data.safe' based on context,
                      and the instruction to ensure 'key' is on the top-level element in the map. */}
                  {data.safe.map((t: SLATicket) => (
                    <TicketCard key={t.id} ticket={t} type="safe" />
                  ))}
               {data.under24h.length === 0 && data.safe.length === 0 && (
                 <p className="text-sm text-white/40 italic text-center mt-8">No tickets in safe window.</p>
               )}
            </div>
         </div>

       </div>
    </div>
  );
}
