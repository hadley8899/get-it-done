# AGENTS.md

## Project overview
- Monorepo with two apps:
- `backend/`: Laravel API (PHP 8.1+, Laravel 10, Passport auth guard).
- `frontend/`: Angular app (Angular 17 CLI workspace).
- Primary domain: task/workspace management with boards, board lists, tasks, knowledgebase, and workspace invites.

## Quick start (local development)

### Option 1: Docker Compose (Recommended)
```bash
docker-compose up -d
# Backend: http://localhost:8000
# Frontend (new): http://localhost:5173 (run npm run dev in frontend-new after docker starts)
# Database: MySQL on localhost:3307
# Mailhog UI: http://localhost:8026
```

### Option 2: Manual Setup

#### Backend (`backend/`)
1. `composer install`
2. `cp .env.example .env`
3. Configure DB/mail in `.env` (or use docker-compose defaults)
4. `php artisan key:generate`
5. `php artisan migrate` (or `php artisan migrate:fresh --seed` for a reset)
6. `php artisan passport:install`
7. `php artisan serve` (default `http://127.0.0.1:8000`)

Common backend commands:
- `php artisan test`
- `php artisan route:list`
- `php artisan migrate`
- `php artisan db:seed`

#### Frontend - React (`frontend-new/`)
1. `npm install`
2. Set `VITE_API_URL=http://localhost:8000` (or use default)
3. `npm run dev` (opens `http://localhost:5173`)

Common frontend-new commands:
- `npm run dev`
- `npm run build`
- `npm run lint`

#### Frontend - Angular (`frontend/`)
**Status**: Being replaced by React app in `frontend-new/`. Use the Angular app only for reference or as fallback.
1. `npm install --legacy-peer-deps`
2. `npm run start` (or `ng serve`)
3. Open `http://localhost:4200`

Common Angular commands:
- `npm run build`
- `npm run test`

## Architecture notes

### Backend conventions
- Routes live in `backend/routes/api.php` and are mostly under `auth:api`.
- Main flow is controller -> service class in `app/Core/Services/*` -> models/resources.
- UUID route keys are used heavily (`{workspace:uuid}`, `{board:uuid}`, etc.).
- API resources are in `app/Http/Resources/*`.
- Request validation classes are in `app/Http/Requests/*`.

### Frontend conventions

#### React Frontend (`frontend-new/`)
**Status**: Primary frontend under active migration. New features and fixes should target this app.

Structure:
- `src/api/` — Axios instance and request/response interceptors (auth headers, error handling, xdebug flags)
- `src/auth/` — Auth context and login/logout logic
- `src/pages/` — Page components (one file per route)
- `src/components/` — Shared UI components (forms, dialogs, layouts)
- `src/services/` — API service functions (boardService, workspaceService, etc.)
- `src/types/` — TypeScript interfaces
- `src/theme/` — MUI theme configuration
- `src/app/` — App bootstrap and router setup

Key patterns:
- Environment-based API URL: `VITE_API_URL` env variable (defaults to `http://localhost:8000`)
- Path alias `@/` resolves to `src/`
- Request/response handling in `src/api/api.ts` includes:
  - Bearer token injection from localStorage
  - `_method` header spoofing for `PUT`, `PATCH`, `DELETE` (Laravel compatibility)
  - Debug param injection when `VITE_API_DEBUG` is enabled
  - 401 error handling (clears token and dispatches `auth:unauthorized` event)
- Token stored in localStorage as `loggedInUser`
- User data stored in localStorage as `userData`

#### Angular Frontend (`frontend/`)
**Status**: Being phased out. Reference only. Do not add new features here.
- Feature modules under `frontend/src/app/modules/` (boards, tasks, workspaces, knowledgebase, settings, user)
- Shared HTTP/API logic under `frontend/src/app/services/`
- Interceptors for token/error/debug handling in `frontend/src/app/interceptors/`
- Environment files:
  - `frontend/src/environments/environment.ts` (dev API URL)
  - `frontend/src/environments/environment.prod.ts` (prod API URL)

## Integration expectations
- Frontend expects backend API base URL from environment config:
  - React: `VITE_API_URL` (Vite environment variable, defaults to `http://localhost:8000`)
  - Angular: `apiUrl` in environment files (legacy, being phased out)
- Backend CORS is currently permissive (`allowed_origins = ['*']`)
- Auth guard for API is Passport (`config/auth.php` -> `guards.api.driver = passport`)
- Request method spoofing: Frontend injects `_method` header for `PUT`, `PATCH`, `DELETE` requests (required for Laravel compatibility)
- Debug support: When `VITE_API_DEBUG` is enabled, frontend adds `XDEBUG_SESSION_START=PHPSTORM` query param

## Legacy/maintenance context
- Root `README.md` is older and still useful for high-level feature intent.
- `backend/README.md` and `frontend/README.md` are mostly framework boilerplate.
- Known issues listed in root README:
- knowledgebase sharing permissions
- task assignment behavior
- missing frontend flow for workspace invites
- user verification gaps

## Working guidance for future agents
- Prefer minimal, targeted edits and avoid broad refactors unless requested.
- Preserve existing module/service patterns in both backend and frontend.
- When changing API contracts, update all affected layers:
  - Laravel request/resource/controller/service
  - Frontend consumers in `frontend-new` (preferred) or `frontend` (legacy)
- Add or update tests when behavior changes:
  - Backend tests in `backend/tests/`
  - Frontend component/service tests where practical
- If local URLs differ from defaults, align both sides:
  - backend `.env` (`APP_URL`, `API_URL`)
  - frontend environment `VITE_API_URL` (React) or `apiUrl` (Angular)
- **React app is the migration target**: Direct new features to `frontend-new/` unless they are temporary Angular-only fixes
- **Error handling**: Use the `notifyError` service in `frontend-new/src/services/toastService.ts` for user-facing error messages
- **Avoid browser dialogs**: Do not use `window.confirm` or `window.alert` in React app; use the `ConfirmDialog` component in `frontend-new/src/components/`

## React migration notes (`frontend-new/`)

### Status
Migration is actively underway. Milestones 1–3 substantially complete. Phase 5 (Feature Migration) in progress with dashboard, workspaces, and boards already partially migrated. Reference `REACT_MIGRATION.md` for detailed phase breakdown.

### Project setup
- **Build tool**: Vite (fast dev server and optimized builds)
- **UI framework**: Material-UI (MUI v9)
- **Form handling**: react-hook-form (lightweight form state)
- **HTTP client**: axios with custom interceptors in `src/api/api.ts`
- **Router**: react-router-dom v7
- **TypeScript**: strict mode, path aliases (`@/` → `src/`)

### Folder structure and patterns
- `src/api/` — Axios instance with shared interceptors (token injection, method spoofing, error handling)
- `src/auth/` — Auth context (create/implement as needed)
- `src/pages/` — Page-level components, one file per route (e.g., `DashboardPage.tsx`, `BoardsPage.tsx`)
- `src/components/` — Reusable UI components and layout shells:
  - `AppShell.tsx` — Main authenticated layout with sidebar
  - `ConfirmDialog.tsx` — Reusable confirmation modal (use instead of `window.confirm`)
  - `ToastProvider.tsx` — Toast/snackbar notification provider
  - `ProtectedRoute.tsx`, `PublicOnlyRoute.tsx` — Route guards
  - `FormCard.tsx`, `FormActions.tsx` — Common form patterns
  - Subdirs like `boards/` and `workspaces/` for feature-specific components
- `src/services/` — API service functions grouped by feature (e.g., `boardService.ts`, `workspaceService.ts`)
- `src/types/` — Shared TypeScript interfaces
- `src/theme/` — MUI theme customization
- `src/app/` — App bootstrap and router setup

### API and authentication patterns
- **Token storage**: `localStorage.getItem('loggedInUser')` for bearer token
- **User data**: `localStorage.getItem('userData')` for current user info
- **Request interceptors** auto-inject:
  - `Authorization: Bearer <token>` header
  - `_method` header for PUT/PATCH/DELETE (Laravel requirement)
  - `XDEBUG_SESSION_START=PHPSTORM` when `VITE_API_DEBUG=true`
- **Response interceptors** handle:
  - 401 errors: clear token, remove user data, dispatch `auth:unauthorized` event
  - Other errors: extract message from `response.data.message` and call `notifyError()`
- **API base URL**: `VITE_API_URL` env variable (defaults to `http://localhost:8000`)

### Key conventions for new features
- **Pages stay focused**: Page components should orchestrate layout and composition, not contain complex logic. Extract feature logic to services and sub-components.
- **Services for API calls**: Keep axios calls in `src/services/` (e.g., `boardService.fetchBoards()`) rather than inline in components.
- **No external confirmation dialogs**: Always import and use `ConfirmDialog` from `src/components/` instead of `window.confirm`.
- **Toast notifications**: Import `notifyError()` from `src/services/toastService.ts` for error messages; expand as needed for success/warning patterns.
- **Form validation**: Use react-hook-form for all forms; reference existing form patterns in current pages.
- **MUI styling**: Use `sx` prop and theme tokens from `src/theme/` rather than inline CSS or external stylesheets.

### Migration checklist for each feature
When migrating a feature from Angular:
1. Define routes in the app router
2. Create API service functions (e.g., `boardService.ts`)
3. Build list/index page
4. Build create/edit forms and pages
5. Build detail page (if applicable)
6. Build modals/dialogs for sub-flows
7. Test auth guards and error handling
8. Verify API contract compatibility with backend
9. Cross-check with Angular implementation for feature parity

### Common pitfalls to avoid
- Do not introduce `@tanstack/react-query` without explicit request and clear justification
- Do not dump component logic into page files; create smaller components in `src/components/`
- Do not use class-based components; stick to functional components with hooks
- Do not create new global state libraries; use context or local state for now
- Do not override MUI theme defaults without consulting existing theme (`src/theme/`)

### Reference Angular implementation
While the Angular app is being phased out, it remains valuable for:
- Understanding feature requirements and edge cases
- Reviewing form validation logic
- Checking permission and guard patterns
- Testing against similar user flows
