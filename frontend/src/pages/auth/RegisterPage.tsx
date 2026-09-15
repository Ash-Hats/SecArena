import React, { useState } from 'react';
import { Shield, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen bg-[#8E9F7C] text-[#FBFADA] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#33503C]/30">
      
      {/* Animated Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#33503C]/20 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#33503C]/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md space-y-6 z-20">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-[#33503C] border border-[#33503C]/50 text-[#FBFADA] mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#FBFADA]">SecArena</h1>
          <p className="text-xs text-[#FBFADA] font-mono uppercase tracking-widest">Student Account Registration</p>
        </div>

        <div className="glass-panel rounded-2xl p-6 sm:p-8 relative overflow-hidden group border border-[#33503C]/50">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#33503C] to-[#12372A]"></div>
          
          <>
              <div className="border-b border-[#33503C]/50 pb-4">
                <h2 className="text-xl font-bold text-[#FBFADA]">Create Student Account</h2>
                <p className="text-xs text-[#FBFADA] mt-1">Join SecArena to access cyber training scenarios.</p>
              </div>

              {error && (
                <div className="p-3 mt-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 mt-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-[#FBFADA] mb-1.5 uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="student_alex"
                    className="input-modern"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#FBFADA] mb-1.5 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="input-modern"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#FBFADA] mb-1.5 uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-modern"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#FBFADA] mb-1.5 uppercase tracking-wider">Confirm Password</label>
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
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-[#FBFADA] font-bold rounded-lg text-sm transition-all transform hover:-translate-y-0.5 shadow-none flex items-center justify-center space-x-2 disabled:opacity-50 disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Register Account</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-[#33503C]/50 text-center text-sm text-[#FBFADA] flex justify-between items-center">
                <span>Already registered?</span>
                <button
                  onClick={onNavigateToLogin}
                  className="text-[#FBFADA] hover:text-cyan-300 font-bold transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </>
        </div>
      </div>
    </div>
  );
};
