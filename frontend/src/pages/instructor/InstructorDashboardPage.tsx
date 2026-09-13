import React, { useEffect, useState } from 'react';
import { Users, Terminal, Clock, ArrowRight, Loader2, AlertCircle, Shield, CalendarDays } from 'lucide-react';
import { getInstructorDashboardApi } from '../../services/dashboard';
import { InstructorDashboardData } from '../../types/dashboard';

interface InstructorDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const InstructorDashboardPage: React.FC<InstructorDashboardPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<InstructorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getInstructorDashboardApi();
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load instructor statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 font-mono text-sm space-y-3">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        <span>Loading Instructor Command Center...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center space-x-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <div className="bg-[#0d1322] border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
            <Shield className="w-3.5 h-3.5" />
            <span>Instructor Supervisor Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Instructor Dashboard
          </h1>
          <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
            Monitor training activity, manage cohort accounts, and author new cybersecurity lab specifications.
          </p>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Registered Students</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{data?.total_students_count}</div>
          <p className="text-[11px] text-slate-500">Real database record count</p>
        </div>

        <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Trainees</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-slate-400 font-mono">{data?.active_students_count}</div>
          <p className="text-[11px] text-slate-500">Active session tracking</p>
        </div>

        <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Simulations</span>
            <Terminal className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-bold text-slate-400 font-mono">{data?.running_labs_count}</div>
          <p className="text-[11px] text-slate-500">Browser-based simulation engine</p>
        </div>

        <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Avg Completion Time</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-sm font-bold text-slate-400 font-mono">{data?.avg_completion_time}</div>
          <p className="text-[11px] text-slate-500">Scoring Engine in Phase 5</p>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0d1322] border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Recent System Activity</h3>
          <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs text-slate-400 font-mono">
            No recent system alerts or security telemetry events.
          </div>
        </div>

        <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Instructor Controls</h3>
          <div className="space-y-2.5">
            <button
              onClick={() => onNavigate('/instructor/events')}
              className="w-full flex items-center justify-between px-4 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-semibold transition-all"
            >
              <span className="flex items-center gap-2"><CalendarDays className="w-4 h-4" />Manage Training Events</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('/instructor/labs')}
              className="w-full flex items-center justify-between px-4 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-semibold transition-all"
            >
              <span>Manage Lab Blueprints</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('/instructor/students')}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-semibold transition-all"
            >
              <span>View Student Directory</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
