# React Migration Plan

## Objective

Migrate the frontend from the existing Angular application in `frontend/` to the new React + Vite application in `frontend-new/`, using MUI as the UI framework.

The initial assumption is that the Laravel backend in `backend/` does not need to be changed for the migration itself. The React app should target the current API contract first and only trigger backend work if the migration uncovers contract inconsistencies or frontend-coupled behavior.

## Current Project Context

- Existing frontend: Angular app in `frontend/`
- New frontend: React + Vite app in `frontend-new/`
- Backend: Laravel API in `backend/`
- Existing Angular app structure is feature-based:
  - `dashboard`
  - `workspaces`
  - `boards`
  - `tasks`
  - `knowledgebase`
  - `settings`
  - `user` auth flows
- Angular currently uses:
  - route guards for auth
  - shared services for API calls
  - interceptors for bearer token handling and request adaptation
  - local storage for auth token and cached user state

## Core Migration Principles

- Keep the backend API contract unchanged unless a clear incompatibility is found.
- Preserve existing route paths where practical to reduce user-facing change.
- Migrate feature-by-feature, not file-by-file.
- Build shared React platform pieces before porting screens.
- Keep Angular and React side-by-side during migration.
- Avoid broad redesign while the framework migration is still in progress.
- Replace Angular-specific or jQuery-era dependencies with React-native alternatives.

## High-Level Target Architecture

Recommended React app structure inside `frontend-new/src/`:

- `app/`
  - app bootstrap
  - router setup
  - providers
- `theme/`
  - MUI theme
  - design tokens
- `components/`
  - shared presentational components
- `layouts/`
  - authenticated shell
  - public/auth shell
- `lib/api/`
  - HTTP client
  - intercept-like request/response handling
- `lib/auth/`
  - auth context
  - route protection
  - current user handling
- `features/auth/`
- `features/dashboard/`
- `features/workspaces/`
- `features/boards/`
- `features/tasks/`
- `features/knowledgebase/`
- `features/settings/`
- `types/`

This mirrors the existing Angular feature boundaries and should make the migration more mechanical and less error-prone.

## Existing Angular Routes To Preserve

These are the main routes currently implemented and should be preserved where possible:

- `/dashboard`
- `/workspaces`
- `/workspaces/create`
- `/workspaces/update/:uuid`
- `/workspaces/invites`
- `/tasks`
- `/tasks/all`
- `/tasks/my-assigned-tasks`
- `/tasks/created-by-me`
- `/boards`
- `/boards/create`
- `/boards/update/:uuid`
- `/boards/:uuid`
- `/boards/board-templates`
- `/boards/board-templates/edit/:uuid`
- `/knowledgebase`
- `/knowledgebase/category/create`
- `/knowledgebase/category/update/:uuid`
- `/knowledgebase/category/:uuid`
- `/settings`
- `/settings/user`
- `/login`
- `/user/register`
- `/user/forgot-password`
- `/user/forgot-password-confirm/:token`
- `/user/logout`

## Migration Phases

### Phase 1: Foundation Setup

Goal: prepare `frontend-new/` so it can support the migrated app cleanly.

Tasks:

- Add core runtime dependencies:
  - `react-router-dom`
  - `@mui/material`
  - `@mui/icons-material`
  - `@emotion/react`
  - `@emotion/styled`
- Add supporting libraries as needed:
  - form library, likely `react-hook-form`
  - HTTP client, likely `axios`
  - data fetching layer, optionally `@tanstack/react-query`
  - notifications, either MUI Snackbar or `notistack`
- Configure environment variables for API access:
  - add `VITE_API_URL`
  - align with existing Angular values
- Remove the Vite starter content and replace it with a minimal app shell.
- Establish TypeScript path and folder conventions if needed.
- Add linting and formatting rules appropriate for the new app.

Deliverable:

- React app boots with MUI and routing support.
- API base URL comes from Vite env configuration.

### Phase 2: Shared Platform Layer

Goal: recreate the Angular infrastructure that all features depend on.

Tasks:

- Build a shared API client layer.
- Recreate bearer token handling currently done in Angular interceptors.
- Recreate Laravel-specific request behavior if required:
  - evaluate whether `_method` header handling for `PUT`, `PATCH`, and `DELETE` is still necessary
- Create auth state management:
  - token persistence in local storage
  - current user loading
  - login/logout
  - refresh current user details
- Create protected route handling.
- Create a shared error handling pattern.
- Create a shared notification/toast pattern.
- Create common loading and empty-state patterns.

Deliverable:

- React app can authenticate against the current backend and load the current user.

### Phase 3: MUI Design System

Goal: define the shared UI language before feature migration accelerates.

Tasks:

- Build a base MUI theme:
  - colors
  - typography
  - spacing
  - component defaults
- Create reusable primitives:
  - page container
  - section header
  - form field wrappers
  - dialog/modal wrapper
  - table/list container
  - action bar
  - status chips
  - empty states
  - alert banners
- Define layout components:
  - authenticated layout
  - navigation/sidebar/header
  - public/auth layout

Deliverable:

- Shared MUI components are available and new screens do not need to invent layout patterns independently.

### Phase 4: Auth And App Shell

Goal: enable end-to-end navigation and authenticated usage.

Status note:

- Base auth scaffolding exists in `frontend-new/`, but full auth parity is intentionally deferred for now.
- Feature migration may continue using the current auth foundation and return later for auth hardening and parity cleanup.

Tasks:

- Implement:
  - login
  - register
  - logout
  - forgot password
  - forgot password confirm
- Implement route protection.
- Implement redirect behavior for unauthenticated users.
- Build the main authenticated app shell and top-level route tree.

Deliverable:

- Users can sign in and access protected sections in the React app.

### Phase 5: Feature Migration

Goal: port the application feature areas in a controlled order.

Status note:

- Current migration focus has moved here ahead of full auth completion.
- Active implementation order is:
  1. Dashboard
  2. Workspaces
  3. Return to auth parity gaps if they block later features
  4. Boards
  5. Tasks
  6. Knowledgebase
  7. Settings
- Boards detail progress update (April 2026):
  - Task drag-and-drop is now implemented in `frontend-new/src/pages/BoardDetailsPage.tsx` using `@dnd-kit`.
  - Task drag is handle-only in `frontend-new/src/components/boards/DraggableTaskCard.tsx` so normal card clicks open task details.
  - Drop target feedback is visible on list hover in `frontend-new/src/components/boards/DroppableList.tsx`.
  - Task reorder within a list uses `POST boards/{workspace}/{board}/boardLists/{boardList}/reorder-tasks`.
  - Task move between lists uses `POST boards/{workspace}/{board}/boardLists/move-task`.
  - Board settings now owns list management flows (create, rename, reorder, delete) in `frontend-new/src/components/boards/BoardSettingsDialog.tsx`.
  - Board settings list reorder is now drag-and-drop via `@dnd-kit` in `frontend-new/src/components/boards/BoardSettingsDialog.tsx`.
  - Task comments now support add/edit/delete in `frontend-new/src/components/boards/TaskDialog.tsx` using `tasks/{task}/comments` update/delete endpoints.
  - Board templates management is now implemented at `frontend-new/src/pages/BoardTemplatesPage.tsx` with:
    - template list/create/update/delete
    - template item create/update/delete
    - template item drag-and-drop reorder via `@dnd-kit` mapped to `board-templates/items/{boardTemplate}/reorder`.
  - Permissions pass (April 2026):
    - Task comment edit/delete actions are now shown only to the comment author in `frontend-new/src/components/boards/TaskDialog.tsx`.
    - Board details save in `BoardSettingsDialog` is now owner-gated in the UI using active workspace owner UUID.
    - Backend audit note: several endpoints still enforce workspace-access-only (not author/owner-specific), so backend hardening remains a follow-up for strict RBAC parity.
  - Tasks parity note (April 2026):
    - Legacy Angular tasks routes are scaffold-only (`tasks-home works` placeholders for `/tasks`, `/tasks/all`, `/tasks/my-assigned-tasks`, `/tasks/created-by-me`).
    - React already has all four routes wired in `frontend-new/src/app/router.tsx` and a shared `TasksPage` route shell.
    - Next Tasks work should be treated as net-new feature implementation rather than strict legacy parity.
  - Settings progress update (April 2026):
    - Settings index route is now implemented at `frontend-new/src/pages/SettingsPage.tsx`.
    - User settings route is now implemented at `frontend-new/src/pages/UserSettingsPage.tsx` (`/settings/user`).
    - Profile update (`user/update`) and password change (`user/change-password`) are wired via `frontend-new/src/services/userSettingsService.ts`.
    - Password form now includes inline validation and confirm-password mismatch checks in `frontend-new/src/pages/UserSettingsPage.tsx`.

Recommended order:

1. Dashboard
2. Workspaces
3. Boards
4. Tasks
5. Knowledgebase
6. Settings

Reasoning:

- Dashboard is a low-risk starting point.
- Workspaces and boards are central to the product flow.
- Tasks and knowledgebase depend on broader workspace/board context.
- Settings is comparatively isolated.

For each feature, use the same migration pattern:

- define routes
- create API hooks/services
- port list page
- port create/edit forms
- port detail page
- port dialogs/modals
- validate auth and permissions behavior
- perform smoke testing against backend endpoints

Deliverable:

- Each feature area reaches usable parity before moving to the next one.

### Phase 6: Third-Party Library Replacement

Goal: replace Angular-specific or legacy UI dependencies with React-native tools.

Expected replacements:

- Angular Router -> React Router
- Angular forms -> React Hook Form or equivalent
- `ngx-toastr` -> MUI Snackbar or `notistack`
- `sweetalert2` -> MUI Dialog where practical
- DataTables/jQuery tables -> MUI Table or MUI Data Grid
- `nxt-sortablejs` / `sortablejs` -> `dnd-kit` for drag and drop
- `ngx-markdown` -> React markdown renderer

Notes:

- Boards drag-and-drop should be treated as a dedicated subproject because it is likely one of the highest-risk UI migrations.
- DataTables replacement may require UX decisions rather than a one-to-one port.

### Phase 7: Parallel Run And Parity Validation

Goal: validate the React app against the Angular app before cutover.

Tasks:

- Keep `frontend/` intact while `frontend-new/` is developed.
- Validate each migrated feature against the Angular implementation.
- Track parity using a checklist:
  - routes
  - auth behavior
  - CRUD flows
  - permissions behavior
  - form validation behavior
  - error handling
  - notifications
  - loading states
- Verify environment configuration for local development and production.

Deliverable:

- React app is feature-complete enough to replace Angular with confidence.

### Phase 8: Cutover

Goal: switch active frontend ownership from Angular to React.

Tasks:

- Confirm all required routes are implemented in React.
- Confirm auth flows work end to end.
- Confirm major CRUD flows work:
  - workspaces
  - boards
  - tasks
  - knowledgebase
  - settings/profile
- Confirm production build and deployment flow for `frontend-new/`.
- Update documentation and local development instructions.
- Switch deployment target from `frontend/` to `frontend-new/`.

Deliverable:

- React app becomes the primary frontend.

### Phase 9: Cleanup

Goal: remove obsolete Angular-specific code after cutover stability is confirmed.

Tasks:

- Archive or remove the Angular frontend.
- Remove unused Angular-specific documentation.
- Remove stale build and deployment references.
- Revisit remaining frontend bugs and enhancements after migration stabilizes.

## Suggested Milestones

### Milestone 1

React foundation, routing, MUI setup, API client, auth context, protected routes.

### Milestone 2

Dashboard and workspaces migrated.

### Milestone 3

Boards migrated, including drag-and-drop and board templates.

### Milestone 4

Tasks migrated.

### Milestone 5

Knowledgebase migrated.

### Milestone 6

Settings migrated, parity pass completed, cutover prepared.

## Backend Impact Assumption

Planned assumption:

- no backend changes required for the migration baseline

Possible exceptions:

- inconsistent response shapes that Angular currently tolerates
- request formatting assumptions tied to Angular `FormData`
- method spoofing behavior required by current backend endpoints
- auth/logout edge cases
- file/image upload handling differences

If any of these appear during migration, backend changes should be small and compatibility-focused rather than broad refactors.

## Main Risks

- Hidden behavior in Angular services and interceptors that is not obvious from the UI alone
- Boards drag-and-drop complexity
- DataTables and jQuery replacement effort
- API response inconsistencies
- Mixing framework migration with a broad redesign
- Losing route compatibility during the move

## Recommended Working Rules During Migration

- Do not edit the backend unless a real frontend-blocking issue is confirmed.
- Do not remove Angular until React has reached acceptable parity.
- Preserve route paths unless there is a strong reason not to.
- Migrate one feature to completion before starting too many others.
- Keep shared UI and shared API patterns centralized.
- Prefer replacing old dependencies with React-native solutions instead of wrapping Angular-era patterns.

## Definition Of Done For Cutover

The React migration is ready for cutover when:

- the React app supports all required current routes
- authentication works end to end
- protected routes behave correctly
- current user state persists correctly across refreshes
- workspace, board, task, knowledgebase, and settings flows are working
- known critical regressions are resolved
- the production build is stable
- local setup and deployment documentation are updated

## Immediate Next Step

Start with Milestone 1 in `frontend-new/`:

- install MUI and routing dependencies
- replace the Vite starter screen
- create the app shell
- add environment-based API configuration
- implement the base API client and auth layer

## Working Notes

- Auth is not considered finished yet.
- The current plan is to keep the existing auth scaffolding in place, proceed with dashboard and workspace migration, and then revisit auth parity once the feature migration exposes the exact gaps that matter.
