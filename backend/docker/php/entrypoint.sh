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

php artisan migrate --force

if [ ! -f storage/oauth-private.key ] || [ ! -f storage/oauth-public.key ]; then
  php artisan passport:keys --force
fi

chmod 600 storage/oauth-private.key storage/oauth-public.key

if ! php artisan tinker --execute="exit(\Laravel\Passport\PersonalAccessClient::query()->exists() ? 0 : 1);"; then
  php artisan passport:client --personal --name="Get It Done Personal Access Client" --no-interaction
fi

exec php artisan serve --host=0.0.0.0 --port=8000
