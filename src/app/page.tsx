"use client";
import React, { useState, useEffect } from 'react';
import KanbanBoard from '@/components/KanbanBoard';
import ListBoard from '@/components/ListBoard';
import dynamic from 'next/dynamic';

const ReportsView = dynamic(() => import('@/components/ReportsView'), { ssr: false });
const CalendarView = dynamic(() => import('@/components/CalendarView'), { ssr: false });
const IntelligenceDashboard = dynamic(() => import('@/components/IntelligenceDashboard'), { ssr: false });
const SLADashboard = dynamic(() => import('@/components/SLADashboard'), { ssr: false });
import Sidebar from '@/components/DashboardSidebar';
import AuthGuard from '@/components/AuthGuard';
import NavHeader from '@/components/NavHeader';
import NewTicketModal from '@/components/NewTicketModal';
import ShortcutsModal from '@/components/ShortcutsModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

const Dashboard = () => {
  const [activeView, setActiveView] = useState<'kanban' | 'list' | 'reports' | 'calendar' | 'intelligence' | 'sla'>('intelligence');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [staff, setStaff] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 200);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    fetch('/api/users').then(res => res.ok && res.json()).then(data => { if(data) setStaff(data) }).catch(console.error);
    fetch('/api/assets').then(res => res.ok && res.json()).then(data => { if(data) setAssets(data) }).catch(console.error);
  }, []);

  const handleTicketCreated = () => setRefreshKey(k => k + 1);

  useKeyboardShortcuts({
    'n': () => setIsModalOpen(true),
    '?': () => setIsShortcutsOpen(true),
    'k': () => setActiveView('kanban'),
    'l': () => setActiveView('list'),
    '/': () => {
        // Find the global search input and focus it
        const searchInput = document.getElementById('global-search') as HTMLInputElement;
        if (searchInput) {
           searchInput.focus();
           setTimeout(() => searchInput.select(), 0);
        }
    }
  });

  return (
    <AuthGuard>
      <div className="flex bg-zinc-950 min-h-screen text-white overflow-hidden relative">
        <Sidebar 
          activeView={activeView as any} 
          setActiveView={setActiveView as any} 
          onNewTicket={() => setIsModalOpen(true)}
          onApplyView={(query) => {
            if (query.view) setActiveView(query.view);
            if (query.search !== undefined) setSearchQuery(query.search);
          }}
          isMobileOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col pt-14 md:pt-0 pb-20 md:pb-0 h-screen">
          <NavHeader 
            activeView={activeView as any} 
            setActiveView={setActiveView as any} 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
          
          <div className="px-4 md:px-8 pb-4 pt-4 md:pt-0 max-w-7xl mx-auto w-full flex justify-end">
             <button 
                onClick={async () => {
                  const name = window.prompt("Enter a name for this saved view:");
                  if (!name) return;
                  const query = { view: activeView, search: debouncedSearchQuery };
                  try {
                    const res = await fetch('/api/views', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ name, query })
                    });
                    if (res.ok) alert("View saved successfully!");
                    else alert("Failed to save view.");
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-lg font-bold transition-all"
             >
                Save Current View
             </button>
          </div>

          <div className="px-4 md:px-8 max-w-7xl mx-auto w-full pb-8">
            {activeView === 'kanban' && <KanbanBoard searchQuery={debouncedSearchQuery} users={staff} assets={assets} />}
            {activeView === 'list' && <ListBoard key={`${refreshKey}`} searchQuery={debouncedSearchQuery} users={staff} assets={assets} />}
            {activeView === 'reports' && <ReportsView />}
            {activeView === 'intelligence' && <IntelligenceDashboard />}
            {activeView === 'calendar' && <CalendarView key={refreshKey} users={staff} assets={assets} />}
            {activeView === 'sla' && <SLADashboard />}
          </div>
        </main>
      </div>

      <NewTicketModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleTicketCreated} 
      />
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </AuthGuard>
  );
};

export default Dashboard;
