"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Ticket, Comment as TicketComment, User, Priority, ChecklistItem } from '../types';
import { X, Send, User as UserIcon, AlertCircle, CheckCircle, Loader2, Server, Cpu, Clock, Zap } from 'lucide-react';
import { uploadAttachment } from '@/lib/storage';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  users?: User[];
  assets?: { id: number; name: string; type: string }[];
}

const STATUS_OPTIONS = ['TODO','IN_PROGRESS','AWAITING_USER','RESOLVED','CLOSED'];
const PRIORITY_OPTIONS: Priority[] = ['P0','P1','P2','P3'];

const PRIORITY_LABELS: Record<string, string> = {
  P0: 'P0 – Critical',
  P1: 'P1 – High',
  P2: 'P2 – Normal',
  P3: 'P3 – Low',
};

const TicketDetailModal = ({ ticket, isOpen, onClose, onUpdate, users, assets: initialAssets }: TicketDetailModalProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [comments, setComments] = useState<TicketComment[]>([]);
  const [staff, setStaff] = useState<User[]>(users || []);
  const [assets, setAssets] = useState<{ id: number; name: string; type: string }[]>(initialAssets || []);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Local editable state
  const [localStatus, setLocalStatus] = useState('');
  const [localPriority, setLocalPriority] = useState<Priority>('P2');
  const [localAssignee, setLocalAssignee] = useState<string>('');
  const [localTags, setLocalTags] = useState<string>('');
  const [localDueDate, setLocalDueDate] = useState<string>('');
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [localAsset, setLocalAsset] = useState<string>('');
  
  // Tabs & Timeline
  const [activeTab, setActiveTab] = useState<'details' | 'timeline'>('details');
  const [activityLogs, setActivityLogs] = useState<{
    id: number;
    action: string;
    field?: string;
    oldValue?: string;
    newValue?: string;
    createdAt: string;
    user?: { name: string; username: string };
  }[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState(false);

  // Mentions
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(-1); // To track which @ we are replacing
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const fetchActivityLogs = useCallback(async () => {
    if (!ticket) return;
    setIsLoadingLogs(true);
    setLogsError(false);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/activity`);
      if (res.ok) {
        setActivityLogs(await res.json());
      } else {
        setLogsError(true);
      }
    } catch (e) {
      console.error(e);
      setLogsError(true);
    } finally {
      setIsLoadingLogs(false);
    }
  }, [ticket]);

  const getUserName = (value: string | null | undefined) => {
    if (!value) return 'Unassigned';
    // If it's a number, it's an old log; try to find it. Otherwise it's a username string.
    if (!isNaN(Number(value))) {
      const found = staff.find(u => String(u.id) === value);
      return found ? (found.name || found.username) : `User #${value}`;
    }
    return value;
  };

  const fetchComments = useCallback(async () => {
    if (!ticket) return;
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/comments`);
      if (res.ok) setComments(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, [ticket]);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) setStaff(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchAssets = useCallback(async () => {
    try {
      const res = await fetch('/api/assets');
      if (res.ok) setAssets(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (isOpen && ticket) {
      setLocalStatus(ticket.status);
      setLocalPriority(ticket.priority);
      setLocalAssignee(ticket.assignedToId ? String(ticket.assignedToId) : '');
      setLocalTags(ticket.tags ? ticket.tags.join(', ') : '');
      setLocalDueDate(ticket.dueDate ? new Date(ticket.dueDate).toISOString().split('T')[0] : '');
      setLocalAsset(ticket.assetId ? String(ticket.assetId) : '');
      setChecklists(ticket.checklists || []);
      fetchComments();
      fetchActivityLogs();
      if (!users) fetchStaff();
      else setStaff(users);
      if (!initialAssets) fetchAssets();
      else setAssets(initialAssets);
    }
  }, [isOpen, ticket, fetchComments, fetchActivityLogs, fetchStaff, fetchAssets, users, initialAssets]);

  const saveTicket = async () => {
    if (!ticket) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: localStatus,
          priority: localPriority,
          assignedToId: localAssignee ? parseInt(localAssignee) : null,
          assetId: localAsset ? parseInt(localAsset) : null,
          tags: localTags.split(',').map(t => t.trim()).filter(Boolean),
          dueDate: localDueDate || null
        })
      });
      if (res.ok) {
        onUpdate();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const triageTicket = async () => {
    if (!ticket) return;
    setSaving(true);
    try {
      const res = await fetch('/api/tickets/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: ticket.title, description: ticket.description })
      });
      if (res.ok) {
        const result = await res.json();
        setLocalPriority(result.priority);
        setLocalAssignee(result.assignedToId ? String(result.assignedToId) : '');
        alert(`Triage Suggestion: ${result.reason}\nRecommended Assignee: ${result.assignedToName}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const addChecklistItem = async () => {
    if (!newChecklistTitle.trim() || !ticket) return;
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/checklists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newChecklistTitle })
      });
      if (res.ok) {
        const item = await res.json();
        setChecklists([...checklists, item]);
        setNewChecklistTitle('');
        onUpdate();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleChecklist = async (id: number, isCompleted: boolean) => {
    try {
      setChecklists(checklists.map(c => c.id === id ? { ...c, isCompleted } : c));
      const res = await fetch(`/api/checklists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted })
      });
      if (res.ok) onUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteChecklist = async (id: number) => {
    try {
      setChecklists(checklists.filter(c => c.id !== id));
      const res = await fetch(`/api/checklists/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) onUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  const postComment = async () => {
    if (!newComment.trim() || !ticket) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      });
      if (res.ok) {
        setNewComment('');
        fetchComments();
        fetchActivityLogs();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteTicket = async () => {
    if (!ticket || !window.confirm("Are you sure you want to delete this ticket?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, { method: 'DELETE' });
      if (res.ok) {
        onUpdate();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewComment(val);

    // Simple mention detection: last chunk of text after an @ sign
    const cursor = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursor);
    const match = textBeforeCursor.match(/@([a-zA-Z0-9_\-\.]*)$/);

    if (match) {
        setShowMentions(true);
        setMentionQuery(match[1]);
        setMentionIndex(match.index || -1); // Position where '@' starts
    } else {
        setShowMentions(false);
    }
  };

  const insertMention = (username: string) => {
      if (mentionIndex === -1) return;
      const beforeMention = newComment.slice(0, mentionIndex);
      const afterCursor = newComment.slice(textareaRef.current?.selectionStart || newComment.length);
      const updatedComment = `${beforeMention}@${username} ${afterCursor}`;
      setNewComment(updatedComment);
      setShowMentions(false);
      textareaRef.current?.focus();
  };

  const filteredStaff = staff.filter(u => u.username.toLowerCase().includes(mentionQuery.toLowerCase()) || (u.name && u.name.toLowerCase().includes(mentionQuery.toLowerCase())));

  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-zinc-900 border-l border-white/10 h-full flex flex-col shadow-2xl">
        <div className="p-6 border-b border-white/10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <h2 className="text-xl font-bold">{ticket.title}</h2>
               <button 
                  onClick={triageTicket}
                  disabled={saving}
                  className="px-2 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 transition-all"
               >
                  <Cpu size={10} /> Magic Triage
               </button>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
              <span>Ticket #{ticket.id}</span>
              {ticket.slaBreachAt && (
                <span className={`px-2 py-0.5 rounded font-medium ${new Date(ticket.slaBreachAt) < new Date() ? 'bg-red-500/20 text-red-100' : 'bg-green-500/20 text-green-400'}`}>
                  SLA: {new Date(ticket.slaBreachAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              )}
              <span className="text-blue-400 font-medium">
                {ticket.requesterName || ticket.authorName || 'Internal'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5"/></button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-white/10">
          <button 
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'details' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-white/40 hover:text-white/80'}`}
          >
            Details
          </button>
          <button 
            onClick={() => { setActiveTab('timeline'); fetchActivityLogs(); }}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'timeline' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-white/40 hover:text-white/80'}`}
          >
            Timeline
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {activeTab === 'details' ? (
            <>
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold">Description</h3>
                <div className="text-sm text-white/80 prose prose-invert prose-indigo max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{ticket.description}</ReactMarkdown>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="space-y-2">
                  <label className="text-xs text-white/40 font-bold">Status</label>
                  <select value={localStatus} onChange={e => setLocalStatus(e.target.value)} className="w-full bg-zinc-800 border-none rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 text-white">
                    {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.replaceAll('_', ' ')}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-white/40 font-bold">Priority</label>
                  <select value={localPriority} onChange={e => setLocalPriority(e.target.value as Priority)} className="w-full bg-zinc-800 border-none rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 text-white">
                    {PRIORITY_OPTIONS.map(opt => <option key={opt} value={opt}>{PRIORITY_LABELS[opt]}</option>)}
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-xs text-white/40 font-bold">Assignee</label>
                  <select value={localAssignee} onChange={e => setLocalAssignee(e.target.value)} className="w-full bg-zinc-800 border-none rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 text-white">
                    <option value="">Unassigned</option>
                    {staff.map(u => <option key={u.id} value={u.id}>{u.name || u.username}</option>)}
                  </select>
                </div>
                
                <div className="space-y-2 col-span-2">
                  <label className="text-xs text-white/40 font-bold">Tags (comma-separated)</label>
                  <input type="text" value={localTags} onChange={e => setLocalTags(e.target.value)} placeholder="e.g. frontend, bug, urgent" className="w-full bg-zinc-800 border-none rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 text-white" />
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-xs text-white/40 font-bold">Due Date</label>
                  <input type="date" value={localDueDate} onChange={e => setLocalDueDate(e.target.value)} className="w-full bg-zinc-800 border-none rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 text-white scheme-dark" />
                </div>

                <div className="space-y-3 col-span-2 pt-4 mt-2 bg-indigo-950/20 p-4 -mx-4 border-y border-indigo-500/10">
                  <h4 className="text-xs text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-2">
                    <Server className="w-4 h-4" /> Linked IT Asset
                  </h4>
                  <select value={localAsset} onChange={e => setLocalAsset(e.target.value)} className="w-full bg-indigo-950/50 border border-indigo-500/20 text-indigo-200 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500">
                    <option value="">No Asset Linked</option>
                    {assets.map(asset => <option key={asset.id} value={asset.id}>{asset.name} ({asset.type})</option>)}
                  </select>
                </div>

                <div className="space-y-3 col-span-2 pt-4 border-t border-white/5 mt-2">
                  <h4 className="text-xs text-white/40 font-bold uppercase tracking-widest">Checklist</h4>
                  <div className="space-y-2">
                    {checklists.map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-zinc-800/50 p-2 rounded-lg group">
                        <input type="checkbox" checked={item.isCompleted} onChange={(e) => toggleChecklist(item.id, e.target.checked)} className="rounded border-none/10 bg-zinc-700 text-indigo-500 w-4 h-4 cursor-pointer focus:ring-0" />
                        <span className={`flex-1 text-sm ${item.isCompleted ? 'text-white/40 line-through' : 'text-white/80'}`}>{item.title}</span>
                        <button onClick={() => deleteChecklist(item.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-red-400 rounded transition-all"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newChecklistTitle} onChange={e => setNewChecklistTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addChecklistItem()} placeholder="Add item..." className="flex-1 bg-zinc-800 border-none rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 text-white" />
                    <button onClick={addChecklistItem} disabled={!newChecklistTitle.trim()} className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-2 rounded-md text-sm font-bold disabled:opacity-50 transition-colors">Add</button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <label className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-colors flex items-center gap-2">
                  <input type="file" className="hidden" onChange={async (e) => {
                    if (e.target.files && e.target.files[0] && ticket) {
                       setSaving(true);
                       await uploadAttachment(ticket.id, e.target.files[0]);
                       setSaving(false);
                    }
                  }} />
                  Attach File
                </label>
                {isAdmin && (
                  <button 
                    onClick={deleteTicket} 
                    className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-4 py-2 rounded-lg text-sm font-bold transition-all mr-auto"
                  >
                    Delete Ticket
                  </button>
                )}
                <button onClick={saveTicket} disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              <hr className="border-white/10" />
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold">Activity & Comments</h3>
                <div className="space-y-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="bg-white/5 p-4 rounded-xl border border-white/5">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-bold text-indigo-400">{comment.authorName || comment.author?.name || 'System'}</span>
                        <span className="text-xs text-white/40">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-white/80 prose prose-invert prose-p:leading-snug prose-a:text-indigo-400 prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment.content}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold">Activity Timeline</h3>
                <button 
                  onClick={fetchActivityLogs}
                  disabled={isLoadingLogs}
                  className="p-1 hover:bg-white/10 rounded-md text-white/40 hover:text-white/80 transition-colors disabled:opacity-50"
                  title="Refresh Timeline"
                >
                  <Clock className={`w-4 h-4 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              {isLoadingLogs ? (
                <div className="flex flex-col items-center justify-center py-12 text-white/40">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p className="text-sm">Loading activity logs...</p>
                </div>
              ) : logsError ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-200">Failed to load activity logs.</p>
                  <button onClick={fetchActivityLogs} className="mt-3 text-xs font-bold text-red-400 hover:text-red-300 underline">Try Again</button>
                </div>
              ) : (
                <div className="relative border-l border-white/10 ml-3 space-y-6 pb-6">
                  {activityLogs.map((log) => {
                    let Icon = Zap;
                    let colorClass = 'text-indigo-400 bg-indigo-500/20';
                    let message = '';

                    switch (log.action) {
                      case 'STATUS_CHANGE':
                        Icon = CheckCircle;
                        colorClass = 'text-green-400 bg-green-500/20';
                        message = `changed status from ${log.oldValue?.replaceAll('_', ' ') || 'none'} to ${log.newValue?.replaceAll('_', ' ')}`;
                        break;
                      case 'PRIORITY_CHANGE':
                        Icon = AlertCircle;
                        colorClass = 'text-red-400 bg-red-500/20';
                        message = `changed priority from ${log.oldValue || 'none'} to ${log.newValue}`;
                        break;
                      case 'ASSIGNMENT_CHANGE':
                        Icon = UserIcon;
                        colorClass = 'text-blue-400 bg-blue-500/20';
                        message = `changed assignment from ${getUserName(log.oldValue)} to ${getUserName(log.newValue)}`;
                        break;
                      case 'DUE_DATE_CHANGE':
                        Icon = Clock;
                        colorClass = 'text-yellow-400 bg-yellow-500/20';
                        const oldDate = log.oldValue ? new Date(log.oldValue as string).toLocaleDateString() : 'none';
                        const newDate = log.newValue ? new Date(log.newValue as string).toLocaleDateString() : 'none';
                        message = `changed due date from ${oldDate} to ${newDate}`;
                        break;
                      case 'TITLE_CHANGE':
                        message = `changed title from "${log.oldValue}" to "${log.newValue}"`;
                        break;
                      case 'DESCRIPTION_CHANGE':
                        message = `updated the ticket description`;
                        break;
                      case 'TAGS_CHANGE':
                        message = `updated tags to: ${log.newValue || 'none'}`;
                        break;
                      case 'CHECKLIST_ITEM_ADDED':
                        message = `added checklist item: "${log.newValue}"`;
                        break;
                      case 'CHECKLIST_ITEM_COMPLETED':
                        message = `completed: "${log.newValue}"`;
                        break;
                      case 'CHECKLIST_ITEM_UNCOMPLETED':
                        message = `uncompleted: "${log.newValue}"`;
                        break;
                      case 'COMMENT_ADDED':
                        message = `added a comment: "${log.newValue}"`;
                        break;
                      case 'TICKET_CREATED':
                        message = `created the ticket: "${log.newValue}"`;
                        break;
                      default:
                        message = `updated field ${log.field}`;
                    }

                    return (
                      <div key={log.id} className="relative pl-6">
                        <div className={`absolute -left-3.5 top-0 w-7 h-7 rounded-full flex items-center justify-center border border-zinc-900 ${colorClass}`}>
                          <Icon size={12} />
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-bold text-white/80">{log.user?.name || log.user?.username || 'System'}</span>
                            <span className="text-[10px] text-white/40">{new Date(log.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-white/60">{message}</p>
                        </div>
                      </div>
                    );
                  })}
                  {activityLogs.length === 0 && (
                    <div className="pl-6 text-sm text-white/40 italic">No recent activity recorded.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="p-4 bg-zinc-950 border-t border-white/10 relative">
          
          {/* Mention Dropdown */}
          {showMentions && filteredStaff.length > 0 && (
            <div className="absolute bottom-full mb-2 left-4 w-64 bg-zinc-800 border border-white/10 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
              {filteredStaff.map(u => (
                <button
                  key={u.id}
                  onClick={() => insertMention(u.username)}
                  className="w-full text-left px-4 py-2 hover:bg-white/5 text-sm transition-colors flex items-center justify-between"
                >
                  <span className="font-bold text-white/90">{u.name || u.username}</span>
                  <span className="text-xs text-white/40">@{u.username}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <textarea 
               ref={textareaRef}
               value={newComment} 
               onChange={handleCommentChange} 
               placeholder="Type a comment... (use @ to mention)" 
               className="flex-1 bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500/50 resize-none h-12 text-white" 
            />
            <button onClick={postComment} disabled={loading || !newComment.trim()} className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl disabled:opacity-50 flex items-center justify-center transition-colors">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;