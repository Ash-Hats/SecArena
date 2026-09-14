import React from 'react';
import { LayoutDashboard, BookOpen, Users, BarChart3, UserCheck, Cpu, CalendarDays, Terminal, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const { user } = useAuth();
  const isInstructor = user?.role === 'instructor';

  const studentNavItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'PvP Mode', path: '/student/labs', icon: BookOpen },
    { label: 'Simulator', path: '/student/simulations', icon: Terminal },
    { label: 'My Profile', path: '/student/profile', icon: UserCheck },
    { label: 'About', path: '/about', icon: Info },
  ];

  const instructorNavItems = [
    { label: 'Dashboard', path: '/instructor/dashboard', icon: LayoutDashboard },
    { label: 'Training Events', path: '/instructor/events', icon: CalendarDays },
    { label: 'Lab Management', path: '/instructor/labs', icon: BookOpen },
    { label: 'Students Overview', path: '/instructor/students', icon: Users },
    { label: 'My Profile', path: '/instructor/profile', icon: UserCheck },
    { label: 'Analytics', path: '/instructor/analytics', icon: BarChart3, badge: 'Phase 10' },
    { label: 'About', path: '/about', icon: Info },
  ];

  const navItems = isInstructor ? instructorNavItems : studentNavItems;

  return (
    <aside className="w-64 border-r border-[#33503C] bg-[#33503C]/50 backdrop-blur-md flex flex-col justify-between flex-shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {/* Role Identity Tag */}
        <div className="px-3 py-2 rounded-lg bg-[#33503C] border border-[#33503C] flex items-center space-x-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${isInstructor ? 'bg-[#33503C] animate-pulse' : 'bg-[#12372A] animate-pulse'}`} />
          <span className="font-mono text-[#FBFADA] capitalize">{user?.role} Portal</span>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path) && item.path !== '/student/labs' && item.path !== '/instructor/labs');

            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#33503C]/20 text-[#FBFADA] border border-[#33503C]/30 shadow-inner'
                    : 'text-[#FBFADA]/60 hover:text-[#FBFADA] hover:bg-[#33503C]/50 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-[#33503C] bg-[#8E9F7C]/80 text-[11px] text-[#FBFADA]/50 space-y-1">
        <div className="flex items-center space-x-1.5 text-[#FBFADA]/80 font-mono">
          <Cpu className="w-3.5 h-3.5 text-[#FBFADA]" />
          <span>SecArena v0.3.0</span>
        </div>
        <p className="text-[10px] leading-relaxed text-[#FBFADA]/40">
          Browser-based cyber simulation & defense training
        </p>
      </div>
    </aside>
  );
};
