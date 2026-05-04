<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: "1.0.0",
    title: "Hospital Management API",
    description: "API Documentation for the Hospital Management System"
)]
#[OA\Server(
    url: L5_SWAGGER_CONST_HOST,
    description: "Local API Server"
)]
abstract class Controller
{
    //
}
