import { Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-[#33503C] bg-[#33503C]/90 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand Identification */}
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-[#33503C]/10 border border-[#33503C]/30 text-[#FBFADA]">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-wider text-[#FBFADA]">SecArena</span>
          <span className="hidden sm:inline-block text-[10px] text-[#FBFADA]/80 font-mono ml-2 border border-[#33503C]/20 px-1.5 py-0.5 rounded bg-[#33503C]/5">
            Cyber Training Platform
          </span>
        </div>
      </div>

      {/* User Information & Actions */}
      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3 bg-[#8E9F7C]/80 border border-[#33503C] px-3 py-1.5 rounded-lg text-xs">
            <div className="w-7 h-7 rounded-full bg-[#33503C]/20 border border-[#33503C]/40 flex items-center justify-center text-[#FBFADA] font-bold uppercase">
              {user.username.substring(0, 2)}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[#FBFADA] font-medium">{user.username}</span>
              <span className="text-[10px] font-mono uppercase text-[#FBFADA]">{user.role}</span>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="p-2 text-[#FBFADA]/60 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/30 transition-all flex items-center space-x-1.5 text-xs font-medium"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
