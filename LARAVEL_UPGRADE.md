# Laravel Upgrade Plan

## Goal

Upgrade the backend in `backend/` from Laravel 10 to the latest Laravel release line in a controlled way, while preserving existing API behavior for the React frontend in `frontend-new/`.

As of April 10, 2026:

- Laravel 13 is the latest release line
- Laravel 13 requires PHP 8.3+ (minimum)
- This plan targets PHP 8.4 runtime in Docker, CI, and production
- The current backend is Laravel 10 on a Passport 11 line
- The current Passport security fix requires Passport `13.7.1+`
- Passport `13.7.1+` is not compatible with Laravel 10

This means the real upgrade path is not just a Passport bump. It is a framework, runtime, and package upgrade.

## Current State

Backend facts confirmed in this repo:

- Framework: `laravel/framework ^11.0` (lock: `11.51.0`)
- Auth: `laravel/passport ^12.0` (lock currently resolved to `12.x-dev`)
- PHP constraint: `^8.3`
- Other relevant packages:
  - `laravel/sanctum ^4.0`
  - `spatie/laravel-permission ^6`
  - `intervention/image ^3.11`
  - `intervention/image-laravel ^1.5`
- Composer update is being run in Docker container PHP 8.3 (not host)
- `composer audit` still reports unresolved advisories for:
  - `laravel/passport`

Codebase notes:

- App structure is still standard Laravel 10 bootstrap
- API routes live in `backend/routes/api.php`
- Business logic is mostly controller -> service classes
- Test coverage is minimal, so manual verification will be required

## Recommended Strategy

Do this as an incremental backend-only project:

1. Add backend tests that lock in current behavior
2. Upgrade PHP and infrastructure
3. Upgrade Laravel 10 -> 11
4. Upgrade Laravel 11 -> 12
5. Upgrade Laravel 12 -> 13
6. Upgrade Passport to the secure compatible line
7. Run full regression verification

Do not combine this with frontend migration work in the same branch unless necessary.

## Phase 1: Test Current Behavior First

### Checklist

- [x] Record baseline versions (`php -v`, `composer show --direct`, `composer audit`)
- [x] Enforce test DB isolation to `backend_test` in committed config (`backend/phpunit.xml`)
- [x] Add committed testing env template (`backend/.env.testing.example`)
- [x] Provision `backend_test` in Docker (`docker-compose.yml`, `docker/mysql/init/01-create-testing-db.sql`)
- [x] Add auth baseline API tests (register, login success/failure, user details)
- [x] Add protected route behavior tests (unauthenticated access)
- [x] Add workspace CRUD API tests
- [x] Add workspace members/invites-for-user API tests
- [x] Add workspace invite actions/details tests (invite, accept, reject, public details)
- [x] Add board list/create/update/delete coverage
- [x] Add board lists/tasks/comments flow coverage
- [x] Add knowledgebase category/knowledgebase/item coverage
- [x] Add upload/image flow coverage
- [ ] Finalize manual regression checklist and sign-off for Phase 1 completion

1. (not required)
2. Snapshot the current working backend state
3. Record current versions:
   - `php -v`
   - `composer show --direct`
   - `composer audit`
4. Enforce test database isolation before adding coverage:
   - all backend tests must run on a dedicated `backend_test` database
   - do not run tests against the primary development database
   - configure `backend/.env.testing` with `DB_DATABASE=backend_test` (and matching credentials/host)
   - ensure `backend/phpunit.xml` uses the testing environment and does not point to the dev DB
   - if running tests in Docker, ensure the DB service in `docker-compose.yml` allows/provisions `backend_test`
5. Replace the placeholder backend tests with real feature coverage for current behavior
6. Add tests for the main API flows before touching dependencies:
   - login
   - register
   - token issuance
   - authenticated route protection
   - workspace list/create/update/delete
   - workspace invites
   - board list/create/update/delete
   - board list/task/comment flows
   - knowledgebase category/knowledgebase/item flows
   - file/image uploads where practical
7. Add factories/seed helpers as needed to make those tests maintainable
8. Keep a manual regression checklist alongside the test suite for flows that are awkward to automate:
   - login
   - register
   - token issuance
   - workspace list/create/update/delete
   - board list/create/update/delete
   - board task flows
   - knowledgebase category/knowledgebase/item flows
   - workspace invites
   - file/image uploads
9. Do not start the Laravel upgrade until:
   - `php artisan test` is meaningful
   - the core API flows above are covered
   - failing tests clearly indicate behavioral regressions
   - tests are confirmed to run only against `backend_test`

Why this phase comes first:

- this repo has very light backend coverage today
- the app is small enough that writing coverage now is practical
- the upgrade will move faster and safer if current behavior is locked in first

## Phase 2: Preparation and Runtime Upgrade

### Checklist

- [ ] Confirm local Docker PHP target
- [ ] Confirm CI PHP target
- [ ] Confirm production PHP target
- [ ] Update Docker/local runtime to PHP 8.4
- [ ] Update CI runtime to PHP 8.4
- [ ] Update `backend/composer.json` PHP constraint to `^8.4`
- [ ] Rebuild containers and run `php artisan about`
- [ ] Rebuild containers and run `php artisan route:list`
- [ ] Rebuild containers and run `php artisan test`

Target runtime for latest Laravel:

- PHP 8.4 target (Laravel 13 minimum remains PHP 8.3+)

Required work:

1. Confirm runtime targets:
   - local Docker image PHP version
   - CI PHP version
   - production PHP version
2. Update Docker and local dev images to PHP 8.4
3. Update any CI pipeline PHP version to 8.4
4. Update `backend/composer.json` PHP constraint from `^8.1` to `^8.4`
5. Rebuild containers and confirm:
   - `php artisan about`
   - `php artisan route:list`
   - `php artisan test`

Notes:

- This should happen before the Laravel 13 step
- If production cannot move to PHP 8.4 yet, use PHP 8.3 as a temporary floor and reassess Laravel 13 rollout timing

## Phase 3: Laravel 10 -> 11

### Checklist

- [x] Update `laravel/framework` to `^11.0`
- [x] Update Passport/Sanctum/Collision/PHPUnit to Laravel 11-compatible lines
- [x] Run `composer update -W`
- [x] Apply Laravel 11 bootstrap/app skeleton updates
- [x] Verify auth config, middleware, exception handling, and route registration
- [x] Run `php artisan test`
- [x] Run `php artisan route:list`
- [x] Run `php artisan optimize:clear`

Status notes:

- Full backend suite passed in Docker container: 58 passed, 1 PHPUnit deprecation warning (`protectedRouteProvider()` should be static).
- `php artisan about` confirms Laravel `11.51.0` on PHP `8.3.30`.
- `composer audit` still reports a high-severity Passport advisory (`<13.7.1`), expected to be fully remediated during the Laravel 13 / Passport 13 phase.
- Auth/route wiring verified on Laravel 11: Passport `auth:api` guard remains active (`config/auth.php`), API routes are registered without an `/api` prefix via `RouteServiceProvider`, and protected routes resolve `Authenticate:api` middleware in `php artisan route:list -vv`.
- `backend/bootstrap/app.php` is now migrated to Laravel 11 `Application::configure(...)` style while explicitly rebinding existing app HTTP/Console kernels and exception handler to preserve behavior.
- Post-migration verification in Docker: `php artisan --version`, `php artisan about`, `php artisan route:list`, `php artisan optimize:clear`, and full `php artisan test` all pass.

Warning:

- Run Composer commands in the Docker `backend` container only. Host Composer/PHP can generate lockfile drift or platform-incompatible resolutions.

Reference:

- https://laravel.com/docs/11.x/upgrade

Main expected work:

1. Update dependencies in `backend/composer.json`:
   - `laravel/framework` to `^11.0`
   - compatible `laravel/passport` line for Laravel 11
   - compatible `laravel/sanctum`
   - compatible `nunomaduro/collision`
   - compatible `phpunit/phpunit`
2. Run `composer update -W`
3. Resolve bootstrap/app skeleton differences if needed
4. Re-check auth configuration, middleware, exception handling, and route registration
5. Run:
   - `php artisan test`
   - `php artisan route:list`
   - `php artisan optimize:clear`

Risk areas:

- bootstrap changes between Laravel 10 and 11
- middleware/exception configuration changes
- Passport integration

## Phase 4: Laravel 11 -> 12

### Checklist

- [ ] Update `laravel/framework` to `^12.0`
- [ ] Update `phpunit/phpunit` to `^11.0`
- [ ] Review Carbon 3 behavior and app usage
- [ ] Review UUID behavior for models using UUID traits
- [ ] Re-run backend tests and smoke verification

Reference:

- https://laravel.com/docs/12.x/upgrade

Main expected work:

1. Update `laravel/framework` to `^12.0`
2. Update `phpunit/phpunit` to `^11.0`
3. Review Carbon 3 implications
4. Review UUID behavior changes if any models use `HasUuids`
5. Re-run app verification and API smoke tests

Expected impact:

- usually smaller than 10 -> 11
- still requires manual auth/API verification

## Phase 5: Laravel 12 -> 13

### Checklist

- [ ] Update `laravel/framework` to `^13.0`
- [ ] Confirm all direct dependencies are Laravel 13-compatible
- [ ] Update Passport to `13.7.1+`
- [ ] Run `composer update -W`
- [ ] Run `composer audit`

Reference:

- https://laravel.com/docs/13.x/releases

Main expected work:

1. Update `laravel/framework` to `^13.0`
2. Confirm all direct dependencies have Laravel 13-compatible releases
3. Update Passport to `13.7.1+`
4. Re-run `composer update -W`
5. Re-run `composer audit`

Expected outcome:

- Passport advisory should be resolved here
- Laravel 13 is described as a relatively minor upgrade from 12 for most applications, but package compatibility still needs to be checked

## Phase 6: Package Review

### Checklist

- [ ] Review `laravel/passport`
- [ ] Review `laravel/sanctum`
- [ ] Review `spatie/laravel-permission`
- [ ] Review `intervention/image`
- [ ] Review `intervention/image-laravel`
- [ ] Review `phpunit/phpunit`
- [ ] Review transitive `firebase/php-jwt`

These packages should be reviewed explicitly during the upgrade:

- `laravel/passport`
- `laravel/sanctum`
- `spatie/laravel-permission`
- `intervention/image`
- `intervention/image-laravel`
- `phpunit/phpunit`
- transitive `firebase/php-jwt`

For each package:

1. Confirm latest compatible major for the target Laravel version
2. Check changelog / upgrade notes
3. Verify no changed APIs are used by this project

## Phase 7: Auth and Security Verification

### Checklist

- [ ] Verify login still returns bearer token
- [ ] Verify register still creates user + token
- [ ] Verify protected `auth:api` routes enforce authorization
- [ ] Verify guard behavior for user login tokens
- [ ] Verify client credentials flow behavior (if used)
- [ ] Re-verify `config/auth.php` and Passport integration assumptions
- [ ] Run `composer audit`
- [ ] Confirm Passport advisory resolved
- [ ] Confirm JWT advisory resolved (or document accepted residual risk)

This app’s main backend risk is auth.

Verify all Passport-related behavior after each major step:

1. Login still returns a bearer token
2. Register still creates a user and token
3. Protected `auth:api` routes still enforce authorization
4. Token guard behavior is correct for:
   - user login tokens
   - any client credentials flows if present
5. `config/auth.php` and Passport service provider behavior still match the app’s expectations

Security verification:

1. Run `composer audit`
2. Confirm Passport advisory is gone
3. Confirm JWT advisory is gone or explain why it remains

## Phase 8: Application Regression Pass

### Checklist

- [ ] Complete auth manual regression pass
- [ ] Complete workspace manual regression pass
- [ ] Complete board manual regression pass
- [ ] Complete knowledgebase manual regression pass
- [ ] Complete upload/storage regression pass
- [ ] Re-run full backend test suite after each major upgrade step

Run both automated and manual verification against the backend API:

1. Auth
   - login
   - register
   - logout if applicable
2. Workspaces
   - list
   - create
   - update
   - delete
   - invites
3. Boards
   - list
   - create
   - update
   - delete
   - board lists
   - tasks
   - comments
4. Knowledgebase
   - categories
   - child categories
   - knowledgebases
   - items
5. Upload flows
   - board image upload
   - storage/public access

Recommended approach:

- run the backend test suite first after every upgrade step
- use the current Angular app and/or `frontend-new` as functional clients for validation
- also test key endpoints directly with Postman or curl

## Phase 9: Cleanup

### Checklist

- [ ] Reintroduce CI security-check workflow via `composer audit`
- [ ] Set up dependency update automation
- [ ] Update `AGENTS.md`
- [ ] Update root `README.md`
- [ ] Update backend setup and runtime documentation

After the upgrade is stable:

1. Reintroduce a security-check workflow, but do not use a Composer constraint that blocks installability on unsupported package lines
2. Prefer:
   - `composer audit` in CI
   - dependency update automation
3. Update docs:
   - `AGENTS.md`
   - root `README.md`
   - backend setup instructions

## Suggested Implementation Order

1. Add feature tests for current API behavior
2. Configure and verify test isolation on `backend_test`
3. Add test helpers/factories needed to keep those tests readable
4. Commit the test baseline
5. Upgrade Docker / PHP runtime to 8.4
6. Commit runtime-only changes
7. Upgrade Laravel 10 -> 11
8. Fix breakages until tests pass
9. Upgrade Laravel 11 -> 12
10. Fix breakages until tests pass
11. Upgrade Laravel 12 -> 13
12. Upgrade Passport to secure compatible version
13. Run full regression pass
14. Update documentation

## Estimated Effort

Realistic estimate for this repo:

- adding meaningful backend coverage first: 1 to 3 days
- dependency and framework upgrade after tests exist: 1 to 2 days
- full backend upgrade with verification: 3 to 5 days
- if infra/CI/prod PHP changes are involved: add 0.5 to 1 day

## Known Constraints

1. Laravel 13 requires PHP 8.3+ (minimum)
2. This plan targets PHP 8.4 runtime for Docker, CI, and production
3. Passport secure line cannot be adopted on Laravel 10
4. Current backend tests are too light today, so coverage should be improved before the upgrade
5. Backend tests must run on `backend_test`, not the main development database
6. Manual verification is still mandatory even with tests

## Definition of Done

The upgrade is complete when all the following are true:

1. Backend test coverage exists for the core current API flows
2. Backend tests are isolated to `backend_test` and do not use the main development database
3. Backend runs on PHP 8.4+
4. Backend is on the target Laravel version
5. Passport is on a non-advisory vulnerable line
6. `composer update` succeeds cleanly
7. `composer audit` is clean or any remaining advisories are explicitly accepted and documented
8. Core API flows work end to end
9. Documentation reflects the new runtime and package versions
