import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/auth';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  onNavigateToLogin: () => void;
  onNavigateToHome: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  onNavigateToLogin,
  onNavigateToHome,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex flex-col items-center justify-center text-slate-400 font-mono text-sm space-y-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span>Verifying Security Credentials...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    onNavigateToLogin();
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">403 — Access Denied</h2>
        <p className="text-slate-400 max-w-md text-sm leading-relaxed">
          Your account role (<span className="text-rose-400 font-mono uppercase">{user.role}</span>) does not have authorization to view this protected resource.
        </p>
        <button
          onClick={onNavigateToHome}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-medium transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
