import React from 'react';
import { LayoutDashboard, BookOpen, Users, BarChart3, UserCheck, Cpu, CalendarDays, Terminal } from 'lucide-react';
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
    { label: 'Training Events', path: '/student/events', icon: CalendarDays },
    { label: 'Lab Catalog', path: '/student/labs', icon: BookOpen },
    { label: 'Simulator', path: '/student/simulations', icon: Terminal },
    { label: 'My Profile', path: '/student/profile', icon: UserCheck },
    { label: 'Progress', path: '/student/progress', icon: BarChart3, badge: 'Phase 5' },
  ];

  const instructorNavItems = [
    { label: 'Dashboard', path: '/instructor/dashboard', icon: LayoutDashboard },
    { label: 'Training Events', path: '/instructor/events', icon: CalendarDays },
    { label: 'Lab Management', path: '/instructor/labs', icon: BookOpen },
    { label: 'Students Overview', path: '/instructor/students', icon: Users },
    { label: 'My Profile', path: '/student/profile', icon: UserCheck },
    { label: 'Analytics', path: '/instructor/analytics', icon: BarChart3, badge: 'Phase 10' },
  ];

  const navItems = isInstructor ? instructorNavItems : studentNavItems;

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0d1322] flex flex-col justify-between flex-shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {/* Role Identity Tag */}
        <div className="px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center space-x-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${isInstructor ? 'bg-purple-400 animate-pulse' : 'bg-cyan-400 animate-pulse'}`} />
          <span className="font-mono text-slate-300 capitalize">{user?.role} Portal</span>
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
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center space-x-1.5 text-slate-400 font-mono">
          <Cpu className="w-3.5 h-3.5 text-cyan-500" />
          <span>SecArena v0.3.0</span>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-600">
          Browser-based cyber simulation & defense training
        </p>
      </div>
    </aside>
  );
};
