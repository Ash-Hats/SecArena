import React, { FormEvent, useEffect, useState } from 'react';
import { AlertTriangle, Flag, Play, ShieldAlert, SquareTerminal, Terminal } from 'lucide-react';
import { getScenarios, getSimulation, getTimeline, runSimulationAction, startSimulation, stopSimulation, createPvpFlag, submitPvpFlag } from '../../services/simulation';
import { Scenario, SimulationEvent, SimulationSession } from '../../types/simulation';
import { useAuth } from '../../context/AuthContext';

interface Props { sessionId?: string; onSessionStarted: (id: string) => void; }

export const StudentSimulationPage: React.FC<Props> = ({ sessionId, onSessionStarted }) => {
  const { user } = useAuth();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [session, setSession] = useState<SimulationSession | null>(null);
  const [timeline, setTimeline] = useState<SimulationEvent[]>([]);
  const [input, setInput] = useState(''); const [output, setOutput] = useState('Start the scenario to open a safe virtual terminal.');
  const [error, setError] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  
  const [pvpFlagContent, setPvpFlagContent] = useState('');
  const [pvpFlagPath, setPvpFlagPath] = useState('');

  useEffect(() => { getScenarios().then(items => setScenario(items[0])).catch(err => setError(err.message)); }, []);
  useEffect(() => { if (sessionId) { Promise.all([getSimulation(sessionId), getTimeline(sessionId)]).then(([active, events]) => { setSession(active); setTimeline(events); }).catch(err => setError(err.message)); } }, [sessionId]);
  const start = async () => { setBusy(true); setError(null); try { const active = await startSimulation(); setSession(active); setTimeline(await getTimeline(active.id)); setOutput('Simulation started. Try pwd, ls, cat readme.txt, or find / -name flag.txt.'); onSessionStarted(active.id); } catch (err: any) { setError(err.message); } finally { setBusy(false); } };
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!session || !input.trim() || session.status !== 'RUNNING') return; setBusy(true); try { const result = await runSimulationAction(session.id, input); setOutput(result.output || '(no output)'); setSession(result.session); setTimeline(await getTimeline(session.id)); setInput(''); } catch (err: any) { setError(err.message); } finally { setBusy(false); } };
  const stop = async () => { if (!session) return; setBusy(true); try { setSession(await stopSimulation(session.id)); setTimeline(await getTimeline(session.id)); } catch (err: any) { setError(err.message); } finally { setBusy(false); } };

  const handleCreateFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !pvpFlagContent || !pvpFlagPath) return;
    setBusy(true);
    try {
      const active = await createPvpFlag(session.id, pvpFlagContent, pvpFlagPath);
      setSession(active);
      setTimeline(await getTimeline(session.id));
      setPvpFlagContent('');
      setPvpFlagPath('');
    } catch (err: any) { setError(err.message); } finally { setBusy(false); }
  };

  const handleSubmitFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !pvpFlagContent) return;
    setBusy(true);
    try {
      const active = await submitPvpFlag(session.id, pvpFlagContent);
      setSession(active);
      setTimeline(await getTimeline(session.id));
      setPvpFlagContent('');
    } catch (err: any) { setError(err.message); } finally { setBusy(false); }
  };

  const myTeam = session?.participants?.find(p => p.user_id === user?.id)?.team;

  return <div className="space-y-6 max-w-7xl">
    <div className="rounded-2xl border border-cyan-500/25 bg-[#0d1322] p-6 flex flex-wrap justify-between gap-4">
      <div>
        <div className="text-cyan-400 text-xs font-mono uppercase">
          {session?.is_pvp ? 'PvP Match' : 'Browser-based virtual scenario'}
          {session?.is_pvp && session?.join_code && (
            <span className="ml-3 px-2 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded">Join Code: <strong className="text-white">{session.join_code}</strong></span>
          )}
        </div>
        <h1 className="mt-1 text-2xl font-bold text-white">{scenario?.title || 'Loading scenario…'}</h1>
        <p className="mt-2 text-sm text-slate-300">{scenario?.objective}</p>
      </div>
      <div className="text-right"><div className="text-2xl font-bold text-cyan-400">{session?.score ?? 0}</div><div className="text-xs text-slate-400">score · {session?.progress ?? 0}% progress</div></div>
    </div>
    {error && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">{error}</div>}
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6"><div className="xl:col-span-2 rounded-xl border border-slate-800 bg-[#080c14] overflow-hidden"><div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center text-xs font-mono text-slate-400"><span className="flex items-center gap-2"><Terminal className="w-4 h-4 text-cyan-400"/> virtual web01 — no host access</span>{session ? <button disabled={busy || session.status !== 'RUNNING'} onClick={stop} className="text-rose-300 hover:text-rose-200">Stop simulation</button> : <button disabled={busy} onClick={start} className="text-cyan-300 hover:text-cyan-200 flex gap-1"><Play className="w-3 h-3"/> Start simulation</button>}</div><div className="p-5 min-h-[270px] font-mono text-sm"><div className="text-slate-200 whitespace-pre-wrap">{output}</div></div><form onSubmit={submit} className="border-t border-slate-800 p-3 flex gap-2"><span className="font-mono text-cyan-400 pt-2">{session?.cwd || '~'} $</span><input value={input} disabled={!session || session.status !== 'RUNNING' || busy} onChange={e => setInput(e.target.value)} className="flex-1 bg-transparent outline-none text-slate-100 font-mono p-2" placeholder="Enter a simulated command"/><button className="text-xs bg-cyan-500 text-slate-950 font-bold px-3 rounded disabled:opacity-40" disabled={!session || busy}>Run</button></form></div>
      <div className="space-y-4">
        
        {session?.is_pvp && myTeam === 'BLUE' && (
          <div className="rounded-xl border border-purple-500/30 bg-[#0d1322] p-4 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
            <h2 className="text-sm font-bold text-white flex gap-2"><Flag className="w-4 h-4 text-purple-400"/> Blue Team: Hide Flag</h2>
            <form onSubmit={handleCreateFlag} className="mt-3 space-y-2">
              <input value={pvpFlagContent} onChange={e => setPvpFlagContent(e.target.value)} placeholder="Flag (e.g. SEC_ARENA{xxx})" className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white outline-none" required />
              <input value={pvpFlagPath} onChange={e => setPvpFlagPath(e.target.value)} placeholder="Path (e.g. /opt/secret.txt)" className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white outline-none" required />
              <button disabled={busy} type="submit" className="w-full py-1.5 bg-purple-600 text-white font-bold text-xs rounded hover:bg-purple-500">Hide Flag</button>
            </form>
          </div>
        )}

        {session?.is_pvp && myTeam === 'RED' && (
           <div className="rounded-xl border border-rose-500/30 bg-[#0d1322] p-4 shadow-[0_0_10px_rgba(244,63,94,0.1)]">
             <h2 className="text-sm font-bold text-white flex gap-2"><Flag className="w-4 h-4 text-rose-400"/> Red Team: Submit Flag</h2>
             <form onSubmit={handleSubmitFlag} className="mt-3 space-y-2">
               <input value={pvpFlagContent} onChange={e => setPvpFlagContent(e.target.value)} placeholder="Found Flag..." className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white outline-none" required />
               <button disabled={busy} type="submit" className="w-full py-1.5 bg-rose-600 text-white font-bold text-xs rounded hover:bg-rose-500">Submit</button>
             </form>
           </div>
        )}

        <div className="rounded-xl border border-slate-800 bg-[#0d1322] p-4"><h2 className="text-sm font-bold text-white flex gap-2"><SquareTerminal className="w-4 h-4 text-cyan-400"/> Supported actions</h2><p className="mt-3 font-mono text-xs text-slate-400 leading-6">{scenario?.supported_commands.join(' · ')}</p><p className="mt-3 text-xs text-slate-500">Commands are interpreted only as scenario data; nothing executes on your machine.</p></div><div className="rounded-xl border border-slate-800 bg-[#0d1322] p-4"><h2 className="text-sm font-bold text-white flex gap-2"><Flag className="w-4 h-4 text-amber-400"/> Discovered flags</h2>{session?.discovered_flags.length ? session.discovered_flags.map(flag => <code key={flag} className="block mt-3 text-xs text-amber-300 break-all">{flag}</code>) : <p className="mt-3 text-xs text-slate-500">No flags discovered.</p>}</div></div></div>
    <div className="rounded-xl border border-slate-800 bg-[#0d1322] p-5"><h2 className="text-sm font-bold text-white flex gap-2"><ShieldAlert className="w-4 h-4 text-purple-400"/> Timeline & simulated detections</h2><div className="mt-4 space-y-3">{timeline.length ? timeline.map((item, index) => <div key={`${item.created_at}-${index}`} className="text-xs flex gap-3"><span className="text-slate-500 font-mono">{new Date(item.created_at).toLocaleTimeString()}</span><span className={item.severity === 'LOW' ? 'text-amber-300' : 'text-cyan-300'}>{item.severity}</span><span className="text-slate-300">{item.description}</span></div>) : <div className="text-xs text-slate-500 flex gap-2"><AlertTriangle className="w-4 h-4"/> Events will appear when the scenario starts.</div>}</div></div>
  </div>;
};
