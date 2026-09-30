import { LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-[#12372A]/20 bg-[#33503C]/60 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Brand Identification */}
      <div className="flex items-center space-x-3.5">
        <div className="flex items-center justify-center p-1 rounded-xl bg-transparent border border-transparent">
          <img src="/logo-nobg.png" alt="SecArena Logo" className="w-9 h-9 object-contain drop-shadow-[0_0_8px_rgba(251,250,218,0.3)]" />
        </div>
        <div className="flex items-center">
          <span className="text-xl font-black tracking-tighter text-[#FBFADA]">SecArena</span>
          <span className="hidden sm:inline-block text-[9px] font-bold tracking-widest text-[#FBFADA]/80 font-mono ml-3 border border-[#12372A]/40 px-2 py-1 rounded-md bg-[#12372A]/20 uppercase shadow-inner">
            Cyber Training Platform
          </span>
        </div>
      </div>

      {/* User Information & Actions */}
      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3 bg-[#12372A]/20 border border-[#12372A]/30 px-3 py-1.5 rounded-xl shadow-inner">
            <div className="w-8 h-8 rounded-lg bg-[#12372A]/80 border border-[#FBFADA]/20 flex items-center justify-center text-[#FBFADA] font-black uppercase text-sm shadow-md">
              {user.username.substring(0, 2)}
            </div>
            <div className="hidden sm:flex flex-col text-left pr-2">
              <span className="text-[#FBFADA] font-bold text-[13px] leading-tight">{user.username}</span>
              <span className="text-[9px] font-bold font-mono uppercase tracking-widest text-[#FBFADA]/60 leading-tight">{user.role}</span>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="p-2.5 text-[#FBFADA]/60 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/30 transition-all flex items-center space-x-2 text-xs font-bold active:scale-95"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
