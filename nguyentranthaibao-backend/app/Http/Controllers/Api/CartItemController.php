<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CartItem;
use App\Models\Cart;
use Illuminate\Support\Facades\Validator;

class CartItemController extends Controller
{
    /**
     * Lấy danh sách các item trong giỏ hàng
     */
    public function index(Request $request)
    {
        $cartId = $request->cart_id;

        $cart = Cart::with(['items.product', 'items.variantValue'])->find($cartId);

        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        return response()->json($cart->items);
    }

    /**
     * Thêm sản phẩm vào giỏ hàng
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cart_id' => 'required|exists:cart,id',
            'product_id' => 'required|exists:product,id',
            'variant_value_id' => 'nullable|exists:product_variant_value,id',
            'quantity' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $item = CartItem::create([
            'cart_id' => $request->cart_id,
            'product_id' => $request->product_id,
            'variant_value_id' => $request->variant_value_id,
            'quantity' => $request->quantity,
            'price' => $request->price
        ]);

        return response()->json($item, 201);
    }

    /**
     * Cập nhật số lượng sản phẩm
     */
    public function update(Request $request, CartItem $cartItem)
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $cartItem->update($request->only(['quantity', 'price']));

        return response()->json($cartItem);
    }

    /**
     * Xóa sản phẩm khỏi giỏ hàng
     */
    public function destroy(CartItem $cartItem)
    {
        $cartItem->delete();

        return response()->json(['message' => 'Item deleted successfully']);
    }
    /**
 * Xóa toàn bộ sản phẩm trong giỏ hàng theo cart_id
 */
public function clearCart($cartId)
{
    $cart = Cart::find($cartId);

    if (!$cart) {
        return response()->json(['message' => 'Cart not found'], 404);
    }

    // Xóa tất cả item trong cart
    CartItem::where('cart_id', $cartId)->delete();

    return response()->json(['message' => 'All cart items deleted successfully']);
}
}
