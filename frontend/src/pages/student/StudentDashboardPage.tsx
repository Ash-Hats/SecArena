import React, { useEffect, useState } from 'react';
import { BookOpen, Terminal, CheckCircle2, TrendingUp, ArrowRight, Loader2, AlertCircle, CalendarDays } from 'lucide-react';
import { getStudentDashboardApi } from '../../services/dashboard';
import { StudentDashboardData } from '../../types/dashboard';

interface StudentDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getStudentDashboardApi();
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 font-mono text-sm space-y-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span>Loading Student Dashboard...</span>
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
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
            <Terminal className="w-3.5 h-3.5" />
            <span>Student Command Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {data?.username}
          </h1>
          <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
            Continue your cybersecurity training journey. Explore available lab blueprints and prepare for hands-on exercises.
          </p>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Available Labs</span>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{data?.available_labs_count}</div>
          <p className="text-[11px] text-slate-500">Published training blueprints</p>
        </div>

        <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Running Labs</span>
            <Terminal className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{data?.running_labs_count}</div>
          <p className="text-[11px] text-slate-500">Active browser simulations</p>
        </div>

        <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Completed Challenges</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{data?.completed_challenges_count}</div>
          <p className="text-[11px] text-slate-500">Verified flag submissions</p>
        </div>

        <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Learning Status</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Active Trainee</div>
          <p className="text-[11px] text-slate-500">Progress tracking enabled</p>
        </div>
      </div>

      {/* Progress & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0d1322] border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Learning Progress</h3>
          <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs text-slate-400 leading-relaxed font-mono">
            {data?.progress_status_message}
          </div>
        </div>

        <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Quick Actions</h3>
          <div className="space-y-2.5">
            <button
              onClick={() => onNavigate('/student/events')}
              className="w-full flex items-center justify-between px-4 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-semibold transition-all"
            >
              <span className="flex items-center gap-2"><CalendarDays className="w-4 h-4" />Join Training Event</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('/student/labs')}
              className="w-full flex items-center justify-between px-4 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-semibold transition-all"
            >
              <span>Browse Lab Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('/student/profile')}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-semibold transition-all"
            >
              <span>View Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
