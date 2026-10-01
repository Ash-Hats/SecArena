import React, { useEffect, useState } from 'react';
import { Terminal, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPvpHistory } from '../../services/simulation';
import { SimulationSession } from '../../types/simulation';
import { PvPHistoryTable } from '../../components/PvPHistoryTable';
import { useAuth } from '../../context/AuthContext';

interface StudentDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = () => {
  const { user } = useAuth();
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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[90rem] mx-auto">
      {}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={{ y: -2, boxShadow: "0 20px 40px -10px rgba(18,55,42,0.3)" }}
        className="glass-panel rounded-3xl p-8 md:p-10 relative overflow-hidden bg-[#33503C]/80 border-none shadow-xl group"
      >
        <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-[#FBFADA]/10 to-transparent pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-[#8E9F7C]/20 rounded-full blur-3xl pointer-events-none group-hover:bg-[#8E9F7C]/30 transition-colors duration-500" />
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 text-[11px] font-bold tracking-wider text-[#FBFADA] bg-[#12372A]/40 px-3 py-1.5 rounded-full border border-[#FBFADA]/20 uppercase">
            <Terminal className="w-3.5 h-3.5" />
            <span>Student Command Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#FBFADA] tracking-tighter">
            Welcome back, {user?.username}
          </h1>
          <p className="text-[#FBFADA]/80 text-sm md:text-base max-w-2xl leading-relaxed font-medium">
            Continue your cybersecurity training journey. Review your past PvP battles and room history below to track your progress.
          </p>
        </div>
      </motion.div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-[#12372A] tracking-tight flex items-center gap-2">
            PvP Match History
          </h2>
        </div>
        <div className="glass-panel rounded-2xl overflow-hidden border-[#33503C]/30 bg-[#FBFADA]/5 shadow-lg">
          <PvPHistoryTable history={history} currentUserId={user?.id} />
        </div>
      </div>
    </div>
  );
};
