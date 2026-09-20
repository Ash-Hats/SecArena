import React, { useEffect, useState } from 'react';
import { ArrowLeft, Terminal, ShieldAlert, Crosshair, Shield, Users, Flag, Activity, Trophy, Code } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getSimulation, runSimulationAction, submitPvpFlag, createPvpFlag, stopSimulation, leavePvpSession, approvePvpJoin, rejectPvpJoin } from '../../services/simulation';
import { SimulationSession } from '../../types/simulation';
import { TerminalUI } from '../../components/TerminalUI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props { sessionId?: string; onLeave?: () => void; }

export const PvpDashboardPage: React.FC<Props> = ({ sessionId, onLeave }) => {
  const { user } = useAuth();
  const [session, setSession] = useState<SimulationSession | null>(null);
  const [error, setError] = useState<string | null>(null); 
  const [busy, setBusy] = useState(false);
  const [pvpFlagContent, setPvpFlagContent] = useState('');
  const [flagPath, setFlagPath] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  
  useEffect(() => { 
    if (sessionId) { 
      getSimulation(sessionId)
        .then((active) => { setSession(active); })
        .catch(err => setError(err.message)); 
        
      const interval = setInterval(() => {
        getSimulation(sessionId)
          .then((active) => { setSession(active); })
          .catch(console.error);
      }, 3000);
      
      return () => clearInterval(interval);
    } 
  }, [sessionId]);

  useEffect(() => {
    if (session && (session.status === 'STOPPED' || session.status === 'COMPLETED')) {
      if (onLeave) onLeave(); else window.history.back();
    }
  }, [session?.status, onLeave]);

  const handleCommand = async (command: string) => { 
    if (!session || session.status !== 'RUNNING') return undefined; 
    setBusy(true); 
    try { 
      const result = await runSimulationAction(session.id, command); 
      setSession(result.session); 
      return result.output;
    } catch (err: any) { 
      setError(err.message); 
      return err.message as string;
    } finally { 
      setBusy(false); 
    } 
  };

  const handleSubmitFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !pvpFlagContent) return;
    setBusy(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const active = await submitPvpFlag(session.id, pvpFlagContent);
      setSession(active);
      setPvpFlagContent('');
      setActionSuccess('Flag captured successfully!');
    } catch (err: any) { setActionError(err.message); } finally { setBusy(false); }
  };

  const handleHideFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !pvpFlagContent || !flagPath) return;
    setBusy(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const active = await createPvpFlag(session.id, pvpFlagContent, flagPath);
      setSession(active);
      setPvpFlagContent('');
      setFlagPath('');
      setActionSuccess('Flag hidden successfully!');
    } catch (err: any) { setActionError(err.message); } finally { setBusy(false); }
  };

  const isHost = session?.student_id === user?.id;

  const handleEndMatch = async () => {
    if (!session || !isHost) return;
    setBusy(true);
    try {
      await stopSimulation(session.id);
      if (onLeave) onLeave(); else window.history.back();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleLeaveMatch = async () => {
    if (!session) return;
    setBusy(true);
    try {
      await leavePvpSession(session.id);
      if (onLeave) onLeave(); else window.history.back();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleApprove = async (userId: string) => {
    if (!session) return;
    try {
      const active = await approvePvpJoin(session.id, userId);
      setSession(active);
    } catch (err: any) { setError(err.message); }
  };
  
  const handleReject = async (userId: string) => {
    if (!session) return;
    try {
      const active = await rejectPvpJoin(session.id, userId);
      setSession(active);
    } catch (err: any) { setError(err.message); }
  };

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-rose-400 font-mono text-sm space-y-4 text-center">
      <ShieldAlert className="w-12 h-12" />
      <div className="max-w-md">{error}</div>
    </div>
  );

  const redTeam = session?.participants?.filter(p => p.team === 'RED') || [];
  const blueTeam = session?.participants?.filter(p => p.team === 'BLUE') || [];
  const myParticipant = session?.participants?.find(p => p.user_id === user?.id);
  const myTeam = myParticipant?.team;
  
  const flags = session?.discovered_flags || [];
  const redScore = session?.score || 0; 
  const blueScore = Object.keys(session?.pvp_flags || {}).length * 50; 
  
  const chartData = [
    { name: 'Teams', RED: redScore, BLUE: blueScore }
  ];

  if (!isHost && myParticipant && !myParticipant.is_approved) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center gap-6">
        <div className="bg-[#33503C] border border-[#FBFADA] rounded-xl p-8 shadow-xl max-w-md w-full text-center">
          <ShieldAlert className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-[#FBFADA] font-extrabold text-2xl mb-2">Waiting for Approval</h2>
          <p className="text-[#FBFADA]/70 text-sm mb-8">
            The host of this lobby must approve your request to join before you can access the dashboard and terminal.
          </p>
          <button onClick={handleLeaveMatch} disabled={busy} className="w-full py-3 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/50 rounded-lg text-sm font-bold transition-all shadow-md disabled:opacity-50">
            Cancel Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-[#33503C] border border-[#FBFADA] rounded-xl px-6 py-4 shadow-md">
        <div className="flex items-center gap-6">
          <div className="bg-rose-500/20 p-3 rounded-xl border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <Trophy className="text-rose-400 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-[#FBFADA] font-extrabold text-2xl tracking-tight">
              {session?.lobby_name || 'PvP Arena Match'}
            </h1>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs text-[#FBFADA]/60 font-mono flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400" />
                {session?.status || 'LOADING'}
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#FBFADA] text-[#12372A]">
                CODE: {session?.join_code || '------'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isHost ? (
            <button onClick={handleEndMatch} className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 hover:text-rose-200 border border-rose-500/50 rounded-lg text-sm font-bold transition-all shadow-md">
              <ShieldAlert className="w-4 h-4" /> End Match
            </button>
          ) : (
            <button onClick={handleLeaveMatch} className="flex items-center gap-2 px-4 py-2 bg-[#8E9F7C] hover:bg-rose-500/20 text-[#FBFADA] hover:text-rose-400 border border-[#FBFADA] hover:border-rose-500/50 rounded-lg text-sm font-bold transition-all shadow-md">
              <ArrowLeft className="w-4 h-4" /> Leave Match
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Left Panel (Dashboard & Stats) */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 overflow-y-auto">
          {/* Score Graph */}
          <div className="bg-[#33503C] border border-[#FBFADA] rounded-xl p-5 shadow-lg flex-none h-64">
            <h3 className="text-sm font-bold text-[#FBFADA] mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FBFADA]/70" /> Live Score
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FBFADA" opacity={0.1} vertical={false} />
                <XAxis dataKey="name" stroke="#FBFADA" opacity={0.5} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#FBFADA" opacity={0.5} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#12372A', border: '1px solid #FBFADA', borderRadius: '8px', color: '#FBFADA' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="RED" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="BLUE" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Members List */}
          <div className="bg-[#33503C] border border-[#FBFADA] rounded-xl p-5 shadow-lg flex-1 overflow-hidden flex flex-col">
            <h3 className="text-sm font-bold text-[#FBFADA] mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FBFADA]/70" /> Active Roster
            </h3>
            <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2">
              {/* Red Team */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold border-b border-rose-500/20 pb-2">
                  <Crosshair className="w-4 h-4" /> RED TEAM
                </div>
                {redTeam.map(p => (
                  <div key={p.user_id} className={`text-xs font-mono p-2 rounded-lg border flex justify-between items-center ${p.is_approved ? 'bg-rose-500/10 text-rose-200 border-rose-500/20' : 'bg-rose-500/5 text-rose-200/50 border-rose-500/10 border-dashed'}`}>
                    <span className="truncate" title={p.is_approved ? '' : 'Pending Approval'}>{p.username || p.user_id.slice(0, 8)} {!p.is_approved && '(Pending)'}</span>
                    {isHost && !p.is_approved && (
                      <div className="flex gap-1">
                        <button onClick={() => handleApprove(p.user_id)} className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/40 transition-colors">✓</button>
                        <button onClick={() => handleReject(p.user_id)} className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 rounded hover:bg-rose-500/40 transition-colors">✕</button>
                      </div>
                    )}
                  </div>
                ))}
                {redTeam.length === 0 && <div className="text-xs text-[#FBFADA]/40 italic">Waiting...</div>}
              </div>
              {/* Blue Team */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-400 font-bold border-b border-blue-500/20 pb-2">
                  <Shield className="w-4 h-4" /> BLUE TEAM
                </div>
                {blueTeam.map(p => (
                  <div key={p.user_id} className={`text-xs font-mono p-2 rounded-lg border flex justify-between items-center ${p.is_approved ? 'bg-blue-500/10 text-blue-200 border-blue-500/20' : 'bg-blue-500/5 text-blue-200/50 border-blue-500/10 border-dashed'}`}>
                    <span className="truncate" title={p.is_approved ? '' : 'Pending Approval'}>{p.username || p.user_id.slice(0, 8)} {!p.is_approved && '(Pending)'}</span>
                    {isHost && !p.is_approved && (
                      <div className="flex gap-1">
                        <button onClick={() => handleApprove(p.user_id)} className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/40 transition-colors">✓</button>
                        <button onClick={() => handleReject(p.user_id)} className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 rounded hover:bg-rose-500/40 transition-colors">✕</button>
                      </div>
                    )}
                  </div>
                ))}
                {blueTeam.length === 0 && <div className="text-xs text-[#FBFADA]/40 italic">Waiting...</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel (Terminal) */}
        <div className="flex-[2] min-w-0 bg-[#0d1322] border border-[#FBFADA] rounded-xl overflow-hidden shadow-2xl flex flex-col">
          <div className="px-4 py-3 bg-[#33503C] border-b border-[#FBFADA] flex items-center justify-between shadow-md z-10">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            </div>
            <span className="text-[10px] text-[#FBFADA] font-mono font-bold tracking-wider uppercase">PvP Arena Terminal</span>
          </div>
          <div className="flex-1 overflow-hidden relative">
             <TerminalUI
               onCommand={handleCommand}
               history={session?.terminal_history}
               currentUser={user?.username}
             />
             {busy && (
               <div className="absolute bottom-2 right-4 text-xs font-mono text-[#FBFADA]/50 animate-pulse flex items-center space-x-2">
                 <Terminal className="w-3 h-3 animate-spin" />
                 <span>Executing...</span>
               </div>
             )}
          </div>
        </div>

        {/* Right Panel (Actions & Flags) */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 overflow-y-auto">
          {session?.status === 'RUNNING' && myTeam === 'BLUE' && (
             <div className="bg-[#33503C] border border-[#FBFADA] rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-bold text-[#FBFADA] flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-blue-400" /> Action Center</div>
                  <span className="text-xs font-mono text-[#FBFADA]/50 bg-black/20 px-2 py-1 rounded">Format: {session?.flag_format || 'SEC_ARENA{...}'}</span>
                </h3>
                {actionError && <div className="text-xs text-rose-400 font-mono mb-3 p-2 bg-rose-500/10 rounded">{actionError}</div>}
                {actionSuccess && <div className="text-xs text-emerald-400 font-mono mb-3 p-2 bg-emerald-500/10 rounded">{actionSuccess}</div>}
                <form onSubmit={handleHideFlag} className="space-y-3">
                  <input
                    type="text"
                    value={flagPath}
                    onChange={(e) => setFlagPath(e.target.value)}
                    placeholder="Enter file path (e.g. /opt/flag.txt)"
                    className="w-full bg-[#8E9F7C] border border-[#FBFADA] rounded-lg px-3 py-2 text-sm text-[#FBFADA] placeholder:text-[#FBFADA]/50 font-mono outline-none focus:border-blue-400 transition-colors"
                  />
                  <input
                    type="text"
                    value={pvpFlagContent}
                    onChange={(e) => setPvpFlagContent(e.target.value)}
                    placeholder="Enter flag content..."
                    className="w-full bg-[#8E9F7C] border border-[#FBFADA] rounded-lg px-3 py-2 text-sm text-[#FBFADA] placeholder:text-[#FBFADA]/50 font-mono outline-none focus:border-blue-400 transition-colors"
                  />
                  <button type="submit" disabled={busy || !pvpFlagContent || !flagPath} className="w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold transition-all disabled:opacity-50">
                    Hide Flag
                  </button>
                  <p className="text-[10px] text-[#FBFADA]/50 mt-2 text-center">
                    Hint: You can also manually hide flags directly from the terminal by running: <br/> 
                    <code className="bg-black/30 px-1 py-0.5 rounded text-blue-300">hideflag /path/to/file {session?.flag_format || 'SEC_ARENA{...}'}</code>
                  </p>
                </form>
             </div>
          )}

          {session?.status === 'RUNNING' && myTeam === 'RED' && (
             <div className="bg-[#33503C] border border-[#FBFADA] rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-bold text-[#FBFADA] flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-amber-400" /> Action Center</div>
                  <span className="text-xs font-mono text-[#FBFADA]/50 bg-black/20 px-2 py-1 rounded">Format: {session?.flag_format || 'SEC_ARENA{...}'}</span>
                </h3>
                {actionError && <div className="text-xs text-rose-400 font-mono mb-3 p-2 bg-rose-500/10 rounded">{actionError}</div>}
                {actionSuccess && <div className="text-xs text-emerald-400 font-mono mb-3 p-2 bg-emerald-500/10 rounded">{actionSuccess}</div>}
                <form onSubmit={handleSubmitFlag} className="space-y-3">
                  <input
                    type="text"
                    value={pvpFlagContent}
                    onChange={(e) => setPvpFlagContent(e.target.value)}
                    placeholder="Enter discovered flag..."
                    className="w-full bg-[#8E9F7C] border border-[#FBFADA] rounded-lg px-3 py-2 text-sm text-[#FBFADA] placeholder:text-[#FBFADA]/50 font-mono outline-none focus:border-amber-400 transition-colors"
                  />
                  <button type="submit" disabled={busy || !pvpFlagContent} className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold transition-all disabled:opacity-50">
                    Capture Flag
                  </button>
                </form>
             </div>
          )}

          <div className="bg-[#33503C] border border-[#FBFADA] rounded-xl p-5 shadow-lg">
             <h3 className="text-sm font-bold text-[#FBFADA] mb-3 flex items-center gap-2">
               <Code className="w-4 h-4 text-[#FBFADA]/70" /> Supported Commands
             </h3>
             <div className="flex flex-wrap gap-2">
               {session?.supported_commands?.map(cmd => (
                 <span key={cmd} className="px-2 py-1 bg-[#8E9F7C] border border-[#FBFADA]/30 rounded text-xs font-mono text-[#FBFADA]">
                   {cmd}
                 </span>
               ))}
               {(!session?.supported_commands || session.supported_commands.length === 0) && (
                 <span className="text-xs text-[#FBFADA]/50 italic">Standard shell environment</span>
               )}
             </div>
          </div>

          <div className="bg-[#33503C] border border-[#FBFADA] rounded-xl p-5 flex-1 shadow-lg flex flex-col">
             <h3 className="text-sm font-bold text-[#FBFADA] mb-4 flex items-center gap-2">
               <Flag className="w-4 h-4 text-[#FBFADA]/70" /> {myTeam === 'BLUE' ? 'Flag Status (Blue Team)' : 'Flag Status (Red Team)'}
             </h3>
             <div className="flex-1 overflow-y-auto pr-2 space-y-3">
               {myTeam === 'BLUE' ? (
                 Object.keys(session?.pvp_flags || {}).length === 0 ? (
                   <div className="text-xs text-[#FBFADA]/40 italic text-center mt-4">No flags hidden yet.</div>
                 ) : (
                   Object.entries(session?.pvp_flags || {}).map(([flag, info]: [string, any], idx) => (
                     <div key={idx} className={`p-3 rounded-lg border ${info.found ? 'bg-rose-500/10 border-rose-500/30' : 'bg-[#8E9F7C] border-[#FBFADA]/30'}`}>
                       <div className="text-xs font-bold text-[#FBFADA] mb-1 flex items-center justify-between">
                         <span>{info.found ? `Captured by ${info.found_by || 'Red Team'}` : `Hidden by ${info.hidden_by || 'You'}`}</span>
                         {info.found ? (
                           <span className="text-[10px] text-rose-300 bg-rose-500/20 px-1.5 rounded">Compromised</span>
                         ) : (
                           <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-1.5 rounded">Safe</span>
                         )}
                       </div>
                       <div className="text-[10px] font-mono text-[#FBFADA]/80 truncate">Flag: {flag}</div>
                       <div className="text-[10px] font-mono text-[#FBFADA]/60 truncate mt-1">Path: {info.path}</div>
                     </div>
                   ))
                 )
               ) : (
                 <div className="flex flex-col items-center space-y-6 mt-4">
                   <div className="text-center">
                     <div className="text-4xl font-bold text-rose-400 mb-2">{flags.length} <span className="text-2xl text-[#FBFADA]/50">/ {Object.keys(session?.pvp_flags || {}).length}</span></div>
                     <div className="text-xs font-mono text-[#FBFADA]/70 uppercase tracking-wider">Flags Captured</div>
                   </div>
                   
                   <div className="w-full space-y-2 mt-4">
                     {flags.length > 0 ? flags.map((f: any, idx: number) => (
                       <div key={idx} className="bg-rose-500/10 p-2 rounded-lg border border-rose-500/30 flex justify-between items-center">
                         <span className="text-[10px] font-mono text-rose-200 truncate pr-4">{f.flag}</span>
                         <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded flex-shrink-0">+50 pts</span>
                       </div>
                     )) : (
                       <div className="text-xs text-[#FBFADA]/40 italic text-center">No flags captured yet.</div>
                     )}
                   </div>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
