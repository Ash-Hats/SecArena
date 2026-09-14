import React, { useEffect, useState } from 'react';
import { Terminal, Loader2, AlertCircle } from 'lucide-react';
import { getPvpHistory } from '../../services/simulation';
import { SimulationSession } from '../../types/simulation';
import { PvPHistoryTable } from '../../components/PvPHistoryTable';

interface StudentDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = () => {
  const [history, setHistory] = useState<SimulationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getPvpHistory();
        setHistory(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    
    const interval = setInterval(() => {
      getPvpHistory()
        .then(res => setHistory(res))
        .catch(console.error);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#FBFADA]/60 font-mono text-sm space-y-3">
        <Loader2 className="w-8 h-8 text-[#FBFADA] animate-spin" />
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
      <div className="bg-[#33503C] border border-[#FBFADA] rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#FBFADA]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#FBFADA] bg-[#FBFADA]/10 px-2.5 py-1 rounded-md border border-[#FBFADA]/20">
            <Terminal className="w-3.5 h-3.5" />
            <span>Student Command Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#FBFADA] tracking-tight">
            Welcome back
          </h1>
          <p className="text-[#FBFADA]/70 text-sm max-w-xl leading-relaxed">
            Continue your cybersecurity training journey. Review your past PvP battles and room history below.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-[#FBFADA] mb-4">PvP Match History</h2>
        <PvPHistoryTable history={history} />
      </div>
    </div>
  );
};
