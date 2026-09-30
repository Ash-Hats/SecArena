import React, { useState } from 'react';
import { ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/auth';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginPageProps {
  portal: UserRole;
  onNavigateToRegister: () => void;
  onSuccess: (role: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ portal, onNavigateToRegister, onSuccess }) => {
  const { login, logout } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const portalName = portal === 'admin' ? 'Administrator' : 'Student';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) return setError('Please fill in all fields.');
    setLoading(true);
    setError(null);
    try {
      const signedInUser = await login({ username_or_email: usernameOrEmail, password });
      if (signedInUser.role !== portal) {
        logout();
        throw new Error(`This account belongs to the ${signedInUser.role === 'admin' ? 'Administrator' : 'Student'} portal.`);
      }
      onSuccess(signedInUser.role);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
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
        
        {/* Branding Area */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center space-y-4"
        >
          <div className="p-3 bg-transparent rounded-2xl drop-shadow-[0_0_15px_rgba(251,250,218,0.2)]">
            <img src="/logo-nobg.png" alt="SecArena Logo" className="w-20 h-20 object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#12372A] tracking-tighter uppercase">SecArena</h1>
            <p className="text-xs font-semibold tracking-[0.25em] text-[#33503C] uppercase mt-1">{portalName} Portal</p>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-panel p-8 sm:p-10 rounded-3xl border border-[#FBFADA]/30 bg-[#33503C]/40 backdrop-blur-xl shadow-2xl relative"
        >
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#12372A] to-[#33503C] opacity-80 rounded-t-3xl"></div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#FBFADA] mb-1.5">Welcome back</h2>
            <p className="text-sm text-[#FBFADA]/80 font-medium">Sign in to continue to the platform</p>
          </div>
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium flex gap-3 items-center">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-[#FBFADA]/90 uppercase tracking-wider">
                Email / Username
              </label>
              <input 
                value={usernameOrEmail} 
                onChange={(e) => setUsernameOrEmail(e.target.value)} 
                className="input-modern" 
                placeholder="Enter your credentials"
                autoComplete="username"
                required 
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-[#FBFADA]/90 uppercase tracking-wider">
                Password
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="input-modern" 
                placeholder="••••••••"
                autoComplete="current-password"
                required 
              />
            </div>

            <button 
              disabled={loading} 
              className={`w-full py-3.5 px-4 font-bold rounded-xl text-sm transition-all flex justify-center items-center gap-2 active:scale-[0.98] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed ${
                portal === 'admin' 
                  ? 'bg-gradient-to-r from-purple-700 to-fuchsia-700 hover:from-purple-600 hover:to-fuchsia-600 text-white shadow-purple-900/20' 
                  : 'bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 text-white shadow-blue-900/20'
              }`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>
        
        {/* Footer Actions */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          {portal === 'student' ? (
            <p className="text-sm text-[#12372A] font-medium">
              Don't have an account?{' '}
              <button 
                onClick={onNavigateToRegister} 
                className="font-bold underline decoration-[#12372A]/30 underline-offset-4 hover:decoration-[#12372A] transition-all"
              >
                Make one
              </button>
            </p>
          ) : (
            <p className="text-xs text-[#12372A]/70 font-medium">
              Administrator access is provisioned by the server owner.
            </p>
          )}
        </motion.div>

      </div>
    </div>
  );
};
