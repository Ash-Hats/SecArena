# SecArena Phase 3 — Analysis & Architecture Strategy

## 1. Executive Summary

Phase 3 introduces the **Lab Definition System** to SecArena. A Lab Definition represents a declarative blueprint of a cybersecurity training scenario (metadata, difficulty, category, learning objectives, required tools, and hints). 

> [!IMPORTANT]
> **Phase 3 Scope Boundary**: This phase defines lab configurations and catalog APIs. It does not execute attacks or score flags; browser-based simulation was added separately in Phase 4.

---

## 2. Existing System & Architecture Inspection

### 2.1 Backend Scaffolding
- **FastAPI Core**: Router aggregated at `/api/v1`.
- **Database & ORM**: PostgreSQL connection managed via SQLAlchemy 2.0 with session dependency `get_db()`.
- **Security & Authorization**: Argon2id password hashing, JWT Bearer token authentication, `get_current_user()` dependency, and `require_role()` role-based access control.
- **User Models**: `User` model with `UserRole` enum (`student`, `instructor`).

### 2.2 Frontend Scaffolding
- **Stack**: React 18 + TypeScript + Vite + Tailwind CSS + Lucide React.
- **State & Context**: `AuthContext` providing user identity, JWT persistence, and role awareness.
- **Layout**: `AppLayout`, `Header`, `Sidebar`, and `ProtectedRoute` guards.

---

## 3. Required Phase 3 Additions

### 3.1 Data Architecture & Models (`backend/app/models/lab.py`)
1. **Enums**:
   - `LabCategory`: `WEB`, `LINUX`, `NETWORK`, `API` (prepared for `CLOUD`, `FORENSICS`, `OSINT`, `MOBILE`).
   - `Difficulty`: `EASY`, `MEDIUM`, `HARD`, `EXPERT`.
   - `LabStatus`: `DRAFT`, `PUBLISHED`, `ARCHIVED`.
2. **`Lab` Model**:
   - `id`: Integer PK.
   - `slug`: String, unique, indexed, lower-case, URL-safe.
   - `title`: String, indexed.
   - `short_description`: String (concise card description).
   - `description`: Text (detailed Markdown-compatible training context).
   - `category`: `LabCategory` Enum.
   - `difficulty`: `Difficulty` Enum.
   - `status`: `LabStatus` Enum (default `DRAFT`).
   - `estimated_duration_minutes`: Integer (positive).
   - `learning_objectives`: JSON string array.
   - `required_tools`: JSON string array.
   - `author_id`: Foreign key referencing `users.id` (strictly an Instructor).
   - `created_at`, `updated_at`, `published_at`, `archived_at`: Timestamps.
   - Relationships: `author` (`User`), `hints` (`LabHint`).
3. **`LabHint` Model**:
   - `id`: Integer PK.
   - `lab_id`: Foreign key referencing `labs.id` (cascade delete).
   - `title`: String.
   - `content`: Text.
   - `hint_order`: Integer (1-based ordering).
   - `created_at`, `updated_at`: Timestamps.

### 3.2 Repositories, Services & APIs
1. **Lab Repository (`app/repositories/lab.py`)**:
   - Database operations for lab creation, slug lookup, updating, status changes, student catalog query (only `PUBLISHED` status, category/difficulty filtering, search), and instructor management listing.
2. **Lab Service (`app/services/lab.py`)**:
   - Business rules & state machine:
     - State transitions: `DRAFT` ↔ `PUBLISHED`, `DRAFT`/`PUBLISHED` → `ARCHIVED`.
     - Publish validation: Ensures `title`, `description`, `category`, `difficulty`, and `learning_objectives` are non-empty before publishing.
     - Author ownership enforcement: Guarantees `author_id` is sourced from `get_current_user()`.
3. **API Endpoints (`app/api/v1/endpoints/labs.py`)**:
   - **Instructor Endpoints** (`require_role(UserRole.INSTRUCTOR)`):
     - `POST /api/v1/labs`: Create lab.
     - `GET /api/v1/labs/manage`: List instructor's managed labs.
     - `GET /api/v1/labs/manage/{lab_id}`: Retrieve lab management details.
     - `PUT /api/v1/labs/manage/{lab_id}`: Update lab.
     - `DELETE /api/v1/labs/manage/{lab_id}`: Delete lab.
     - `POST /api/v1/labs/manage/{lab_id}/publish`: Publish lab.
     - `POST /api/v1/labs/manage/{lab_id}/unpublish`: Unpublish lab.
     - `POST /api/v1/labs/manage/{lab_id}/archive`: Archive lab.
   - **Student Catalog Endpoints** (`require_role(UserRole.STUDENT)`):
     - `GET /api/v1/labs`: List published labs (filtering by category, difficulty, search term).
     - `GET /api/v1/labs/{slug}`: Retrieve published lab details by slug.

### 3.3 Frontend Design
1. **Student Views**:
   - `StudentLabCatalogPage`: Cyber-range catalog grid with search, category pills (WEB, LINUX, NETWORK, API), and difficulty dropdowns.
   - `StudentLabDetailPage`: Comprehensive lab view displaying learning objectives, required tools, hints accordion, and a placeholder "Start Lab" action trigger.
2. **Instructor Views**:
   - `InstructorLabManagementPage`: Table listing instructor labs with status badges (`DRAFT`, `PUBLISHED`, `ARCHIVED`), filters, and action triggers.
   - `InstructorLabEditorPage`: Dynamic form for creating and editing lab specifications with dynamic array fields for objectives, tools, and hints.

---

## 4. Security & Isolation Controls
- **Access Control**: Students receive 403 Forbidden for all `/labs/manage` endpoints.
- **Data Filtering**: Student queries strictly filter by `status == PUBLISHED`. Draft and Archived labs are invisible to students.
- **Ownership Verification**: `author_id` is automatically assigned from the authenticated instructor's JWT identity and verified on updates.
- **Input Sanitization**: Pydantic schemas enforce type safety and bounds validation to protect against malformed payload injection.
