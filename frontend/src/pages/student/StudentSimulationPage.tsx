import { useEffect, useState } from 'react';
import { Terminal, AlertTriangle, ShieldAlert } from 'lucide-react';
import { getScenarios, getSimulation, runSimulationAction, submitPvpFlag, getSimulations, startSimulation } from '../../services/simulation';
import { Scenario, SimulationSession } from '../../types/simulation';
import { TerminalUI } from '../../components/TerminalUI';

interface Props { sessionId?: string; onSessionStarted: (id: string) => void; }

export const StudentSimulationPage: React.FC<Props> = ({ sessionId, onSessionStarted }) => {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [session, setSession] = useState<SimulationSession | null>(null);
  const [error, setError] = useState<string | null>(null); 
  const [busy, setBusy] = useState(false);
  const [pvpFlagContent, setPvpFlagContent] = useState('');

  useEffect(() => { getScenarios().then(items => setScenario(items[0])).catch(err => setError(err.message)); }, []);
  
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
    } else {
      // Look for an existing non-pvp running session
      getSimulations().then(sessions => {
        const active = sessions.find(s => !s.is_pvp && s.status === 'RUNNING');
        if (active) {
          onSessionStarted(active.id);
        }
      }).catch(err => setError(err.message));
    }
  }, [sessionId, onSessionStarted]);

  const handleStartSimulation = async () => {
    setBusy(true);
    setError(null);
    try {
      const active = await startSimulation();
      onSessionStarted(active.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

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
    try {
      const active = await submitPvpFlag(session.id, pvpFlagContent);
      setSession(active);
      setPvpFlagContent('');
    } catch (err: any) { setError(err.message); } finally { setBusy(false); }
  };

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-rose-400 font-mono text-sm space-y-4 text-center">
      <AlertTriangle className="w-12 h-12" />
      <div className="max-w-md">{error}</div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      
      <div className="flex flex-1 gap-6 min-h-0">
        {/* Terminal Area (Huge) */}
        <div className="flex-[3] min-w-0 bg-[#0d1322] border border-[#FBFADA] rounded-xl overflow-hidden shadow-2xl flex flex-col">
          <div className="px-4 py-2 bg-[#33503C] border-b border-[#FBFADA] flex items-center justify-between shadow-md z-10">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            </div>
            <span className="text-[10px] text-[#FBFADA] font-mono font-bold tracking-wider uppercase">Bash</span>
          </div>
          <div className="flex-1 overflow-hidden relative">
             {!session && !sessionId ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <div className="text-[#FBFADA]/50 font-mono text-sm">Sandbox environment is not initialized.</div>
                  <button onClick={handleStartSimulation} disabled={busy} className="px-6 py-3 bg-[#FBFADA] hover:bg-[#e6e5c5] text-[#12372A] font-bold rounded-lg shadow-lg transition-all flex items-center gap-2">
                    <Terminal className="w-5 h-5" /> Initialize Sandbox
                  </button>
                </div>
             ) : (
               <TerminalUI
                 onCommand={handleCommand}
                 history={session?.terminal_history}
                 currentUser={user?.username}
               />
             )}
             {busy && session && (
               <div className="absolute bottom-2 right-4 text-xs font-mono text-[#FBFADA]/50 animate-pulse flex items-center space-x-2">
                 <Terminal className="w-3 h-3 animate-spin" />
                 <span>Executing...</span>
               </div>
             )}
          </div>
        </div>

        {/* Right Panel (Supported Actions & PvP) */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 overflow-y-auto">
          {session?.is_pvp && session.status === 'RUNNING' && (
             <div className="bg-[#33503C] border border-[#FBFADA] rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-bold text-[#FBFADA] flex items-center gap-2 mb-4">
                  <ShieldAlert className="w-4 h-4 text-rose-400" /> PvP Actions
                </h3>
                <form onSubmit={handleSubmitFlag} className="space-y-3">
                  <input
                    type="text"
                    value={pvpFlagContent}
                    onChange={(e) => setPvpFlagContent(e.target.value)}
                    placeholder="Enter flag content..."
                    className="w-full bg-[#8E9F7C] border border-[#FBFADA] rounded-lg px-3 py-2 text-sm text-[#FBFADA] font-mono outline-none focus:border-rose-400"
                  />
                  <button type="submit" disabled={busy || !pvpFlagContent} className="w-full py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold transition-all">
                    Submit Captured Flag
                  </button>
                </form>
             </div>
          )}

          <div className="bg-[#33503C] border border-[#FBFADA] rounded-xl p-5 flex-1 shadow-lg">
             <h3 className="text-sm font-bold text-[#FBFADA] mb-4">Supported Commands</h3>
             <ul className="space-y-3 text-xs text-[#FBFADA]/80 font-mono">
               {scenario?.supported_commands.map((cmd, idx) => (
                 <li key={idx} className="flex items-start gap-2 border-b border-[#FBFADA]/50 pb-2 last:border-0">
                   <div className="bg-[#8E9F7C] px-1.5 py-0.5 rounded text-[#FBFADA]">{cmd}</div>
                 </li>
               ))}
               <li className="pt-2 italic text-[#FBFADA]/40 text-center">
                 Other standard bash utilities may not be available.
               </li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
