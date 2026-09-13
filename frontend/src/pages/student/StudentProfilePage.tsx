import React from 'react';
import { UserCheck, Shield, Calendar, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const StudentProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">User Profile</h1>
        <p className="text-xs text-slate-400 mt-1">Authenticated user details and platform credentials identity.</p>
      </div>

      <div className="bg-[#0d1322] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center space-x-4 border-b border-slate-800 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-2xl font-bold uppercase">
            {user.username.substring(0, 2)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user.username}</h2>
            <div className="inline-flex items-center space-x-2 mt-1">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 uppercase font-semibold">
                {user.role}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase font-semibold">
                {user.is_active ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center space-x-2 text-slate-400">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>Username</span>
            </div>
            <p className="text-sm font-semibold text-slate-100 font-mono">{user.username}</p>
          </div>

          <div className="space-y-1.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center space-x-2 text-slate-400">
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>Email Address</span>
            </div>
            <p className="text-sm font-semibold text-slate-100 font-mono">{user.email}</p>
          </div>

          <div className="space-y-1.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center space-x-2 text-slate-400">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Account Role</span>
            </div>
            <p className="text-sm font-semibold text-slate-100 font-mono uppercase">{user.role}</p>
          </div>

          <div className="space-y-1.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center space-x-2 text-slate-400">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Member Since</span>
            </div>
            <p className="text-sm font-semibold text-slate-100 font-mono">{formatDate(user.created_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
