import React, { useState } from 'react';
import { Shield, ArrowRight, AlertCircle, Loader2, GraduationCap, TerminalSquare, KeyRound } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/auth';
import { motion, AnimatePresence } from 'framer-motion';

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
  const portalName = portal === 'admin' ? 'Administrator' : isTeacher ? 'Instructor' : 'Student';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) return setError('Please fill in all fields.');
    setLoading(true);
    setError(null);
    try {
      const signedInUser = await login({ username_or_email: usernameOrEmail, password });
      if (signedInUser.role !== portal) {
        logout();
        throw new Error(`This account belongs to the ${signedInUser.role === 'admin' ? 'Administrator' : signedInUser.role === 'instructor' ? 'Instructor' : 'Student'} portal.`);
      }
      onSuccess(signedInUser.role);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#8E9F7C] text-[#FBFADA] flex overflow-hidden selection:bg-[#33503C]/30">
      
      {/* Left Art Section */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-center items-center p-12 overflow-hidden border-r border-[#33503C]/40 z-10">
        <div className={`absolute inset-0 opacity-20 ${isTeacher ? 'bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#33503C] via-[#8E9F7C] to-[#8E9F7C]' : 'bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#33503C] via-[#8E9F7C] to-[#8E9F7C]'}`}></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#33503C]/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#33503C]/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-20 text-center max-w-lg"
        >
          <div className="flex justify-center mb-8">
            <div className={`p-4 rounded-2xl bg-[#8E9F7C]/50 backdrop-blur-xl border shadow-2xl ${isTeacher ? 'border-[#33503C]/50 text-[#FBFADA] shadow-none' : 'border-[#33503C]/50 text-[#FBFADA] shadow-none'}`}>
              <Shield className="w-16 h-16" />
            </div>
          </div>
          <h1 className="text-5xl font-black text-[#FBFADA] tracking-tighter mb-6 text-gradient">SecArena</h1>
          <p className="text-lg text-[#FBFADA] leading-relaxed">
            {isTeacher 
              ? "Design, deploy, and manage immersive cyber warfare scenarios for your cohort."
              : "Step into the simulation. Enhance your cybersecurity skills through hands-on, realistic challenges."}
          </p>
          
          <div className="mt-12 grid grid-cols-2 gap-4 text-left">
            <div className="bg-[#33503C]/40 backdrop-blur-md p-4 rounded-xl border border-[#33503C]/40">
              <TerminalSquare className="w-6 h-6 text-[#FBFADA] mb-2" />
              <h3 className="text-sm font-bold text-[#FBFADA]">Interactive Terminals</h3>
            </div>
            <div className="bg-[#33503C]/40 backdrop-blur-md p-4 rounded-xl border border-[#33503C]/40">
              <KeyRound className="w-6 h-6 text-[#FBFADA] mb-2" />
              <h3 className="text-sm font-bold text-[#FBFADA]">Red vs Blue PvP</h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Login Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative z-20 bg-[#8E9F7C]/80 backdrop-blur-xl">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left space-y-2">
            <div className="lg:hidden flex justify-center mb-6">
              <div className={`p-3 rounded-xl bg-[#33503C] border ${isTeacher ? 'border-[#33503C]/50 text-[#FBFADA]' : 'border-[#33503C]/50 text-[#FBFADA]'}`}>
                {isTeacher ? <GraduationCap className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-[#FBFADA] tracking-tight">Welcome Back</h2>
            <p className="text-sm text-[#FBFADA] font-mono uppercase tracking-widest">{portalName} Portal</p>
          </div>

          <div className="glass-panel rounded-2xl p-6 sm:p-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#33503C] to-[#12372A]"></div>
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex gap-2 items-center"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#FBFADA] mb-1.5 uppercase tracking-wider">Username or email</label>
                <input 
                  value={usernameOrEmail} 
                  onChange={(e) => setUsernameOrEmail(e.target.value)} 
                  className="input-modern" 
                  placeholder="Enter your credentials"
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#FBFADA] mb-1.5 uppercase tracking-wider">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="input-modern" 
                  placeholder="••••••••"
                  required 
                />
              </div>
              <button 
                disabled={loading} 
                className={`w-full py-3 text-[#FBFADA] font-bold rounded-lg text-sm transition-all transform hover:-translate-y-0.5 shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:transform-none ${
                  isTeacher 
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 shadow-none' 
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-none'
                }`}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>Authenticate</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-[#33503C]/50 text-center text-sm text-[#FBFADA] space-y-4">
              {portal === 'admin' ? (
                <p>Administrator access is provisioned by the server owner.</p>
              ) : isTeacher ? (
                <>
                  <p>Instructor accounts require an administrator invitation.</p>
                  <button onClick={onNavigateToOtherPortal} className="text-[#FBFADA] font-medium hover:text-cyan-300 transition-colors">Switch to Student Portal →</button>
                </>
              ) : (
                <>
                  <div className="flex justify-center items-center gap-2">
                    <span>New recruit?</span>
                    <button onClick={onNavigateToRegister} className="text-[#FBFADA] font-bold hover:text-cyan-300 transition-colors">Request Access</button>
                  </div>
                  <button onClick={onNavigateToOtherPortal} className="text-[#FBFADA] font-medium hover:text-purple-300 transition-colors text-xs">Instructor Login</button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
