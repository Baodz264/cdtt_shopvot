<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Mail\VerifyEmailMail;
use App\Mail\OtpMail;

class AuthController extends Controller
{
    // ================= REGISTER =================
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $token = Str::random(64);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'email_verified' => false,
            'email_verification_token' => $token
        ]);

        Mail::to($user->email)->send(new VerifyEmailMail($token));

        return response()->json([
            'message' => 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
            'token_for_test' => $token
        ], 201);
    }

    // ================= VERIFY EMAIL =================
    public function verifyEmail(Request $request)
    {
        $token = $request->query('token');

        if (!$token) {
            return response()->json([
                'message' => 'Token không hợp lệ'
            ], 400);
        }

        $user = User::where('email_verification_token', $token)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Link xác thực không hợp lệ hoặc đã hết hạn'
            ], 400);
        }

        $user->email_verified = true;
        $user->email_verification_token = null;
        $user->save();

        return response()->json([
            'message' => 'Xác thực email thành công, bạn có thể đăng nhập'
        ]);
    }

    // ================= LOGIN =================
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!$token = auth()->attempt($credentials)) {
            return response()->json([
                'message' => 'Sai email hoặc mật khẩu'
            ], 401);
        }

        if (!auth()->user()->email_verified) {
            auth()->logout();
            return response()->json([
                'message' => 'Tài khoản chưa xác thực email'
            ], 403);
        }

        return response()->json([
            'token' => $token,
            'type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60
        ]);
    }

    // ================= ME =================
    public function me()
    {
        return response()->json(auth()->user());
    }

    // ================= LOGOUT =================
    public function logout()
    {
        auth()->logout();
        return response()->json([
            'message' => 'Đã đăng xuất'
        ]);
    }

    // ================= FORGOT PASSWORD =================
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Email không tồn tại'
            ], 404);
        }

        $otp = rand(100000, 999999);

        $user->otp = $otp;
        $user->otp_expired_at = now()->addMinutes(5);
        $user->save();

        Mail::to($user->email)->send(new OtpMail($otp));

        return response()->json([
            'message' => 'OTP đã được gửi về email',
            'otp_for_test' => $otp
        ]);
    }

    // ================= RESET PASSWORD =================
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required',
            'password' => 'required|min:6|confirmed'
        ]);

        $user = User::where('email', $request->email)
            ->where('otp', $request->otp)
            ->where('otp_expired_at', '>=', now())
            ->first();

        if (!$user) {
            return response()->json([
                'message' => 'OTP không hợp lệ hoặc đã hết hạn'
            ], 400);
        }

        $user->password = Hash::make($request->password);
        $user->otp = null;
        $user->otp_expired_at = null;
        $user->save();

        return response()->json([
            'message' => 'Đổi mật khẩu thành công'
        ]);
    }
    // ================= CHANGE PASSWORD (LOGIN USER) =================
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|min:6|confirmed',
        ]);

        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        // ❗ kiểm tra mật khẩu hiện tại
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Mật khẩu hiện tại không đúng'
            ], 400);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'message' => 'Đổi mật khẩu thành công'
        ]);
    }

}
