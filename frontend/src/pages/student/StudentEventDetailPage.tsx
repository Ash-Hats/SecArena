import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Loader2 } from 'lucide-react';
import { getEvent } from '../../services/events';
import { TrainingEvent } from '../../types/event';
import { useAuth } from '../../hooks/useAuth';

interface Props { eventId: string; onBack: () => void; onOpenLab: (slug: string) => void; }
export const StudentEventDetailPage: React.FC<Props> = ({ eventId, onBack, onOpenLab }) => {
  const { user } = useAuth(); const [event, setEvent] = useState<TrainingEvent>();
  useEffect(() => { getEvent(eventId).then(setEvent); }, [eventId, user?.id]);
  if (!event) return <div className="min-h-[40vh] flex items-center justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mr-2" />Loading event…</div>;
  if (!event.is_enrolled) return <div className="space-y-4"><button onClick={onBack} className="text-xs text-cyan-400">← Back to Events</button><div className="p-5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">You must join this event before accessing its labs.</div></div>;
  return <div className="space-y-6"><button onClick={onBack} className="flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-400"><ArrowLeft className="w-4 h-4" />Back to Events</button><div className="bg-[#0d1322] border border-slate-800 rounded-xl p-6"><h1 className="text-2xl font-bold text-white">{event.title}</h1><p className="mt-2 text-sm text-slate-400">{event.description}</p></div><div><h2 className="text-base font-bold text-white mb-4">Event labs</h2><div className="grid md:grid-cols-2 gap-4">{event.labs.map((lab) => <div key={lab.id} className="bg-[#0d1322] border border-slate-800 p-5 rounded-xl"><span className="text-[10px] text-cyan-400 font-bold">{lab.category} · {lab.difficulty}</span><h3 className="mt-2 font-bold text-white">{lab.title}</h3><p className="text-xs text-slate-400 mt-2 line-clamp-2">{lab.short_description}</p><div className="mt-4 flex justify-between items-center"><span className="text-[11px] text-slate-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{lab.estimated_duration_minutes} min</span><button onClick={() => onOpenLab(lab.slug)} className="text-xs font-semibold text-cyan-400">View lab →</button></div></div>)}</div>{event.labs.length === 0 && <div className="p-5 text-slate-400 text-xs border border-slate-800 rounded">No labs have been assigned to this event.</div>}</div></div>;
};
