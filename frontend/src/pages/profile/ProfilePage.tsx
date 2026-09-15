import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfileApi } from '../../services/auth';
import { User, Shield, Save, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload: any = { username, email };
      if (newPassword) {
        if (!oldPassword) throw new Error("Previous password is required to set a new password.");
        payload.old_password = oldPassword;
        payload.new_password = newPassword;
      }

      const updated = await updateProfileApi(payload);
      updateUser(updated);
      setSuccess('Profile updated successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#FBFADA] flex items-center justify-center text-[#FBFADA] text-2xl font-bold shadow-lg border border-[#FBFADA]/30">
          {user?.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#FBFADA] tracking-tight">{user?.username}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-[#FBFADA]/10 border border-[#FBFADA]/20 rounded text-xs font-bold text-[#FBFADA] uppercase tracking-widest flex items-center gap-1">
              <Shield className="w-3 h-3" /> {user?.role}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#33503C] border border-[#FBFADA] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FBFADA]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <h2 className="text-lg font-bold text-[#FBFADA] mb-6 relative z-10 flex items-center gap-2">
          <User className="w-5 h-5 text-[#FBFADA]" /> Account Details
        </h2>
        
        {error && <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm relative z-10">{error}</div>}
        {success && <div className="mb-6 p-3 rounded-lg bg-[#FBFADA]/50 border border-[#FBFADA] text-[#FBFADA] text-sm relative z-10">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#FBFADA]/80 mb-1">Username / Name</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#8E9F7C] border border-[#FBFADA] focus:border-[#FBFADA] rounded-lg px-4 py-2.5 text-[#FBFADA] outline-none transition-colors shadow-inner"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#FBFADA]/80 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#8E9F7C] border border-[#FBFADA] focus:border-[#FBFADA] rounded-lg px-4 py-2.5 text-[#FBFADA] placeholder:text-[#FBFADA]/60 outline-none transition-colors shadow-inner"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#FBFADA]/50 space-y-4">
            <h3 className="text-sm font-bold text-[#FBFADA] flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#FBFADA]" /> Security
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#FBFADA]/80 mb-1">Previous Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-[#8E9F7C] border border-[#FBFADA] focus:border-[#FBFADA] rounded-lg px-4 py-2.5 text-[#FBFADA] placeholder:text-[#FBFADA]/60 outline-none transition-colors shadow-inner"
                  placeholder="Required for change"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#FBFADA]/80 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#8E9F7C] border border-[#FBFADA] focus:border-[#FBFADA] rounded-lg px-4 py-2.5 text-[#FBFADA] placeholder:text-[#FBFADA]/60 outline-none transition-colors shadow-inner"
                  placeholder="Min 8 characters"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-end">
            <button
              type="submit"
              disabled={loading || (username === user?.username && email === user?.email && !newPassword)}
              className="px-6 py-2.5 bg-[#FBFADA] text-[#12372A] font-bold rounded-lg hover:bg-[#e6e5c5] shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
