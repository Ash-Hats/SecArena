# SecArena Phase 1 — Analysis & Architecture Strategy

## 1. Existing Phase 0 Implementation Analysis

Inspection of the codebase confirms that Phase 0 established a production-ready application framework:

- **Backend Architecture**:
  - **Framework**: FastAPI (`app/main.py`) configured with CORS, custom logging, and API versioning router (`/api/v1`).
  - **Configuration**: `app/core/config.py` using Pydantic `BaseSettings` reading environment variables (`DATABASE_URL`, `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`).
  - **Database & ORM**: `app/db/session.py` provides SQLAlchemy `engine` and `get_db()` session dependency. `app/db/base.py` defines `Base` declarative base class.
  - **Placeholders**: `app/core/security.py` defines placeholder function signatures for password hashing, JWT operations, `get_current_user`, and `RoleChecker`.
  - **Directory structure**: Pre-allocated directories for `models`, `schemas`, `repositories`, `services`, `api/v1/endpoints`.
- **Frontend Architecture**:
  - **Stack**: Vite + React 18 + TypeScript + Tailwind CSS (`frontend/src`).
  - **Current State**: Single landing view in `App.tsx` displaying health check status from `/api/v1/health`.
- **Infrastructure**:
  - **Local stack**: FastAPI, React/Vite, and PostgreSQL run as independent development services.
  - **Database Migrations**: Alembic configuration present in `backend/alembic.ini` and `backend/app/db/migrations`.

---

## 2. Phase 1 Implementation Plan

Phase 1 adds authentication, user management, and Role-Based Access Control (RBAC) across the stack.

### 2.1 Backend Design
1. **User Model (`app/models/user.py`)**:
   - `User` SQLAlchemy model inheriting from `Base`.
   - Fields: `id` (UUID or Integer PK), `username` (unique string, indexed), `email` (unique string, indexed), `password_hash` (string), `role` (`UserRole` Enum: `student`, `instructor`), `is_active` (boolean, default True), `created_at` (datetime), `updated_at` (datetime).
2. **Password Security (`app/core/security.py`)**:
   - Argon2id hashing via `passlib[argon2]` / `argon2-cffi`.
   - `hash_password(password: str) -> str`
   - `verify_password(plain_password: str, hashed_password: str) -> bool`
3. **JWT Security (`app/core/security.py`)**:
   - `create_access_token(subject: str | Any, role: str, expires_delta: Optional[timedelta] = None) -> str`
   - JWT Claims: `sub` (User ID), `role`, `iat`, `exp`.
   - `decode_access_token(token: str) -> Dict[str, Any]` validating signature, expiration, and payload structure.
4. **Schemas (`app/schemas/user.py` & `app/schemas/auth.py`)**:
   - `UserRegister`: `username`, `email`, `password`. Strictly enforces student role on public endpoints (ignores role input if sent).
   - `UserLogin`: `username` (or `email`), `password`.
   - `UserResponse`: `id`, `username`, `email`, `role`, `is_active`, `created_at`, `updated_at`. (NEVER includes `password_hash`).
   - `TokenResponse`: `access_token`, `token_type` ("bearer").
5. **Repository & Service Pattern**:
   - `app/repositories/user.py`: `UserRepository` handles database queries (get by ID, get by username, get by email, create user).
   - `app/services/auth.py`: `AuthService` handles registration, authentication logic, and token issuance.
6. **API Endpoints (`app/api/v1/endpoints/auth.py` & `test.py`)**:
   - `POST /api/v1/auth/register`: Public registration (creates Student only).
   - `POST /api/v1/auth/login`: Issues Bearer JWT token on valid credentials (generic error on failure).
   - `GET /api/v1/auth/me`: Authenticated endpoint returning `UserResponse`.
   - `GET /api/v1/test/student`: Protected endpoint for `student` (and instructor if specified).
   - `GET /api/v1/test/instructor`: Protected endpoint strictly for `instructor`.
7. **Dependencies & RBAC (`app/core/security.py` / `app/api/deps.py`)**:
   - `get_current_user`: Extracts Bearer token from `HTTPBearer`, decodes JWT, verifies user existence and active status.
   - `require_role(role)` / `RoleChecker`: Validates `user.role` against required role(s) and returns 403 Forbidden on role mismatch.
8. **Instructor CLI Creation Mechanism (`app/utils/create_instructor.py`)**:
   - Secure CLI script: `python -m app.utils.create_instructor`
   - Accepts username, email, password (via prompt or args), hashes with Argon2id, assigns `instructor` role.
9. **Alembic Migration**:
   - Migration file creating `users` table and `userrole` enum.

### 2.2 Frontend Design
1. **Auth Context & Hook (`frontend/src/context/AuthContext.tsx` & `hooks/useAuth.ts`)**:
   - Tracks `user`, `token`, `isAuthenticated`, `isLoading`.
   - Persists JWT token in `localStorage` safely.
   - Restores session on load via `/api/v1/auth/me`.
   - Exposes `login()`, `register()`, `logout()`.
2. **Pages & Components (`frontend/src/pages/`)**:
   - `LoginPage.tsx`: Email/username & password inputs with error handling.
   - `RegisterPage.tsx`: Username, email, password, confirm password inputs. Redirects to login on success.
   - `DashboardPage.tsx`: Minimal protected home view displaying authenticated user info & role badge.
   - Protected Route Wrapper (`frontend/src/components/ProtectedRoute.tsx`).
3. **Navigation & Router**:
   - Views toggle or router mechanism matching project architecture.

---

## 3. Strict Compliance Verification
- Public registration MUST NEVER create instructors.
- Passwords must be hashed using Argon2id.
- No plain-text passwords or secrets logged or returned in responses.
- Backend RBAC is the absolute security boundary.
