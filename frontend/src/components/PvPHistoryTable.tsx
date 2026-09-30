import React from 'react';
import { SimulationSession } from '../types/simulation';
import { Shield, Crosshair } from 'lucide-react';

interface PvPHistoryTableProps {
  history: SimulationSession[];
  currentUserId?: string;
}

export const PvPHistoryTable: React.FC<PvPHistoryTableProps> = ({ history, currentUserId }) => {
  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-[#12372A]/20 rounded-2xl bg-[#FBFADA]/5 text-[#12372A] font-medium text-sm">
        <div className="w-16 h-16 bg-[#12372A]/10 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-[#12372A]/50" />
        </div>
        No PvP match history found.<br/>Join a lobby to start battling!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left text-sm text-[#FBFADA]">
        <thead className="bg-[#12372A]/40 text-[11px] uppercase tracking-widest text-[#FBFADA]/70 border-b border-[#12372A]/40">
          <tr>
            <th className="px-6 py-4 font-bold whitespace-nowrap">Scenario / Room</th>
            <th className="px-6 py-4 font-bold whitespace-nowrap">Status</th>
            <th className="px-6 py-4 font-bold whitespace-nowrap">Date</th>
            <th className="px-6 py-4 font-bold whitespace-nowrap">Members</th>
            <th className="px-6 py-4 font-bold whitespace-nowrap">Flags</th>
            <th className="px-6 py-4 font-bold whitespace-nowrap">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#12372A]/30">
          {history.map((session) => {
            const blueTeam = session.participants?.filter(p => p.team === 'BLUE') || [];
            const redTeam = session.participants?.filter(p => p.team === 'RED') || [];
            const flagsHidden = Object.keys(session.pvp_flags || {}).length;
            const flagsFound = session.discovered_flags?.length || 0;
            
            const myParticipant = session.participants?.find(p => p.user_id === currentUserId);
            const myTeam = myParticipant?.team;

            const redScore = session.score || 0;
            const unfoundFlags = Object.values(session.pvp_flags || {}).filter((f: any) => !f.found).length;
            const blueScore = unfoundFlags * 50;

            let resultMark = null;
            if (session.status === 'COMPLETED' || session.status === 'STOPPED') {
              if (myTeam === 'RED') {
                if (redScore > blueScore) resultMark = 'WIN';
                else if (redScore < blueScore) resultMark = 'LOSE';
                else resultMark = 'DRAW';
              } else if (myTeam === 'BLUE') {
                if (blueScore > redScore) resultMark = 'WIN';
                else if (blueScore < redScore) resultMark = 'LOSE';
                else resultMark = 'DRAW';
              }
            }

            return (
              <tr key={session.id} className="hover:bg-[#12372A]/20 transition-colors group">
                <td className="px-6 py-4 font-bold truncate max-w-[200px]">
                  {session.lobby_name || session.scenario_slug}
                  <div className="text-[10px] text-[#FBFADA]/40 font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity">ID: {session.id.split('-')[0]}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                    session.status === 'COMPLETED' ? 'bg-[#FBFADA]/10 text-[#FBFADA] border-[#FBFADA]/30 shadow-[0_0_10px_rgba(251,250,218,0.2)]' : 
                    session.status === 'RUNNING' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' :
                    'bg-[#12372A]/50 text-[#FBFADA]/50 border-[#12372A]/50'
                  }`}>
                    {session.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-mono text-[#FBFADA]/60 whitespace-nowrap">
                  {new Date(session.started_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-rose-400 font-medium">
                      <Crosshair className="w-3.5 h-3.5" /> 
                      <span className="truncate max-w-[150px]">{redTeam.map(p => p.username).join(', ') || 'None'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-400 font-medium">
                      <Shield className="w-3.5 h-3.5" /> 
                      <span className="truncate max-w-[150px]">{blueTeam.map(p => p.username).join(', ') || 'None'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                  <span className="text-blue-400 font-medium">{flagsHidden} hidden</span><br/>
                  <span className="text-rose-400 font-medium">{flagsFound} found</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5 text-xs min-w-[100px]">
                    <div className="flex justify-between items-center font-mono font-bold bg-[#12372A]/40 px-2 py-1 rounded">
                      <span className="text-rose-400">R: {redScore}</span>
                      <span className="text-blue-400">B: {blueScore}</span>
                    </div>
                    {resultMark && (
                      <div className={`font-black text-[10px] uppercase tracking-widest text-center px-2 py-1 rounded-md ${
                        resultMark === 'WIN' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        resultMark === 'LOSE' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        'bg-[#12372A] text-[#FBFADA]/60 border border-[#12372A]/50'
                      }`}>
                        YOU {resultMark}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
