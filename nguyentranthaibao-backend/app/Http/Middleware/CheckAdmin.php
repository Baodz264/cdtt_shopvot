<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class CheckAdmin
{
    public function handle(Request $request, Closure $next)
    {
        try {
            // Lấy user từ token JWT
            $user = JWTAuth::parseToken()->authenticate();

            if (!$user) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            // Kiểm tra role
            if ($user->role !== 'admin') {
                return response()->json(['message' => 'Unauthorized - Admin only'], 403);
            }
        } catch (JWTException $e) {
            return response()->json(['message' => 'Token is invalid or missing.'], 401);
        }

        return $next($request);
    }
}
