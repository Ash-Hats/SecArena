import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface ForbiddenPageProps {
  onHome: () => void;
}

export const ForbiddenPage: React.FC<ForbiddenPageProps> = ({ onHome }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-extrabold text-white tracking-tight">403 — Forbidden</h1>
      <p className="text-slate-400 max-w-md text-sm leading-relaxed">
        You do not have authorization to view this area. Backend Role-Based Access Control (RBAC) enforces strict separation between Student and Instructor portals.
      </p>
      <button
        onClick={onHome}
        className="px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-semibold transition-all"
      >
        Return to Home Dashboard
      </button>
    </div>
  );
};
