import React, { useEffect, useState } from 'react';
import { BookOpen, Search, Clock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { getStudentCatalogApi } from '../../services/lab';
import { LabStudentView, LabCategory, Difficulty } from '../../types/lab';

import { createPvpSession, joinPvpSession } from '../../services/simulation';

interface StudentLabCatalogPageProps {
  onSelectLab: (slug: string) => void;
  onJoinPvp?: (sessionId: string) => void;
}

export const StudentLabCatalogPage: React.FC<StudentLabCatalogPageProps> = ({ onSelectLab, onJoinPvp }) => {
  const [labs, setLabs] = useState<LabStudentView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LabCategory | ''>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | ''>('');
  
  const [pvpJoinCode, setPvpJoinCode] = useState('');
  const [pvpTeam, setPvpTeam] = useState('RED');
  const [pvpTimeLimit, setPvpTimeLimit] = useState('');
  const [pvpError, setPvpError] = useState('');

  const handleCreatePvp = async () => {
    try {
      setPvpError('');
      const limit = pvpTimeLimit ? parseInt(pvpTimeLimit) : undefined;
      const session = await createPvpSession('linux-reconnaissance-beginner', pvpTeam, limit);
      if (onJoinPvp) onJoinPvp(session.id);
    } catch (err: any) {
      setPvpError(err.message || 'Failed to create PvP match');
    }
  };

  const handleJoinPvp = async () => {
    try {
      setPvpError('');
      if (!pvpJoinCode) throw new Error("Enter a join code");
      const session = await joinPvpSession(pvpJoinCode, pvpTeam);
      if (onJoinPvp) onJoinPvp(session.id);
    } catch (err: any) {
      setPvpError(err.message || 'Failed to join PvP match');
    }
  };

  const categories: LabCategory[] = ['WEB', 'LINUX', 'NETWORK', 'API'];

  const fetchLabs = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getStudentCatalogApi(
        selectedCategory || undefined,
        selectedDifficulty || undefined,
        search || undefined
      );
      setLabs(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load training labs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, [selectedCategory, selectedDifficulty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLabs();
  };

  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case 'EASY':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'HARD':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'EXPERT':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Cyber Training Labs</h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore cybersecurity exercise blueprints across web, network, linux, and API topographies.
        </p>
      </div>

      {/* PvP Matchmaking Panel */}
      <div className="bg-[#0d1322] border border-purple-500/30 rounded-xl p-6 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <span className="text-purple-400">⚔️ PvP Mode (Red vs Blue)</span>
        </h2>
        {pvpError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {pvpError}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300">Create Match</h3>
            <div className="flex gap-2 text-xs">
              <select value={pvpTeam} onChange={(e) => setPvpTeam(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none">
                <option value="RED">Join as RED</option>
                <option value="BLUE">Join as BLUE</option>
              </select>
              <input type="number" value={pvpTimeLimit} onChange={(e) => setPvpTimeLimit(e.target.value)} placeholder="Time (mins, opt)" className="w-32 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none" />
            </div>
            <button onClick={handleCreatePvp} className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs transition-colors">
              Create PvP Lobby
            </button>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300">Join Match</h3>
            <div className="flex gap-2 text-xs">
              <select value={pvpTeam} onChange={(e) => setPvpTeam(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none">
                <option value="RED">Join as RED</option>
                <option value="BLUE">Join as BLUE</option>
              </select>
              <input type="text" value={pvpJoinCode} onChange={(e) => setPvpJoinCode(e.target.value)} placeholder="Join Code" className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none uppercase" />
            </div>
            <button onClick={handleJoinPvp} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs transition-colors border border-slate-700">
              Join with Code
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === ''
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Difficulty Select */}
        <div className="flex items-center space-x-3">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty | '')}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500/60 font-mono"
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
            <option value="EXPERT">Expert</option>
          </select>

          <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search labs..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60 font-mono"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </form>
        </div>
      </div>

      {/* Catalog Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-400 font-mono text-sm space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <span>Loading Lab Catalog...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : labs.length === 0 ? (
        <div className="text-center py-16 bg-[#0d1322] border border-slate-800 rounded-xl space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Labs Available</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No published labs match your selected category, difficulty, or search terms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {labs.map((lab) => (
            <div
              key={lab.id}
              className="bg-[#0d1322] border border-slate-800 hover:border-cyan-500/40 rounded-xl p-6 flex flex-col justify-between space-y-4 transition-all duration-200 shadow-lg group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold uppercase">
                    {lab.category}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${getDifficultyBadge(lab.difficulty)}`}>
                    {lab.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {lab.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {lab.short_description}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{lab.estimated_duration_minutes} min</span>
                  </div>
                  <span>{lab.learning_objectives.length} Objectives</span>
                </div>

                <button
                  onClick={() => onSelectLab(lab.slug)}
                  className="w-full py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-2"
                >
                  <span>View Lab Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
