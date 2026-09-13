import React, { useEffect, useState } from 'react';
import { BookOpen, Clock, CheckCircle2, Wrench, HelpCircle, Play, ArrowLeft, Loader2, AlertCircle, Info } from 'lucide-react';
import { getStudentLabDetailApi } from '../../services/lab';
import { LabStudentView, Difficulty } from '../../types/lab';

interface StudentLabDetailPageProps {
  slug: string;
  onBack: () => void;
  onStartSimulation?: () => void;
}

export const StudentLabDetailPage: React.FC<StudentLabDetailPageProps> = ({ slug, onBack, onStartSimulation }) => {
  const [lab, setLab] = useState<LabStudentView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openHint, setOpenHint] = useState<number | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await getStudentLabDetailApi(slug);
        setLab(data);
      } catch (err: any) {
        setError(err.message || 'Lab blueprint not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 font-mono text-sm space-y-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span>Loading Lab Blueprint Details...</span>
      </div>
    );
  }

  if (error || !lab) {
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error || 'Lab unavailable'}</span>
        </div>
      </div>
    );
  }

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
    <div className="space-y-8">
      {/* Navigation Top Bar */}
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Lab Catalog</span>
      </button>

      {/* Lab Header Hero */}
      <div className="bg-[#0d1322] border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold uppercase">
              {lab.category}
            </span>
            <span className={`text-xs font-mono px-2.5 py-1 rounded border uppercase font-bold ${getDifficultyBadge(lab.difficulty)}`}>
              {lab.difficulty}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Est. Duration: {lab.estimated_duration_minutes} minutes</span>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{lab.title}</h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed max-w-3xl">
            {lab.short_description}
          </p>
        </div>

        {/* Start Lab Action */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <button
            onClick={onStartSimulation}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider transition-all flex items-center space-x-2 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Open Safe Simulator</span>
          </button>

          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-start space-x-3">
            <Info className="w-5 h-5 flex-shrink-0 text-cyan-400 mt-0.5" />
            <span>This opens a browser-based virtual scenario. Commands are simulated by the application and never run on your device.</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Description & Hints */}
        <div className="lg:col-span-2 space-y-8">
          {/* Detailed Description */}
          <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Lab Overview & Context</span>
            </h2>
            <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
              {lab.description}
            </div>
          </div>

          {/* Hints Accordion */}
          {lab.hints && lab.hints.length > 0 && (
            <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Available Training Hints ({lab.hints.length})</span>
              </h2>

              <div className="space-y-3">
                {lab.hints.map((hint, idx) => (
                  <div key={idx} className="border border-slate-800 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setOpenHint(openHint === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-3 bg-slate-900/60 hover:bg-slate-900 text-left text-xs font-semibold text-slate-200 transition-colors"
                    >
                      <span>Hint {hint.hint_order}: {hint.title}</span>
                      <span className="text-cyan-400 font-mono">{openHint === idx ? '−' : '+'}</span>
                    </button>
                    {openHint === idx && (
                      <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 text-xs text-slate-300 font-mono leading-relaxed">
                        {hint.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Learning Objectives & Required Tools */}
        <div className="space-y-8">
          {/* Learning Objectives */}
          <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Learning Objectives</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {lab.learning_objectives.map((obj, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Required Tools */}
          <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-cyan-400" />
              <span>Required Tools</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {lab.required_tools.map((tool, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
