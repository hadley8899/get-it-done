<?php

use App\Console\Kernel as ConsoleKernel;
use App\Exceptions\Handler;
use App\Http\Kernel as HttpKernel;
use Illuminate\Contracts\Console\Kernel as ConsoleKernelContract;
use Illuminate\Contracts\Debug\ExceptionHandler;
use Illuminate\Contracts\Http\Kernel as HttpKernelContract;
use Illuminate\Foundation\Application;

$app = Application::configure(basePath: dirname(__DIR__))
    ->create();

// Keep existing app kernels/handler to preserve current route + auth behavior.
$app->singleton(HttpKernelContract::class, HttpKernel::class);
$app->singleton(ConsoleKernelContract::class, ConsoleKernel::class);
$app->singleton(ExceptionHandler::class, Handler::class);

return $app;
