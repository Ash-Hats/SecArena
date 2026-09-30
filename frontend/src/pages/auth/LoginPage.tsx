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
        {/* Subtle Cybersecurity Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: 'linear-gradient(#12372A 1px, transparent 1px), linear-gradient(90deg, #12372A 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
          }}
        ></div>
        <div className="w-[50vw] h-[50vw] bg-[#33503C]/10 rounded-full blur-[100px] absolute top-[-10%] left-[-10%]"></div>
        <div className="w-[40vw] h-[40vw] bg-[#12372A]/10 rounded-full blur-[120px] absolute bottom-[-10%] right-[-10%]"></div>
      </div>

      <div className="w-full max-w-[960px] relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center px-4">
        
        {/* Left Side: Branding */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center md:items-start text-center md:text-left"
        >
          <div className="bg-transparent drop-shadow-[0_0_30px_rgba(251,250,218,0.2)] -mb-4 md:-mb-8 md:-ml-6">
            <img src="/logo-nobg.png" alt="SecArena Logo" className="w-64 h-64 sm:w-80 sm:h-80 md:w-[400px] md:h-[400px] object-contain hover:scale-105 transition-transform duration-700 ease-out" />
          </div>
          <div className="z-10 relative md:ml-6 mt-4">
            {portal === 'student' && (
              <div className="text-[#12372A]/80 font-medium max-w-sm leading-relaxed hidden md:block space-y-5">
                <p className="text-[#12372A] font-black text-xl tracking-tight uppercase">Cybersecurity Training Arena</p>
                <p className="text-sm">
                  Practice ethical hacking through interactive security simulations, build practical skills, and test your knowledge in realistic cyber environments.
                </p>
                <ul className="space-y-2 mt-4 text-sm font-semibold">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-sm bg-[#12372A]/60"></span> Hands-on Linux and security practice
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-sm bg-[#12372A]/60"></span> Competitive PvP security challenges
                  </li>
                </ul>
              </div>
            )}
            {portal === 'admin' && (
              <div className="text-[#12372A]/80 font-medium max-w-sm leading-relaxed hidden md:block space-y-5">
                <p className="text-[#12372A] font-black text-xl tracking-tight uppercase">Cybersecurity Command Center</p>
                <p className="text-sm">
                  Oversee student progress, manage vulnerable labs, and orchestrate complex cybersecurity scenarios with precision and visibility.
                </p>
                <ul className="space-y-2 mt-4 text-sm font-semibold">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-sm bg-[#12372A]/60"></span> Monitor live student sessions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-sm bg-[#12372A]/60"></span> Provision & orchestrate environments
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-sm bg-[#12372A]/60"></span> Analyze performance metrics
                  </li>
                </ul>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Side: Form & Actions */}
        <div className="flex flex-col gap-6 w-full max-w-[440px] mx-auto md:max-w-none">
          {/* Form Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-panel p-8 sm:p-10 rounded-3xl border border-[#FBFADA]/30 bg-[#33503C]/40 backdrop-blur-xl shadow-2xl relative"
          >
            {/* Subtle Top Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#12372A] to-[#33503C] opacity-80 rounded-t-3xl"></div>

            <div className="mb-8 border-b border-[#FBFADA]/10 pb-6">
              <h2 className="text-2xl font-bold text-[#FBFADA] tracking-tight mb-2">Welcome back</h2>
              <p className="text-sm text-[#FBFADA]/80 font-medium">Sign in to continue your cybersecurity training.</p>
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#FBFADA]/80 uppercase tracking-widest">
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
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#FBFADA]/80 uppercase tracking-widest">
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

              <div className="pt-2">
                <button 
                  disabled={loading} 
                  className={`w-full py-3.5 px-4 font-bold rounded-xl text-sm transition-all duration-200 flex justify-center items-center gap-2 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed ${
                    portal === 'admin' 
                      ? 'bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-600 hover:to-purple-700 text-white shadow-purple-900/20 active:bg-purple-900' 
                      : 'bg-gradient-to-r from-cyan-800 to-cyan-900 hover:from-cyan-700 hover:to-cyan-800 text-white shadow-cyan-900/20 active:bg-cyan-950'
                  }`}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4 opacity-80" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
          
          {/* Footer Actions */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center md:text-right"
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
    </div>
  );
};
