# AGENTS.md

## Project overview
- Monorepo with two apps:
- `backend/`: Laravel API (PHP 8.1+, Laravel 10, Passport auth guard).
- `frontend/`: Angular app (Angular 17 CLI workspace).
- Primary domain: task/workspace management with boards, board lists, tasks, knowledgebase, and workspace invites.

## Quick start (local development)

### Backend (`backend/`)
1. `composer install`
2. `cp .env.example .env`
3. Configure DB/mail in `.env`
4. `php artisan key:generate`
5. `php artisan migrate` (or `php artisan migrate:fresh --seed` if you want a reset)
6. `php artisan passport:install`
7. `php artisan serve` (default `http://127.0.0.1:8000`)

Common backend commands:
- `php artisan test`
- `php artisan route:list`
- `php artisan migrate`
- `php artisan db:seed`

### Frontend (`frontend/`)
1. `npm install --legacy-peer-deps`
2. `npm run start` (or `ng serve`)
3. Open `http://localhost:4200`

Common frontend commands:
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
- Feature modules under `frontend/src/app/modules/` (boards, tasks, workspaces, knowledgebase, settings, user).
- Shared HTTP/API logic under `frontend/src/app/services/`.
- Interceptors exist for token/error/debug handling in `frontend/src/app/interceptors/`.
- Environment files:
- `frontend/src/environments/environment.ts` (dev API URL)
- `frontend/src/environments/environment.prod.ts` (prod API URL)

## Integration expectations
- Frontend expects backend API base URL from Angular environment config (`apiUrl`).
- Backend CORS is currently permissive (`allowed_origins = ['*']`).
- Auth guard for API is Passport (`config/auth.php` -> `guards.api.driver = passport`).

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
- Angular service/interface/component consumers
- Add or update tests when behavior changes:
- Backend tests in `backend/tests/`
- Frontend component/service tests where practical
- If local URLs differ from defaults, align both sides:
- backend `.env` (`APP_URL`, `API_URL`)
- frontend environment `apiUrl`
