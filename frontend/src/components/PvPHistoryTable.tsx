import React from 'react';
import { SimulationSession } from '../types/simulation';
import { Shield, Crosshair, Trophy } from 'lucide-react';

interface PvPHistoryTableProps {
  history: SimulationSession[];
}

export const PvPHistoryTable: React.FC<PvPHistoryTableProps> = ({ history }) => {
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

            return (
              <tr key={session.id} className="hover:bg-[#FBFADA]/30 transition-colors">
                <td className="px-6 py-4 font-medium">
                  {session.scenario_slug}
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
                  <div className="flex items-center gap-2 font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FBFADA] to-[#8E9F7C]">
                    <Trophy className="w-4 h-4 text-[#FBFADA]" />
                    {session.score}
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
