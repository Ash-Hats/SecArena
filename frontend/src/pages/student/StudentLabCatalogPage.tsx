import React, { useState, useEffect } from 'react';
import { Search, Loader2, Shield, Crosshair, Users, ArrowRight } from 'lucide-react';
import { getPublicLobbies, joinPvpSession } from '../../services/simulation';
import { SimulationSession } from '../../types/simulation';

interface StudentLabCatalogPageProps {
  onSelectLab?: (slug: string) => void;
  onJoinPvp?: (sessionId: string) => void;
}

export const StudentLabCatalogPage: React.FC<StudentLabCatalogPageProps> = ({ onJoinPvp }) => {
  const [lobbies, setLobbies] = useState<SimulationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [teamChoice, setTeamChoice] = useState<'RED'|'BLUE'>('RED');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLobbies = async () => {
      try {
        const res = await getPublicLobbies();
        setLobbies(res);
      } catch (err) {
        console.error("Failed to load public lobbies");
      } finally {
        setLoading(false);
      }
    };
    fetchLobbies();
    
    const interval = setInterval(() => {
      getPublicLobbies()
        .then(res => setLobbies(res))
        .catch(console.error);
    }, 3000);

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
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-[#33503C] border border-[#FBFADA] rounded-2xl p-8 relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <h1 className="text-3xl font-extrabold text-[#FBFADA] tracking-tight">
            PvP Arena Mode
          </h1>
          <p className="text-[#FBFADA]/70 text-sm max-w-2xl leading-relaxed">
            Join ongoing public lobbies with a code, or view current matches.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Join by Code Section */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#33503C] border border-[#FBFADA] rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#FBFADA]">Join a Match</h2>
              <p className="text-sm text-[#FBFADA]/60 mt-1">Enter a valid 6-character room code to join an active simulation.</p>
            </div>
            
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#FBFADA] uppercase tracking-wider">Join Code</label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#FBFADA]/40" />
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                    placeholder="e.g. AB123C"
                    className="w-full bg-[#8E9F7C] border border-[#FBFADA] rounded-lg pl-10 pr-4 py-2.5 text-[#FBFADA] font-mono outline-none focus:border-[#FBFADA] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#FBFADA] uppercase tracking-wider">Select Team</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTeamChoice('RED')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-bold transition-all ${
                      teamChoice === 'RED'
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                        : 'bg-[#8E9F7C] border-[#FBFADA] text-[#FBFADA]/60 hover:bg-[#FBFADA]'
                    }`}
                  >
                    <Crosshair className="w-4 h-4" /> Red
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeamChoice('BLUE')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-bold transition-all ${
                      teamChoice === 'BLUE'
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                        : 'bg-[#8E9F7C] border-[#FBFADA] text-[#FBFADA]/60 hover:bg-[#FBFADA]'
                    }`}
                  >
                    <Shield className="w-4 h-4" /> Blue
                  </button>
                </div>
              </div>

              {error && <div className="text-xs text-rose-400 font-mono">{error}</div>}

              <button
                type="submit"
                disabled={joining || joinCode.length < 6}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#FBFADA] hover:bg-[#FBFADA] text-white font-bold transition-all disabled:opacity-50"
              >
                {joining ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-5 h-5" /> Join Lobby</>}
              </button>
            </form>
          </div>
        </div>

        {/* Public Lobbies List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-[#FBFADA]">Live Public Lobbies</h2>
          
          {loading ? (
            <div className="flex items-center gap-3 text-[#FBFADA]/60 font-mono text-sm py-8">
              <Loader2 className="w-5 h-5 text-[#FBFADA] animate-spin" /> Fetching lobbies...
            </div>
          ) : lobbies.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-[#FBFADA]/50 rounded-2xl bg-[#33503C]/20 text-[#FBFADA]/60 font-mono text-sm">
              No active public lobbies right now. Wait for someone to create one!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {lobbies.map((lobby) => {
                const totalPlayers = lobby.participants?.length || 0;
                return (
                  <div key={lobby.id} className="bg-[#33503C] border border-[#FBFADA] rounded-xl p-5 flex items-center justify-between hover:border-[#FBFADA]/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-[#FBFADA]">{lobby.scenario_slug}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FBFADA]/10 text-[#FBFADA] border border-[#FBFADA]/20">
                          {lobby.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#FBFADA]/60 mt-1 font-mono">
                        Started: {new Date(lobby.started_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#FBFADA]/70 font-mono bg-[#8E9F7C] px-4 py-2 rounded-lg border border-[#FBFADA]">
                      <Users className="w-4 h-4 text-[#FBFADA]" />
                      {totalPlayers} Players Active
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
