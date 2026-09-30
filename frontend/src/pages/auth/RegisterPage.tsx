import React, { useState } from 'react';
import { UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateToLogin }) => {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register({ username, email, password });
      onNavigateToLogin();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check input parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#8E9F7C] text-[#FBFADA] flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden selection:bg-[#33503C]/30">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="w-[50vw] h-[50vw] bg-[#33503C]/10 rounded-full blur-[100px] absolute top-[-10%] left-[-10%]"></div>
        <div className="w-[40vw] h-[40vw] bg-[#12372A]/10 rounded-full blur-[120px] absolute bottom-[-10%] right-[-10%]"></div>
      </div>

      <div className="w-full max-w-[440px] relative z-10 flex flex-col gap-8">
        
        <div className="flex flex-col items-center text-center">
          <div className="bg-transparent drop-shadow-[0_0_20px_rgba(251,250,218,0.15)] -mb-8">
            <img src="/logo-nobg.png" alt="SecArena Logo" className="w-64 h-64 sm:w-96 sm:h-96 object-contain" />
          </div>
          <div className="z-10 relative">
            <p className="text-sm font-bold tracking-[0.3em] text-[#12372A] uppercase">Student Portal</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-[#FBFADA]/30 bg-[#33503C]/40 backdrop-blur-xl shadow-2xl relative">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#12372A] to-[#33503C] opacity-80 rounded-t-3xl"></div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#FBFADA] mb-1.5">Create Account</h2>
            <p className="text-sm text-[#FBFADA]/80 font-medium">Join SecArena to access cyber training scenarios.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-[#FBFADA]/90 uppercase tracking-wider">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="student_alex"
                className="input-modern"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-[#FBFADA]/90 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="input-modern"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-[#FBFADA]/90 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-modern"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-[#FBFADA]/90 uppercase tracking-wider">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="input-modern"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 font-bold rounded-xl text-sm transition-all flex justify-center items-center gap-2 active:scale-[0.98] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 text-white shadow-blue-900/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Register Account</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="text-center">
          <p className="text-sm text-[#12372A] font-medium">
            Already registered?{' '}
            <button
              onClick={onNavigateToLogin}
              className="font-bold underline decoration-[#12372A]/30 underline-offset-4 hover:decoration-[#12372A] transition-all"
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
