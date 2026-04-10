# Laravel Upgrade Plan

## Goal

Upgrade the backend in `backend/` from Laravel 10 to the latest Laravel release line in a controlled way, while preserving existing API behavior for the React frontend in `frontend-new/`.

As of April 10, 2026:

- Laravel 13 is the latest release line
- Laravel 13 requires PHP 8.3+
- The current backend is Laravel 10 on a Passport 11 line
- The current Passport security fix requires Passport `13.7.1+`
- Passport `13.7.1+` is not compatible with Laravel 10

This means the real upgrade path is not just a Passport bump. It is a framework, runtime, and package upgrade.

## Current State

Backend facts confirmed in this repo:

- Framework: `laravel/framework ^10`
- Auth: `laravel/passport ^11.9`
- PHP constraint: `^8.1`
- Other relevant packages:
  - `laravel/sanctum ^3.3.3`
  - `spatie/laravel-permission ^6`
  - `intervention/image ^3.11`
  - `intervention/image-laravel ^1.5`
- Composer update currently works again after removing `roave/security-advisories`
- `composer audit` still reports unresolved advisories for:
  - `laravel/passport`
  - `firebase/php-jwt`

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

1. (not required)
2. Snapshot the current working backend state
3. Record current versions:
   - `php -v`
   - `composer show --direct`
   - `composer audit`
4. Replace the placeholder backend tests with real feature coverage for current behavior
5. Add tests for the main API flows before touching dependencies:
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
6. Add factories/seed helpers as needed to make those tests maintainable
7. Keep a manual regression checklist alongside the test suite for flows that are awkward to automate:
   - login
   - register
   - token issuance
   - workspace list/create/update/delete
   - board list/create/update/delete
   - board task flows
   - knowledgebase category/knowledgebase/item flows
   - workspace invites
   - file/image uploads
8. Do not start the Laravel upgrade until:
   - `php artisan test` is meaningful
   - the core API flows above are covered
   - failing tests clearly indicate behavioral regressions

Why this phase comes first:

- this repo has very light backend coverage today
- the app is small enough that writing coverage now is practical
- the upgrade will move faster and safer if current behavior is locked in first

## Phase 2: Preparation and Runtime Upgrade

Target runtime for latest Laravel:

- PHP 8.3 minimum

Required work:

1. Confirm runtime targets:
   - local Docker image PHP version
   - CI PHP version
   - production PHP version
2. Update Docker and local dev images to PHP 8.3
3. Update any CI pipeline PHP version to 8.3
4. Update `backend/composer.json` PHP constraint from `^8.1` to `^8.3`
5. Rebuild containers and confirm:
   - `php artisan about`
   - `php artisan route:list`
   - `php artisan test`

Notes:

- This should happen before the Laravel 13 step
- If production cannot move to PHP 8.3 yet, stop here and downgrade the target to Laravel 12 instead

## Phase 3: Laravel 10 -> 11

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
2. Add test helpers/factories needed to keep those tests readable
3. Commit the test baseline
4. Upgrade Docker / PHP runtime to 8.3
5. Commit runtime-only changes
6. Upgrade Laravel 10 -> 11
7. Fix breakages until tests pass
8. Upgrade Laravel 11 -> 12
9. Fix breakages until tests pass
10. Upgrade Laravel 12 -> 13
11. Upgrade Passport to secure compatible version
12. Run full regression pass
13. Update documentation

## Estimated Effort

Realistic estimate for this repo:

- adding meaningful backend coverage first: 1 to 3 days
- dependency and framework upgrade after tests exist: 1 to 2 days
- full backend upgrade with verification: 3 to 5 days
- if infra/CI/prod PHP changes are involved: add 0.5 to 1 day

## Known Constraints

1. Laravel 13 requires PHP 8.3+
2. Passport secure line cannot be adopted on Laravel 10
3. Current backend tests are too light today, so coverage should be improved before the upgrade
4. Manual verification is still mandatory even with tests

## Definition of Done

The upgrade is complete when all of the following are true:

1. Backend test coverage exists for the core current API flows
2. Backend runs on PHP 8.3+
3. Backend is on the target Laravel version
4. Passport is on a non-advisory vulnerable line
5. `composer update` succeeds cleanly
6. `composer audit` is clean or any remaining advisories are explicitly accepted and documented
7. Core API flows work end to end
8. Documentation reflects the new runtime and package versions
