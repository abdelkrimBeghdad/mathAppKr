<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin' => \App\Http\Middleware\IsAdmin::class,
            'anticheat' => \App\Http\Middleware\AntiCheatMiddleware::class,
            'check.suspension' => \App\Http\Middleware\CheckSuspension::class,
            'admin.audit' => \App\Http\Middleware\AdminAuditMiddleware::class,
            'security.headers' => \App\Http\Middleware\SecurityHeadersMiddleware::class,
            'strict.access' => \App\Http\Middleware\StrictAccess::class,
        ]);

        $middleware->append(\App\Http\Middleware\SecurityHeadersMiddleware::class);
        $middleware->append(\App\Http\Middleware\SanitizeInput::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
