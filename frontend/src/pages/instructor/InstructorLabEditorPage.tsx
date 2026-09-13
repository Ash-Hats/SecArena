import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { createLabApi, updateLabApi, getInstructorLabDetailApi } from '../../services/lab';
import { LabCategory, Difficulty, Hint } from '../../types/lab';

interface InstructorLabEditorPageProps {
  labId?: string;
  onBack: () => void;
}

export const InstructorLabEditorPage: React.FC<InstructorLabEditorPageProps> = ({ labId, onBack }) => {
  const isEditing = !!labId;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<LabCategory>('WEB');
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(30);
  const [objectives, setObjectives] = useState<string[]>(['']);
  const [tools, setTools] = useState<string[]>(['']);
  const [hints, setHints] = useState<Hint[]>([]);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && labId) {
      const fetchLab = async () => {
        try {
          const lab = await getInstructorLabDetailApi(labId);
          setTitle(lab.title);
          setSlug(lab.slug);
          setShortDescription(lab.short_description);
          setDescription(lab.description);
          setCategory(lab.category);
          setDifficulty(lab.difficulty);
          setEstimatedDuration(lab.estimated_duration_minutes);
          setObjectives(lab.learning_objectives.length > 0 ? lab.learning_objectives : ['']);
          setTools(lab.required_tools.length > 0 ? lab.required_tools : ['']);
          setHints(lab.hints || []);
        } catch (err: any) {
          setError(err.message || 'Failed to load lab blueprint for editing.');
        } finally {
          setFetchLoading(false);
        }
      };

      fetchLab();
    }
  }, [labId, isEditing]);

  const handleAddObjective = () => setObjectives([...objectives, '']);
  const handleRemoveObjective = (idx: number) => setObjectives(objectives.filter((_, i) => i !== idx));
  const handleObjectiveChange = (idx: number, val: string) => {
    const next = [...objectives];
    next[idx] = val;
    setObjectives(next);
  };

  const handleAddTool = () => setTools([...tools, '']);
  const handleRemoveTool = (idx: number) => setTools(tools.filter((_, i) => i !== idx));
  const handleToolChange = (idx: number, val: string) => {
    const next = [...tools];
    next[idx] = val;
    setTools(next);
  };

  const handleAddHint = () => {
    setHints([...hints, { title: '', content: '', hint_order: hints.length + 1 }]);
  };
  const handleRemoveHint = (idx: number) => setHints(hints.filter((_, i) => i !== idx));
  const handleHintChange = (idx: number, field: 'title' | 'content', val: string) => {
    const next = [...hints];
    next[idx] = { ...next[idx], [field]: val };
    setHints(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !shortDescription.trim() || !description.trim()) {
      setError('Title, Short Description, and Detailed Description are required.');
      return;
    }

    const filteredObjectives = objectives.map((o) => o.trim()).filter(Boolean);
    const filteredTools = tools.map((t) => t.trim()).filter(Boolean);
    const filteredHints = hints.filter((h) => h.title.trim() && h.content.trim());

    const payload = {
      title,
      slug: slug.trim() || undefined,
      short_description: shortDescription,
      description,
      category,
      difficulty,
      estimated_duration_minutes: Number(estimatedDuration),
      learning_objectives: filteredObjectives,
      required_tools: filteredTools,
      hints: filteredHints,
    };

    setLoading(true);
    setError(null);

    try {
      if (isEditing && labId) {
        await updateLabApi(labId, payload);
      } else {
        await createLabApi(payload);
      }
      onBack();
    } catch (err: any) {
      setError(err.message || 'Saving lab blueprint failed.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 font-mono text-sm space-y-3">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        <span>Loading Lab Blueprint Editor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Bar */}
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-purple-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Lab Management</span>
      </button>

      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {isEditing ? 'Edit Lab Blueprint' : 'Author New Lab Blueprint'}
        </h1>
        <p className="text-xs text-slate-400 mt-1">Configure training scenario metadata, objectives, tools, and hints.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-6 space-y-5">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">1. Basic Blueprint Metadata</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Lab Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. SQL Injection Fundamentals"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60 font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">URL Slug (Optional, auto-generated)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="sql-injection-basics"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LabCategory)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500/60 font-mono"
              >
                <option value="WEB">WEB</option>
                <option value="LINUX">LINUX</option>
                <option value="NETWORK">NETWORK</option>
                <option value="API">API</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Difficulty *</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500/60 font-mono"
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
                <option value="EXPERT">EXPERT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Estimated Duration (Minutes) *</label>
              <input
                type="number"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                min={1}
                max={1440}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Short Description (Catalog card summary) *</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Concise 1-2 sentence overview of the lab"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60 font-sans"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Detailed Description (Markdown context & scenario) *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Full scenario details, context, and training objectives..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60 font-sans leading-relaxed"
              required
            />
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">2. Learning Objectives</h2>
            <button
              type="button"
              onClick={handleAddObjective}
              className="px-3 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded text-xs font-semibold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Objective</span>
            </button>
          </div>

          <div className="space-y-2">
            {objectives.map((obj, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={obj}
                  onChange={(e) => handleObjectiveChange(i, e.target.value)}
                  placeholder={`Objective ${i + 1}`}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60"
                />
                {objectives.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveObjective(i)}
                    className="p-2 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Required Tools */}
        <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">3. Required Tools</h2>
            <button
              type="button"
              onClick={handleAddTool}
              className="px-3 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded text-xs font-semibold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tool</span>
            </button>
          </div>

          <div className="space-y-2">
            {tools.map((tool, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={tool}
                  onChange={(e) => handleToolChange(i, e.target.value)}
                  placeholder="e.g. Burp Suite, Browser, curl"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60 font-mono"
                />
                {tools.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTool(i)}
                    className="p-2 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Hints */}
        <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">4. Training Hints</h2>
            <button
              type="button"
              onClick={handleAddHint}
              className="px-3 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded text-xs font-semibold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Hint</span>
            </button>
          </div>

          <div className="space-y-4">
            {hints.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No hints configured yet.</p>
            ) : (
              hints.map((hint, i) => (
                <div key={i} className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400 font-mono">Hint #{i + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHint(i)}
                      className="text-slate-500 hover:text-rose-400 text-xs flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={hint.title}
                    onChange={(e) => handleHintChange(i, 'title', e.target.value)}
                    placeholder="Hint Title"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60"
                  />
                  <textarea
                    value={hint.content}
                    onChange={(e) => handleHintChange(i, 'content', e.target.value)}
                    rows={2}
                    placeholder="Hint guidance text..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60 font-mono"
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider transition-all flex items-center space-x-2 shadow-[0_0_15px_rgba(168,85,247,0.25)] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Blueprint...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Update Lab Blueprint' : 'Save Draft Blueprint'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
