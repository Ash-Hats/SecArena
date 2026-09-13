import { Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0d1322]/90 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand Identification */}
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-wider text-white">SecArena</span>
          <span className="hidden sm:inline-block text-[10px] text-cyan-400/80 font-mono ml-2 border border-cyan-500/20 px-1.5 py-0.5 rounded bg-cyan-500/5">
            Cyber Training Platform
          </span>
        </div>
      </div>

      {/* User Information & Actions */}
      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold uppercase">
              {user.username.substring(0, 2)}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-slate-200 font-medium">{user.username}</span>
              <span className="text-[10px] font-mono uppercase text-cyan-400">{user.role}</span>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/30 transition-all flex items-center space-x-1.5 text-xs font-medium"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
