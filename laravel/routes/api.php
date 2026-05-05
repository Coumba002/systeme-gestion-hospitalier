<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\PrescriptionController;
use App\Http\Controllers\Api\RendezVousController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\MedecinController;
use App\Http\Controllers\Api\InfirmierController;
use App\Http\Controllers\Api\AuthController;

// ─── Auth (public) ────────────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ─── Routes protégées (token Sanctum requis) ──────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    Route::apiResource('patients',      PatientController::class);
    Route::apiResource('prescriptions', PrescriptionController::class);
    Route::apiResource('rendezvous',    RendezVousController::class);
    Route::apiResource('users',         UserController::class);
    Route::apiResource('medecins',      MedecinController::class);
    Route::apiResource('infirmiers',    InfirmierController::class);
});