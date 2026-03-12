#!/usr/bin/env sh
set -eu

cd /var/www/html

if [ ! -f .env ]; then
  cp .env.example .env
fi

if [ ! -f vendor/autoload.php ]; then
  composer install --no-interaction --prefer-dist
fi

if ! grep -q "^APP_KEY=base64:" .env; then
  php artisan key:generate --force
fi

if [ ! -f storage/oauth-private.key ] || [ ! -f storage/oauth-public.key ]; then
  php artisan passport:install --force
fi

php artisan migrate --force

exec php artisan serve --host=0.0.0.0 --port=8000
