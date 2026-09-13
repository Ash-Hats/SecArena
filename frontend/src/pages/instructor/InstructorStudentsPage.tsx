import React, { useEffect, useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { getInstructorStudentsApi } from '../../services/dashboard';
import { StudentListItem } from '../../types/dashboard';

export const InstructorStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInstructorStudentsApi(search);
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load student directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Student Directory</h1>
        <p className="text-xs text-slate-400 mt-1">
          Registered student account directory sourced directly from real database records.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student username or email..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500/60 font-mono"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </form>
        <div className="text-xs text-slate-400 font-mono">
          Total Students: <span className="text-purple-400 font-bold">{students.length}</span>
        </div>
      </div>

      {/* Content Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-400 font-mono text-sm space-y-3">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <span>Fetching Student Records...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="bg-[#0d1322] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Student Username</th>
                  <th className="py-3.5 px-4 font-semibold">Email Address</th>
                  <th className="py-3.5 px-4 font-semibold">Role</th>
                  <th className="py-3.5 px-4 font-semibold">Account Status</th>
                  <th className="py-3.5 px-4 font-semibold">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No student records found matching search.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">{student.username}</td>
                      <td className="py-3.5 px-4 text-slate-400">{student.email}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] uppercase font-bold">
                          {student.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${student.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                          {student.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{formatDate(student.created_at)}</td>
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
