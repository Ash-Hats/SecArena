import React, { useEffect, useState } from 'react';
import { Plus, Search, Loader2, AlertCircle, Edit, Trash2, Send, Archive, RefreshCw } from 'lucide-react';
import { getInstructorLabsApi, publishLabApi, unpublishLabApi, archiveLabApi, deleteLabApi } from '../../services/lab';
import { LabInstructorView, LabStatus } from '../../types/lab';

interface InstructorLabManagementPageProps {
  onNavigateToNew: () => void;
  onNavigateToEdit: (labId: string) => void;
}

export const InstructorLabManagementPage: React.FC<InstructorLabManagementPageProps> = ({
  onNavigateToNew,
  onNavigateToEdit,
}) => {
  const [labs, setLabs] = useState<LabInstructorView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LabStatus | ''>('');

  const fetchLabs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInstructorLabsApi(selectedStatus || undefined, undefined, undefined, search || undefined);
      setLabs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load instructor labs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, [selectedStatus]);

  const handlePublish = async (labId: string, title: string) => {
    try {
      await publishLabApi(labId);
      setActionSuccess(`Lab '${title}' published successfully.`);
      fetchLabs();
    } catch (err: any) {
      setError(err.message || 'Publishing failed.');
    }
  };

  const handleUnpublish = async (labId: string, title: string) => {
    try {
      await unpublishLabApi(labId);
      setActionSuccess(`Lab '${title}' reverted to DRAFT.`);
      fetchLabs();
    } catch (err: any) {
      setError(err.message || 'Unpublishing failed.');
    }
  };

  const handleArchive = async (labId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to archive '${title}'? Archived labs cannot be edited or viewed by students.`)) return;
    try {
      await archiveLabApi(labId);
      setActionSuccess(`Lab '${title}' archived.`);
      fetchLabs();
    } catch (err: any) {
      setError(err.message || 'Archiving failed.');
    }
  };

  const handleDelete = async (labId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete '${title}'? This action is permanent.`)) return;
    try {
      await deleteLabApi(labId);
      setActionSuccess(`Lab '${title}' deleted.`);
      fetchLabs();
    } catch (err: any) {
      setError(err.message || 'Deletion failed.');
    }
  };

  const getStatusBadge = (status: LabStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'DRAFT':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'ARCHIVED':
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Lab Blueprint Management</h1>
          <p className="text-xs text-slate-400 mt-1">Author, configure, publish, and manage training scenario blueprints.</p>
        </div>
        <button
          onClick={onNavigateToNew}
          className="px-4 py-2.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 self-start sm:self-auto shadow-[0_0_12px_rgba(168,85,247,0.25)]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Lab Blueprint</span>
        </button>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="font-bold">×</button>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as LabStatus | '')}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500/60 font-mono"
          >
            <option value="">All Lifecycle Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); fetchLabs(); }} className="relative flex-1 sm:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lab titles..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500/60 font-mono"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Content Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-400 font-mono text-sm space-y-3">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <span>Fetching Lab Specifications...</span>
        </div>
      ) : (
        <div className="bg-[#0d1322] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Title / Slug</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Difficulty</th>
                  <th className="py-3.5 px-4 font-semibold">Lifecycle Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {labs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No lab blueprints found. Click 'Create Lab Blueprint' to author your first scenario.
                    </td>
                  </tr>
                ) : (
                  labs.map((lab) => (
                    <tr key={lab.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white font-sans text-sm">{lab.title}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{lab.slug}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] uppercase font-bold">
                          {lab.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-bold text-slate-300">{lab.difficulty}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getStatusBadge(lab.status)}`}>
                          {lab.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5 font-sans">
                        {lab.status === 'DRAFT' && (
                          <button
                            onClick={() => handlePublish(lab.id, lab.title)}
                            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-semibold transition-all inline-flex items-center space-x-1"
                            title="Publish Lab"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Publish</span>
                          </button>
                        )}
                        {lab.status === 'PUBLISHED' && (
                          <button
                            onClick={() => handleUnpublish(lab.id, lab.title)}
                            className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-xs font-semibold transition-all inline-flex items-center space-x-1"
                            title="Unpublish to Draft"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Unpublish</span>
                          </button>
                        )}
                        {lab.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => onNavigateToEdit(lab.id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold transition-all inline-flex items-center space-x-1"
                            title="Edit Lab Blueprint"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        )}
                        {lab.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => handleArchive(lab.id, lab.title)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded text-xs font-semibold transition-all inline-flex items-center space-x-1"
                            title="Archive Lab"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(lab.id, lab.title)}
                          className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-xs font-semibold transition-all inline-flex items-center space-x-1"
                          title="Delete Lab"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
