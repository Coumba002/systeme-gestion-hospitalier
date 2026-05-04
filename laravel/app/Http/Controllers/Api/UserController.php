<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use OpenApi\Attributes as OA;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: "/users",
        operationId: "getUsersList",
        tags: ["Users"],
        summary: "Get list of users",
        description: "Returns list of users"
    )]
    #[OA\Response(response: 200, description: "Successful operation")]
    public function index()
    {
        return \App\Http\Resources\UserResource::collection(User::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: "/users",
        operationId: "storeUser",
        tags: ["Users"],
        summary: "Create a new user",
        description: "Creates a new user record",
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["name", "email", "password"],
            properties: [
                new OA\Property(property: "name", type: "string", example: "Admin User"),
                new OA\Property(property: "email", type: "string", format: "email", example: "admin@hospital.com"),
                new OA\Property(property: "password", type: "string", format: "password", example: "secret123"),
                new OA\Property(property: "role", type: "string", example: "admin")
            ]
        )
    )]
    #[OA\Response(response: 201, description: "User created")]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $validated['password'] = \Illuminate\Support\Facades\Hash::make($validated['password']);
        $user = User::create($validated);

        return new \App\Http\Resources\UserResource($user);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return new \App\Http\Resources\UserResource($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'sometimes|required|string|min:8',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = \Illuminate\Support\Facades\Hash::make($validated['password']);
        }

        $user->update($validated);

        return new \App\Http\Resources\UserResource($user);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'User deleted successfully'], 200);
    }
}
