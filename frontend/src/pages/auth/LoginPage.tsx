import React, { useState } from 'react';
import { Shield, ArrowRight, AlertCircle, Loader2, GraduationCap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/auth';

interface LoginPageProps {
  portal: UserRole;
  onNavigateToRegister: () => void;
  onNavigateToOtherPortal: () => void;
  onSuccess: (role: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ portal, onNavigateToRegister, onNavigateToOtherPortal, onSuccess }) => {
  const { login, logout } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isTeacher = portal === 'instructor' || portal === 'admin';
  const portalName = portal === 'admin' ? 'Administrator' : isTeacher ? 'Teacher' : 'Student';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) return setError('Please fill in all fields.');
    setLoading(true);
    setError(null);
    try {
      const signedInUser = await login({ username_or_email: usernameOrEmail, password });
      if (signedInUser.role !== portal) {
        logout();
        throw new Error(`This account belongs to the ${signedInUser.role === 'admin' ? 'Administrator' : signedInUser.role === 'instructor' ? 'Teacher' : 'Student'} portal. Please use the correct sign-in page.`);
      }
      onSuccess(signedInUser.role);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col justify-center items-center px-4 py-12"><div className="w-full max-w-md space-y-6">
    <div className="text-center space-y-2"><div className={`inline-flex p-3 rounded-xl border mb-2 ${isTeacher ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'}`}>{isTeacher ? <GraduationCap className="w-8 h-8" /> : <Shield className="w-8 h-8" />}</div><h1 className="text-3xl font-extrabold text-white">SecArena</h1><p className="text-xs text-slate-400 font-mono">{portalName} Portal</p></div>
    <div className="bg-[#0d1322] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6"><div className="border-b border-slate-800 pb-4"><h2 className="text-xl font-bold text-white">{portalName} Login</h2><p className="text-xs text-slate-400 mt-1">{isTeacher ? 'Manage training events and lab blueprints.' : 'Join events and access your assigned training labs.'}</p></div>
      {error && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4"><div><label className="block text-xs text-slate-300 mb-1.5">Username or email</label><input value={usernameOrEmail} onChange={(e) => setUsernameOrEmail(e.target.value)} className="w-full input-event" required /></div><div><label className="block text-xs text-slate-300 mb-1.5">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full input-event" required /></div><button disabled={loading} className={`w-full py-3 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider flex justify-center gap-2 disabled:opacity-50 ${isTeacher ? 'bg-purple-500 hover:bg-purple-400' : 'bg-cyan-500 hover:bg-cyan-400'}`}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign in</span><ArrowRight className="w-4 h-4" /></>}</button></form>
      <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400 space-y-3">{portal === 'admin' ? <p>Administrator access is provisioned by the server owner.</p> : isTeacher ? <><p>Teacher accounts require an administrator invitation.</p><button onClick={onNavigateToOtherPortal} className="text-cyan-400 underline">Student login</button></> : <><div className="flex justify-between"><span>New student?</span><button onClick={onNavigateToRegister} className="text-cyan-400 underline">Create student account</button></div><button onClick={onNavigateToOtherPortal} className="text-purple-400 underline">Teacher login</button></>}</div>
    </div>
  </div></div>;
};
