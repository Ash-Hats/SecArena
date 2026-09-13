import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentLabCatalogPage } from './pages/student/StudentLabCatalogPage';
import { StudentLabDetailPage } from './pages/student/StudentLabDetailPage';
import { InstructorDashboardPage } from './pages/instructor/InstructorDashboardPage';
import { InstructorStudentsPage } from './pages/instructor/InstructorStudentsPage';
import { InstructorLabManagementPage } from './pages/instructor/InstructorLabManagementPage';
import { InstructorLabEditorPage } from './pages/instructor/InstructorLabEditorPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { StudentEventsPage } from './pages/student/StudentEventsPage';
import { StudentEventDetailPage } from './pages/student/StudentEventDetailPage';
import { InstructorEventsPage } from './pages/instructor/InstructorEventsPage';
import { InstructorEventEditorPage } from './pages/instructor/InstructorEventEditorPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { StudentSimulationPage } from './pages/student/StudentSimulationPage';

function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/login');
  const [selectedLabSlug, setSelectedLabSlug] = useState<string | null>(null);
  const [editingLabId, setEditingLabId] = useState<string | undefined>(undefined);
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>(undefined);
  const [editingEventId, setEditingEventId] = useState<string | undefined>(undefined);
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
        if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/teacher/login' && currentPath !== '/admin') {
          navigateTo('/login');
        }
      } else if (user) {
        if (currentPath === '/' || currentPath === '/login' || currentPath === '/register' || currentPath === '/teacher/login' || currentPath === '/admin') {
          if (user.role === 'admin') {
            navigateTo('/admin/dashboard');
          } else if (user.role === 'instructor') {
            navigateTo('/instructor/dashboard');
          } else {
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
    if (currentPath === '/teacher/login') {
      return <LoginPage portal="instructor" onNavigateToRegister={() => navigateTo('/register')} onNavigateToOtherPortal={() => navigateTo('/login')} onSuccess={() => navigateTo('/instructor/dashboard')} />;
    }
    if (currentPath === '/admin') {
      return <LoginPage portal="admin" onNavigateToRegister={() => navigateTo('/register')} onNavigateToOtherPortal={() => navigateTo('/login')} onSuccess={() => navigateTo('/admin/dashboard')} />;
    }
    return (
      <LoginPage
        portal="student"
        onNavigateToRegister={() => navigateTo('/register')}
        onNavigateToOtherPortal={() => navigateTo('/teacher/login')}
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
        <ProtectedRoute allowedRoles={['student', 'instructor']} onNavigateToLogin={() => navigateTo('/login')} onNavigateToHome={() => navigateTo('/student/dashboard')}>
          <StudentDashboardPage onNavigate={navigateTo} />
        </ProtectedRoute>
      )}

      {currentPath === '/student/profile' && (
        <ProtectedRoute allowedRoles={['student', 'instructor']} onNavigateToLogin={() => navigateTo('/login')} onNavigateToHome={() => navigateTo('/student/dashboard')}>
          <StudentProfilePage />
        </ProtectedRoute>
      )}

      {currentPath === '/student/labs' && (
        <ProtectedRoute allowedRoles={['student', 'instructor']} onNavigateToLogin={() => navigateTo('/login')} onNavigateToHome={() => navigateTo('/student/dashboard')}>
          <StudentLabCatalogPage
            onSelectLab={(slug) => {
              setSelectedLabSlug(slug);
              navigateTo(`/student/labs/${slug}`);
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
        <ProtectedRoute allowedRoles={['student', 'instructor']} onNavigateToLogin={() => navigateTo('/login')} onNavigateToHome={() => navigateTo('/student/dashboard')}>
          <StudentLabDetailPage
            slug={selectedLabSlug || currentPath.replace('/student/labs/', '')}
            onBack={() => navigateTo('/student/labs')}
            onStartSimulation={() => navigateTo('/student/simulations')}
          />
        </ProtectedRoute>
      )}

      {currentPath === '/student/progress' && (
        <ProtectedRoute allowedRoles={['student', 'instructor']} onNavigateToLogin={() => navigateTo('/login')} onNavigateToHome={() => navigateTo('/student/dashboard')}>
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

      {currentPath === '/instructor/dashboard' && (
        <ProtectedRoute allowedRoles={['instructor']} onNavigateToLogin={() => navigateTo('/login')} onNavigateToHome={() => navigateTo('/student/dashboard')}>
          <InstructorDashboardPage onNavigate={navigateTo} />
        </ProtectedRoute>
      )}

      {currentPath === '/instructor/students' && (
        <ProtectedRoute allowedRoles={['instructor']} onNavigateToLogin={() => navigateTo('/login')} onNavigateToHome={() => navigateTo('/student/dashboard')}>
          <InstructorStudentsPage />
        </ProtectedRoute>
      )}

      {currentPath === '/instructor/labs' && (
        <ProtectedRoute allowedRoles={['instructor']} onNavigateToLogin={() => navigateTo('/login')} onNavigateToHome={() => navigateTo('/student/dashboard')}>
          <InstructorLabManagementPage
            onNavigateToNew={() => {
              setEditingLabId(undefined);
              navigateTo('/instructor/labs/new');
            }}
            onNavigateToEdit={(labId) => {
              setEditingLabId(labId);
              navigateTo(`/instructor/labs/${labId}/edit`);
            }}
          />
        </ProtectedRoute>
      )}

      {currentPath === '/instructor/events' && (
        <ProtectedRoute allowedRoles={['instructor']} onNavigateToLogin={() => navigateTo('/login')} onNavigateToHome={() => navigateTo('/instructor/dashboard')}>
          <InstructorEventsPage onCreate={() => { setEditingEventId(undefined); navigateTo('/instructor/events/new'); }} onEdit={(eventId) => { setEditingEventId(eventId); navigateTo(`/instructor/events/${eventId}/edit`); }} />
        </ProtectedRoute>
      )}

      {(currentPath === '/instructor/events/new' || currentPath.startsWith('/instructor/events/') && currentPath.endsWith('/edit')) && (
        <ProtectedRoute allowedRoles={['instructor']} onNavigateToLogin={() => navigateTo('/login')} onNavigateToHome={() => navigateTo('/instructor/dashboard')}>
          <InstructorEventEditorPage eventId={editingEventId || (currentPath.endsWith('/edit') ? currentPath.split('/')[3] : undefined)} onBack={() => navigateTo('/instructor/events')} />
        </ProtectedRoute>
      )}

      {currentPath === '/instructor/labs/new' && (
        <ProtectedRoute allowedRoles={['instructor']} onNavigateToLogin={() => navigateTo('/login')} onNavigateToHome={() => navigateTo('/student/dashboard')}>
          <InstructorLabEditorPage onBack={() => navigateTo('/instructor/labs')} />
        </ProtectedRoute>
      )}

      {currentPath.includes('/edit') && (
        <ProtectedRoute allowedRoles={['instructor']} onNavigateToLogin={() => navigateTo('/login')} onNavigateToHome={() => navigateTo('/student/dashboard')}>
          <InstructorLabEditorPage
            labId={editingLabId || currentPath.split('/')[3]}
            onBack={() => navigateTo('/instructor/labs')}
          />
        </ProtectedRoute>
      )}

      {currentPath === '/instructor/analytics' && (
        <ProtectedRoute allowedRoles={['instructor']} onNavigateToLogin={() => navigateTo('/login')} onNavigateToHome={() => navigateTo('/student/dashboard')}>
          <PlaceholderPage
            title="Cohort Analytics Platform"
            phase="Phase 10 (Advanced Analytics & Research Evaluation)"
            description="Evaluate student learning velocity, exercise difficulty ratings, and cohort performance graphs."
          />
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
