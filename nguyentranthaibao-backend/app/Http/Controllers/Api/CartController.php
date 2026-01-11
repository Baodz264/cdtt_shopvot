<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    /**
     * Lấy danh sách giỏ hàng của user
     */
    public function index(Request $request)
    {
        $userId = $request->user_id;
        $cart = Cart::with('items')->where('user_id', $userId)->first();

        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        return response()->json($cart);
    }

    /**
     * Tạo giỏ hàng mới cho user
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $cart = Cart::create([
            'user_id' => $request->user_id,
            'created_at' => now(),
        ]);

        return response()->json($cart, 201);
    }

    /**
     * Xóa giỏ hàng
     */
    public function destroy(Cart $cart)
    {
        $cart->delete();
        return response()->json(['message' => 'Cart deleted successfully']);
    }
}
