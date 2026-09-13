# SecArena Phase 2 — Analysis & Architecture Strategy

## 1. Executive Summary

Phase 2 builds the functional dashboard layer of SecArena, introducing role-specific user interfaces for Students and Instructors, authenticated layout management, role-aware routing, dashboard APIs, and basic analytics query services while preserving strict backend RBAC boundaries.

---

## 2. Existing System & Architecture Inspection

### 2.1 Backend Architecture
- **Framework**: FastAPI application mounted at `/api/v1`.
- **Authentication**: JWT Bearer token authentication (`app/core/security.py`).
- **User Model**: SQLAlchemy `User` model with `id`, `username`, `email`, `password_hash`, `role` (`student`, `instructor`), `is_active`, `created_at`, `updated_at`.
- **Security & Authorization**: `get_current_user` dependency for identity extraction and `require_role` dependency factory for role checking.
- **Database Session**: Transactional session injection via `get_db`.

### 2.2 Frontend Architecture
- **Tech Stack**: React 18 + TypeScript + Vite + Tailwind CSS + Lucide React icons.
- **Authentication Context**: `AuthContext` providing `user`, `token`, `login`, `register`, `logout`, and token restoration.
- **Component Pattern**: Tailwind CSS with dark-mode aesthetic styling (navy panels, cyan/purple highlights, soft borders).

---

## 3. Required Phase 2 Additions

### 3.1 Backend Components
1. **Dashboard Repository (`app/repositories/dashboard.py`)**:
   - Aggregates user metrics (total student count, active student query, user registration timeline).
   - Operates on real `User` table data without inventing fake lab/telemetry models.
2. **Dashboard Service (`app/services/dashboard.py`)**:
   - Business logic for constructing `StudentDashboardResponse` and `InstructorDashboardResponse`.
   - Explicitly flags future systems (simulations, scoring, telemetry, detection) as "Not available yet" or zero count rather than mocking fake active labs.
3. **Dashboard Endpoints (`app/api/v1/endpoints/dashboard.py`)**:
   - `GET /api/v1/dashboard/student`: Requires `get_current_user` + `student` role.
   - `GET /api/v1/dashboard/instructor`: Requires `get_current_user` + `instructor` role.
   - `GET /api/v1/dashboard/instructor/students`: Requires `get_current_user` + `instructor` role. Returns safe list of student user profiles (excluding `password_hash`).
4. **Schemas (`app/schemas/dashboard.py`)**:
   - Pydantic models for student dashboard, instructor dashboard, and student management views.

### 3.2 Database Changes
- No new database tables are required for Phase 2.
- The existing `User` model (`id`, `username`, `email`, `password_hash`, `role`, `is_active`, `created_at`, `updated_at`) contains all necessary data for student and instructor metrics.

### 3.3 Frontend Components
1. **Layout & Navigation**:
   - `AppLayout`: Sidebar with responsive collapsible drawer, top header with user avatar, role badge, and logout action.
   - Role-aware sidebar links (Student: Dashboard, Profile, Labs [Placeholder], Progress [Placeholder]; Instructor: Dashboard, Students, Labs [Placeholder], Analytics [Placeholder]).
2. **Student Dashboard & Profile**:
   - `StudentDashboard`: Welcome hero, metric cards (Available Labs, Running Labs, Completed Challenges, Progress state), quick actions, clean empty-state indicators.
   - `StudentProfile`: Read-only secure profile display (Username, Email, Role, Active Status, Account Created timestamp).
3. **Instructor Dashboard & Student Management**:
   - `InstructorDashboard`: Metric cards (Total Students from real API, Active Students, Running Labs, Completed Challenges, Avg Completion Time), recent activity section.
   - `InstructorStudentsPage`: Searchable, filterable student table displaying username, email, active status, join date, and role.
4. **Role-Aware Routing & Guards**:
   - `ProtectedRoute`: Checks authentication state and allowed roles. Redirects unauthenticated users to `/login` and unauthorized roles to 403 Forbidden UI or appropriate home dashboard.
5. **Loading, Error & Empty States**:
   - Skeletons and spinners during API fetching.
   - User-friendly error cards handling 401, 403, and network errors safely without exposing raw traces.

---

## 4. Scope & Security Boundaries

- **Strict Scope Control**: No attack execution, flag verification, scoring engine, telemetry collectors, or detection engines were created in this phase.
- **Backend Authorization Boundary**: Frontend route guards serve UX only; backend RBAC dependencies strictly enforce permissions on all endpoints.
- **Information Protection**: `password_hash`, JWT secrets, and internal system paths are strictly excluded from all dashboard schemas and API responses.
