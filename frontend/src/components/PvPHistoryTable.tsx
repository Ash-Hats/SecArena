import React from 'react';
import { SimulationSession } from '../types/simulation';
import { Shield, Crosshair, Trophy } from 'lucide-react';

interface PvPHistoryTableProps {
  history: SimulationSession[];
  currentUserId?: string;
}

export const PvPHistoryTable: React.FC<PvPHistoryTableProps> = ({ history, currentUserId }) => {
  if (!history || history.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-[#FBFADA]/50 rounded-2xl bg-[#33503C]/20 text-[#FBFADA]/60 font-mono text-sm">
        No PvP match history found. Join a lobby to start battling!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#FBFADA] bg-[#33503C]/80 backdrop-blur-md">
      <table className="w-full text-left text-sm text-[#FBFADA]">
        <thead className="bg-[#8E9F7C] text-xs uppercase font-mono text-[#FBFADA] border-b border-[#FBFADA]">
          <tr>
            <th className="px-6 py-4">Scenario / Room</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Members</th>
            <th className="px-6 py-4">Flags</th>
            <th className="px-6 py-4">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#FBFADA]/50">
          {history.map((session) => {
            const blueTeam = session.participants?.filter(p => p.team === 'BLUE') || [];
            const redTeam = session.participants?.filter(p => p.team === 'RED') || [];
            const flagsHidden = Object.keys(session.pvp_flags || {}).length;
            const flagsFound = session.discovered_flags?.length || 0;
            
            const myParticipant = session.participants?.find(p => p.user_id === currentUserId);
            const myTeam = myParticipant?.team;

            const redScore = session.score || 0;
            const blueScore = flagsHidden * 50;

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
              <tr key={session.id} className="hover:bg-[#FBFADA]/30 transition-colors">
                <td className="px-6 py-4 font-medium">
                  {session.lobby_name || session.scenario_slug}
                  <div className="text-[10px] text-[#FBFADA] font-mono mt-1">ID: {session.id.split('-')[0]}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                    session.status === 'COMPLETED' ? 'bg-[#FBFADA]/10 text-[#FBFADA] border-[#FBFADA]/20' : 
                    session.status === 'RUNNING' ? 'bg-[#FBFADA]/10 text-[#FBFADA] border-[#FBFADA]/20' :
                    'bg-[#8E9F7C] text-[#FBFADA]/50 border-[#FBFADA]'
                  }`}>
                    {session.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-mono text-[#FBFADA]/60">
                  {new Date(session.started_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-1.5 text-rose-400">
                      <Crosshair className="w-3 h-3" /> 
                      {redTeam.map(p => p.username).join(', ') || 'None'}
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-400">
                      <Shield className="w-3 h-3" /> 
                      {blueTeam.map(p => p.username).join(', ') || 'None'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-xs">
                  <span className="text-blue-400">{flagsHidden} hidden</span><br/>
                  <span className="text-rose-400">{flagsFound} found</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 text-xs min-w-[100px]">
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-rose-400">R: {redScore}</span>
                      <span className="text-blue-400">B: {blueScore}</span>
                    </div>
                    {resultMark && (
                      <div className={`mt-1 font-black text-[10px] uppercase tracking-widest text-center px-2 py-1 rounded ${
                        resultMark === 'WIN' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' :
                        resultMark === 'LOSE' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/50'
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
