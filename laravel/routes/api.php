<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\PrescriptionController;
use App\Http\Controllers\Api\RendezVousController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\MedecinController;
use App\Http\Controllers\Api\InfirmierController;

Route::apiResource('patients', PatientController::class);
Route::apiResource('prescriptions', PrescriptionController::class);
Route::apiResource('rendezvous', RendezVousController::class);
Route::apiResource('users', UserController::class);
Route::apiResource('medecins', MedecinController::class);
Route::apiResource('infirmiers', InfirmierController::class);
