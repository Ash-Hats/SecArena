import React from 'react';
import { Layers } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  phase: string;
  description: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, phase, description }) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-xs text-slate-400 mt-1">{description}</p>
      </div>

      <div className="bg-[#0d1322] border border-slate-800 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 shadow-xl">
        <div className="inline-flex p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-2">
          <Layers className="w-10 h-10" />
        </div>
        <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
          Scheduled Roadmap Feature: {phase}
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">{title} Module</h2>
        <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
          {description} This capability will become active when {phase} is integrated into the SecArena platform core.
        </p>
      </div>
    </div>
  );
};
