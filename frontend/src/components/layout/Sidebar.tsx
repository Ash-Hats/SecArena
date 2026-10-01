import React from 'react';
import { LayoutDashboard, BookOpen, UserCheck, Cpu, Terminal, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const { user } = useAuth();

  const studentNavItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'PvP Mode', path: '/student/labs', icon: BookOpen },
    { label: 'Simulator', path: '/student/simulations', icon: Terminal },
    { label: 'My Profile', path: '/student/profile', icon: UserCheck },
    { label: 'About', path: '/about', icon: Info },
  ];

  return (
    <aside className="w-64 border-r border-[#12372A]/20 bg-[#33503C]/30 backdrop-blur-xl flex flex-col justify-between flex-shrink-0 min-h-[calc(100vh-4rem)] shadow-[4px_0_24px_rgba(18,55,42,0.1)]">
      <div className="p-5 space-y-8">
        {}
        <div className="px-3.5 py-2.5 rounded-xl bg-[#12372A]/40 border border-[#12372A]/50 flex items-center space-x-2.5 text-xs shadow-inner">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="font-mono text-[#FBFADA] font-bold tracking-widest uppercase text-[10px]">{user?.role || 'student'} Portal</span>
        </div>

        {}
        <nav className="space-y-1.5">
          {studentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path) && item.path !== '/student/labs');

            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-200 ease-out group active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-[#FBFADA]/30 ${
                  isActive
                    ? 'bg-[#12372A]/60 text-[#FBFADA] border border-[#12372A]/50 shadow-[0_2px_10px_rgba(18,55,42,0.2)]'
                    : 'text-[#FBFADA]/60 hover:text-[#FBFADA] hover:bg-[#12372A]/30 border border-transparent hover:translate-x-1'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <Icon className={`w-4 h-4 transition-all duration-200 ease-out ${isActive ? 'text-[#FBFADA]' : 'text-[#FBFADA]/40 group-hover:text-[#FBFADA] group-hover:scale-110'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {}
      <div className="p-5 border-t border-[#12372A]/20 bg-[#12372A]/10 backdrop-blur-md text-[#FBFADA]/50 space-y-2">
        <div className="flex items-center space-x-2 text-[#FBFADA]/90 font-mono text-xs font-bold">
          <Cpu className="w-4 h-4 text-[#FBFADA]" />
          <span>SecArena v0.3.0</span>
        </div>
        <p className="text-[10px] leading-relaxed text-[#FBFADA]/40 font-medium">
          Browser-based cyber simulation & defense training platform.
        </p>
      </div>
    </aside>
  );
};
