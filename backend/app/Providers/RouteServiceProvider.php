<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to the "home" route for your application.
     *
     * Typically, users are redirected here after authentication.
     *
     * @var string
     */
    public const HOME = '/home';

    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     *
     * @return void
     */
    public function boot()
    {
        $this->configureRateLimiting();

        $this->routes(function () {
            $apiDomain = $this->normalizeApiDomain(config('app.api_url'));
            $apiRoutes = Route::middleware('api');

            if (!empty($apiDomain)) {
                $apiRoutes->domain($apiDomain);
            }

            $apiRoutes->group(base_path('routes/api.php'));
        });
    }

    private function normalizeApiDomain(?string $apiUrl): ?string
    {
        if (empty($apiUrl)) {
            return null;
        }

        $candidate = trim($apiUrl);
        $candidate = preg_replace('#^https?://#', '', $candidate) ?? $candidate;
        $candidate = explode('/', $candidate)[0];
        $candidate = explode(':', $candidate)[0];

        return $candidate !== '' ? $candidate : null;
    }

    /**
     * Configure the rate limiters for the application.
     *
     * @return void
     */
    protected function configureRateLimiting()
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(300)->by($request->user()?->id ?: $request->ip());
        });
    }
}
