<?php

use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AvailabilityController;
use App\Http\Controllers\Api\BlockedDateController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\ServiceController;
use Illuminate\Support\Facades\Route;

// Public
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::get('/services', [ServiceController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/password', [AuthController::class, 'updatePassword']);

    Route::get('/availability', [AvailabilityController::class, 'index']);

    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::patch('/appointments/{appointment}/status', [AppointmentController::class, 'updateStatus']);

    Route::get('/schedule', [ScheduleController::class, 'show']);
    Route::get('/blocked-dates', [BlockedDateController::class, 'index']);

    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    Route::middleware('admin')->group(function () {
        Route::post('/services', [ServiceController::class, 'store']);
        Route::put('/services/{service}', [ServiceController::class, 'update']);
        Route::delete('/services/{service}', [ServiceController::class, 'destroy']);

        Route::get('/customers', [CustomerController::class, 'index']);
        Route::get('/customers/{customer}', [CustomerController::class, 'show']);

        Route::put('/schedule', [ScheduleController::class, 'update']);

        Route::post('/blocked-dates', [BlockedDateController::class, 'store']);
        Route::delete('/blocked-dates/{blockedDate}', [BlockedDateController::class, 'destroy']);

        Route::get('/reports', [ReportController::class, 'index']);
    });
});
