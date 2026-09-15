import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { StudentLabCatalogPage } from './pages/student/StudentLabCatalogPage';
import { StudentLabDetailPage } from './pages/student/StudentLabDetailPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { StudentEventsPage } from './pages/student/StudentEventsPage';
import { StudentEventDetailPage } from './pages/student/StudentEventDetailPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { StudentSimulationPage } from './pages/student/StudentSimulationPage';
import { PvpDashboardPage } from './pages/student/PvpDashboardPage';
import { AboutPage } from './pages/AboutPage';

function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/login');
  const [selectedLabSlug, setSelectedLabSlug] = useState<string | null>(null);
const [selectedEventId, setSelectedEventId] = useState<string | undefined>(undefined);
const [simulationId, setSimulationId] = useState<string | undefined>(undefined);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/admin') {
          navigateTo('/login');
        }
      } else if (user) {
        if (currentPath === '/' || currentPath === '/login' || currentPath === '/register' || currentPath === '/admin') {
          if (user.role === 'admin') {
            navigateTo('/admin/dashboard'); } else {
            navigateTo('/student/dashboard');
          }
        }
      }
    }
  }, [isAuthenticated, isLoading, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center text-cyan-400 font-mono text-sm">
        Initializing SecArena Platform Core...
      </div>
    );
  }

  // Public Unauthenticated Pages
  if (!isAuthenticated) {
    if (currentPath === '/register') {
      return <RegisterPage onNavigateToLogin={() => navigateTo('/login')} />;
    }
    if (currentPath === '/admin') {
      return <LoginPage portal="admin" onNavigateToRegister={() => navigateTo('/register')} onSuccess={() => navigateTo('/admin/dashboard')} />;
    }
    return (
      <LoginPage
        portal="student"
        onNavigateToRegister={() => navigateTo('/register')}
        
        onSuccess={() => navigateTo('/student/dashboard')}
      />
    );
  }

  if (currentPath === '/admin/dashboard') {
    return (
      <ProtectedRoute allowedRoles={['admin']} onNavigateToLogin={() => navigateTo('/admin')} onNavigateToHome={() => navigateTo('/')}>
        <AdminDashboardPage />
      </ProtectedRoute>
    );
  }

  // Authenticated Main Application Views
  return (
    <AppLayout currentPath={currentPath} onNavigate={navigateTo}>
      {currentPath === '/student/dashboard' && (
        <ProtectedRoute allowedRoles={['student']} onNavigateToLogin={() => navigateTo('/login')} onNavigateToHome={() => navigateTo('/student/dashboard')}>
          <StudentDashboardPage onNavigate={navigateTo} />
        </ProtectedRoute>
      )}

      {(currentPath === '/student/profile') && (
        <ProtectedRoute allowedRoles={['student']} onNavigateToLogin={() => navigateTo('/login')} onNavigateToHome={() => navigateTo('/student/dashboard')}>
          <ProfilePage />
        </ProtectedRoute>
      )}

      {currentPath === '/student/labs' && (
        <ProtectedRoute allowedRoles={['student']} onNavigateToLogin={() => navigateTo('/login')} onNavigateToHome={() => navigateTo('/student/dashboard')}>
          <StudentLabCatalogPage
            onSelectLab={(slug) => {
              setSelectedLabSlug(slug);
              navigateTo(`/student/labs/${slug}`);
            }}
            onJoinPvp={(id) => {
              setSimulationId(id);
              navigateTo(`/student/pvp/${id}`);
            }}
          />
        </ProtectedRoute>
      )}

      {currentPath === '/student/events' && (
        <ProtectedRoute allowedRoles={['student']} onNavigateToLogin={() => navigateTo('/login')} onNavigateToHome={() => navigateTo('/student/dashboard')}>
          <StudentEventsPage onOpen={(eventId) => { setSelectedEventId(eventId); navigateTo(`/student/events/${eventId}`); }} />
        </ProtectedRoute>
      )}

      {currentPath.startsWith('/student/events/') && (
        <ProtectedRoute allowedRoles={['student']} onNavigateToLogin={() => navigateTo('/login')} onNavigateToHome={() => navigateTo('/student/dashboard')}>
          <StudentEventDetailPage eventId={selectedEventId || currentPath.split('/')[3]} onBack={() => navigateTo('/student/events')} onOpenLab={(slug) => navigateTo(`/student/labs/${slug}`)} />
        </ProtectedRoute>
      )}

      {currentPath.startsWith('/student/labs/') && (
        <ProtectedRoute allowedRoles={['student']} onNavigateToLogin={() => navigateTo('/login')} onNavigateToHome={() => navigateTo('/student/dashboard')}>
          <StudentLabDetailPage
            slug={selectedLabSlug || currentPath.replace('/student/labs/', '')}
            onBack={() => navigateTo('/student/labs')}
            onStartSimulation={() => navigateTo('/student/simulations')}
          />
        </ProtectedRoute>
      )}

      {currentPath === '/student/progress' && (
        <ProtectedRoute allowedRoles={['student']} onNavigateToLogin={() => navigateTo('/login')} onNavigateToHome={() => navigateTo('/student/dashboard')}>
          <PlaceholderPage
            title="Student Learning Progress"
            phase="Phase 5 (CTF Flags & Scoring)"
            description="Track challenge submission metrics, skill points, and exercise completion history."
          />
        </ProtectedRoute>
      )}

      {currentPath === '/student/simulations' || currentPath.startsWith('/student/simulations/') ? (
        <ProtectedRoute allowedRoles={['student']} onNavigateToLogin={() => navigateTo('/login')} onNavigateToHome={() => navigateTo('/student/dashboard')}>
          <StudentSimulationPage sessionId={simulationId || (currentPath.startsWith('/student/simulations/') ? currentPath.split('/')[3] : undefined)} onSessionStarted={(id) => { setSimulationId(id); navigateTo(`/student/simulations/${id}`); }} />
        </ProtectedRoute>
      ) : null}

      {currentPath === '/student/pvp' || currentPath.startsWith('/student/pvp/') ? (
        <ProtectedRoute allowedRoles={['student']} onNavigateToLogin={() => navigateTo('/login')} onNavigateToHome={() => navigateTo('/student/dashboard')}>
          <PvpDashboardPage sessionId={simulationId || (currentPath.startsWith('/student/pvp/') ? currentPath.split('/')[3] : undefined)} onLeave={() => navigateTo('/student/labs')} />
        </ProtectedRoute>
      ) : null}





      


      


      {currentPath === '/about' && (
        <ProtectedRoute allowedRoles={['student', 'admin']} onNavigateToLogin={() => navigateTo('/login')} onNavigateToHome={() => navigateTo('/student/dashboard')}>
          <AboutPage />
        </ProtectedRoute>
      )}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
