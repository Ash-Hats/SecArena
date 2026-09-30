import React, { useState, useEffect } from 'react';
import { Search, Loader2, Shield, Crosshair, Users, ArrowRight } from 'lucide-react';
import { getPublicLobbies, joinPvpSession, createPvpSession } from '../../services/simulation';
import { SimulationSession } from '../../types/simulation';

interface StudentLabCatalogPageProps {
  onSelectLab?: (slug: string) => void;
  onJoinPvp?: (sessionId: string) => void;
}

export const StudentLabCatalogPage: React.FC<StudentLabCatalogPageProps> = ({ onJoinPvp }) => {
  const [lobbies, setLobbies] = useState<SimulationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [lobbyName, setLobbyName] = useState('');
  const [flagFormat, setFlagFormat] = useState('SEC_ARENA{...}');
  const [teamChoice, setTeamChoice] = useState<'RED'|'BLUE'>('RED');
  const [joining, setJoining] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const nameToUse = lobbyName.trim() || 'PvP Arena Match';
      const session = await createPvpSession('linux-reconnaissance-beginner', teamChoice, nameToUse, flagFormat);
      if (onJoinPvp) onJoinPvp(session.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create lobby.');
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    getPublicLobbies().then(setLobbies).catch(() => {}).finally(() => setLoading(false));
    
    const interval = setInterval(() => {
      getPublicLobbies().then(setLobbies).catch(console.error);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode) return;
    setJoining(true);
    setError(null);
    try {
      const session = await joinPvpSession(joinCode, teamChoice);
      if (onJoinPvp) onJoinPvp(session.id);
    } catch (err: any) {
      setError(err.message || 'Failed to join lobby. Invalid code?');
    } finally {
      setJoining(false);
    }
  };

  return (
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-8 relative overflow-hidden bg-[#33503C]/80 border-none shadow-xl">
        <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-[#FBFADA]/10 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <h1 className="text-3xl md:text-4xl font-black text-[#FBFADA] tracking-tighter">
            PvP Arena Mode
          </h1>
          <p className="text-[#FBFADA]/80 text-sm md:text-base max-w-2xl leading-relaxed font-medium">
            Join ongoing public lobbies with a code, or create a new simulation for others to join.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Actions Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Join Match Card */}
          <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6 shadow-lg border border-[#FBFADA]/20 bg-[#33503C]/60">
            <div>
              <h2 className="text-xl font-black text-[#FBFADA] tracking-tight">Join a Match</h2>
              <p className="text-xs text-[#FBFADA]/70 mt-1.5 font-medium">Enter a valid 6-character room code to join an active simulation.</p>
            </div>
            
            <form onSubmit={handleJoin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#FBFADA] uppercase tracking-wider">Join Code</label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#FBFADA]/50" />
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                    placeholder="e.g. AB123C"
                    className="input-modern pl-10 uppercase tracking-widest font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#FBFADA] uppercase tracking-wider">Select Team</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTeamChoice('RED')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all active:scale-95 ${
                      teamChoice === 'RED'
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                        : 'bg-[#12372A]/40 border-[#FBFADA]/20 text-[#FBFADA]/60 hover:bg-[#12372A]/60'
                    }`}
                  >
                    <Crosshair className="w-4 h-4" /> Red
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeamChoice('BLUE')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all active:scale-95 ${
                      teamChoice === 'BLUE'
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                        : 'bg-[#12372A]/40 border-[#FBFADA]/20 text-[#FBFADA]/60 hover:bg-[#12372A]/60'
                    }`}
                  >
                    <Shield className="w-4 h-4" /> Blue
                  </button>
                </div>
              </div>

              {error && <div className="text-xs text-rose-400 font-bold p-3 bg-rose-500/10 rounded-lg">{error}</div>}

              <button
                type="submit"
                disabled={joining || joinCode.length < 6}
                className="btn-primary w-full flex justify-center items-center gap-2"
              >
                {joining ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Join Lobby</>}
              </button>
            </form>
          </div>

          {/* Create Match Card */}
          <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6 shadow-lg border border-[#FBFADA]/20 bg-[#33503C]/60">
            <div>
              <h2 className="text-xl font-black text-[#FBFADA] tracking-tight">Create a Match</h2>
              <p className="text-xs text-[#FBFADA]/70 mt-1.5 font-medium">Start a new public lobby for others to join.</p>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#FBFADA] uppercase tracking-wider">Lobby Name</label>
                <input
                  type="text"
                  value={lobbyName}
                  onChange={(e) => setLobbyName(e.target.value)}
                  placeholder="e.g. My Cool Match"
                  className="input-modern"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#FBFADA] uppercase tracking-wider">Flag Format</label>
                <input
                  type="text"
                  value={flagFormat}
                  onChange={(e) => setFlagFormat(e.target.value)}
                  placeholder="e.g. SEC_ARENA{...}"
                  className="input-modern font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#FBFADA] uppercase tracking-wider">Select Team</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTeamChoice('RED')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all active:scale-95 ${
                      teamChoice === 'RED'
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                        : 'bg-[#12372A]/40 border-[#FBFADA]/20 text-[#FBFADA]/60 hover:bg-[#12372A]/60'
                    }`}
                  >
                    <Crosshair className="w-4 h-4" /> Red
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeamChoice('BLUE')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all active:scale-95 ${
                      teamChoice === 'BLUE'
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                        : 'bg-[#12372A]/40 border-[#FBFADA]/20 text-[#FBFADA]/60 hover:bg-[#12372A]/60'
                    }`}
                  >
                    <Shield className="w-4 h-4" /> Blue
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="btn-primary w-full flex justify-center items-center gap-2 mt-2"
              >
                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Crosshair className="w-4 h-4" /> Create Lobby</>}
              </button>
            </form>
          </div>
        </div>

        {/* Public Lobbies List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-xl font-black text-[#12372A] tracking-tight">Live Public Lobbies</h2>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px] text-[#12372A] font-bold text-sm gap-3 bg-[#FBFADA]/10 rounded-3xl border border-[#FBFADA]/20">
              <Loader2 className="w-6 h-6 animate-spin" /> Fetching lobbies...
            </div>
          ) : lobbies.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8 border-2 border-dashed border-[#12372A]/20 rounded-3xl bg-[#FBFADA]/5 text-[#12372A] font-medium text-sm">
              <div className="w-16 h-16 bg-[#12372A]/10 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-[#12372A]/50" />
              </div>
              No active public lobbies right now.<br/>Be the first to create one!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {lobbies.map((lobby) => {
                const totalPlayers = lobby.participants?.length || 0;
                return (
                  <div key={lobby.id} className="glass-panel rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-[#33503C]/60 border-[#FBFADA]/20 transition-all gap-5 shadow-lg group">
                    <div className="space-y-2 w-full sm:w-auto">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-bold text-[#FBFADA] text-lg">{lobby.lobby_name || lobby.scenario_slug}</h3>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#12372A]/40 text-[#FBFADA] border border-[#12372A]/50 tracking-wider uppercase">
                          {lobby.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#FBFADA]/60 font-mono">
                        Started: {new Date(lobby.started_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#FBFADA]/80 bg-[#12372A]/40 px-3 py-1.5 rounded-lg border border-[#12372A]/50">
                        <Users className="w-4 h-4 text-[#FBFADA]" />
                        {totalPlayers} Players
                      </div>
                      <button 
                        onClick={() => {
                          setJoinCode(lobby.join_code || '');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="btn-primary px-6 py-2 rounded-xl text-sm opacity-90 group-hover:opacity-100 flex-shrink-0"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
