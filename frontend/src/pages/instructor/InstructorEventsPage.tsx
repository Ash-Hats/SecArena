import React, { useEffect, useState } from 'react';
import { CalendarDays, Copy, Edit, Plus, Radio, Users } from 'lucide-react';
import { getInstructorEvents, setEventStatus } from '../../services/events';
import { EventStatus, TrainingEvent } from '../../types/event';
import { useAuth } from '../../hooks/useAuth';

interface Props { onCreate: () => void; onEdit: (eventId: string) => void; }

const statusStyle: Record<EventStatus, string> = {
  DRAFT: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  PUBLISHED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  CLOSED: 'bg-slate-700/40 text-slate-300 border-slate-600',
  ARCHIVED: 'bg-slate-900 text-slate-500 border-slate-700',
};

export const InstructorEventsPage: React.FC<Props> = ({ onCreate, onEdit }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const refresh = () => user && getInstructorEvents().then(setEvents);
  useEffect(() => { void refresh(); }, [user]);

  const changeStatus = async (eventId: string, status: EventStatus) => {
    if (!user) return;
    try { await setEventStatus(eventId, status); setNotice(`Event ${status.toLowerCase()}.`); refresh(); }
    catch (error: any) { setNotice(error.message); }
  };
  const copyCode = async (code: string) => { await navigator.clipboard?.writeText(code); setNotice(`Join code ${code} copied.`); };

  return <div className="page-enter space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
      <div><h1 className="text-2xl font-bold text-white">Training Events</h1><p className="text-xs text-slate-400 mt-1">Group published labs into time-bound cohorts that students can join.</p></div>
      <button onClick={onCreate} className="px-4 py-2.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider flex items-center gap-2"><Plus className="w-4 h-4" />Create event</button>
    </div>
    {notice && <div className="p-3 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 flex justify-between"><span>{notice}</span><button onClick={() => setNotice(null)}>×</button></div>}
    {events.length === 0 ? <div className="py-16 rounded-xl border border-slate-800 bg-[#0d1322] text-center text-slate-400 text-sm"><CalendarDays className="w-10 h-10 mx-auto mb-3 text-slate-600" />No events yet. Create one, select published labs, then publish it.</div> :
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">{events.map((event) => <div key={event.id} className="bg-[#0d1322] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex justify-between gap-3"><div><h2 className="font-bold text-white">{event.title}</h2><p className="text-xs text-slate-400 mt-1 line-clamp-2">{event.description}</p></div><span className={`h-fit px-2 py-1 border rounded text-[10px] font-bold ${statusStyle[event.status]}`}>{event.status}</span></div>
        <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 font-mono"><span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{event.enrollment_count}{event.capacity ? `/${event.capacity}` : ''}</span><span>{event.labs.length} labs</span><span>{new Date(event.starts_at).toLocaleDateString()}</span></div>
        <div className="flex items-center justify-between rounded bg-slate-900 px-3 py-2"><span className="text-xs text-slate-400">Join code <strong className="ml-2 text-cyan-300 font-mono">{event.join_code}</strong></span><button onClick={() => copyCode(event.join_code)} title="Copy join code" className="text-slate-400 hover:text-cyan-400"><Copy className="w-4 h-4" /></button></div>
        <div className="flex flex-wrap gap-2"><button onClick={() => onEdit(event.id)} className="px-3 py-2 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs flex gap-1"><Edit className="w-3.5 h-3.5" />Edit</button>
          {event.status === 'DRAFT' && <button onClick={() => changeStatus(event.id, 'PUBLISHED')} className="px-3 py-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex gap-1"><Radio className="w-3.5 h-3.5" />Publish</button>}
          {event.status === 'PUBLISHED' && <button onClick={() => changeStatus(event.id, 'CLOSED')} className="px-3 py-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">Close enrolment</button>}
          {event.status === 'CLOSED' && <button onClick={() => changeStatus(event.id, 'PUBLISHED')} className="px-3 py-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">Reopen</button>}
        </div>
      </div>)}</div>}
  </div>;
};
