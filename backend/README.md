<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400"></a></p>

<p align="center">
<a href="https://travis-ci.org/laravel/framework"><img src="https://travis-ci.org/laravel/framework.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## Running Tests Safely

This project uses a dedicated `backend_test` database for backend tests. Do not run tests against the main development database (`get_it_done`).

### Why this is safe by default

- `phpunit.xml` sets `DB_DATABASE=backend_test`
- `docker/mysql/init/01-create-testing-db.sql` creates `backend_test` for Docker MySQL

### One-time setup

1. Copy the test env template:

```bash
cp .env.testing.example .env.testing
```

2. Start Docker services:

```bash
cd ..
docker compose up -d
```

### Run tests

From backend container:

```bash
docker compose exec backend php artisan test
```

Run a single test or filter:

```bash
docker compose exec backend php artisan test --filter=Workspace
```

### Host vs container DB settings

- Host-run tests (default in `.env.testing.example`): `DB_HOST=127.0.0.1`, `DB_PORT=3307`
- Container-run tests: `DB_HOST=db`, `DB_PORT=3306`
