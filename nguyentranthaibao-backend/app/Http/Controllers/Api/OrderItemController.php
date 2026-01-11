<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Validator;

class OrderItemController extends Controller
{
    /**
     * Lấy danh sách chi tiết đơn hàng, có phân trang
     */
    public function index(Request $request)
    {
        $query = OrderItem::with(['product', 'variantValue']);

        if ($request->filled('order_id')) {
            $query->where('order_id', $request->order_id);
        }

        // Phân trang
        $limit = (int) $request->get('limit', 10);
        $page = (int) $request->get('page', 1);
        $offset = ($page - 1) * $limit;
        $total = $query->count();

        $data = $query->offset($offset)->limit($limit)->get();

        return response()->json([
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'totalPage' => ceil($total / $limit),
            'data' => $data
        ]);
    }
    public function show(OrderItem $orderItem)
    {
        return response()->json($orderItem->load(['product', 'variantValue']));
    }

    /**
     * Thêm chi tiết đơn hàng
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'product_id' => 'required|exists:product,id',
            'variant_value_id' => 'nullable|exists:product_variant_value,id',
            'quantity' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $orderItem = OrderItem::create($request->only([
            'order_id',
            'product_id',
            'variant_value_id',
            'quantity',
            'price'
        ]));

        return response()->json($orderItem->load(['product', 'variantValue']), 201);
    }

    /**
     * Cập nhật chi tiết đơn hàng
     */
    public function update(Request $request, OrderItem $orderItem)
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'sometimes|required|integer|min:1',
            'price' => 'sometimes|required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['quantity', 'price']);
        $orderItem->update($data);

        return response()->json($orderItem->load(['product', 'variantValue']));
    }

    /**
     * Xóa chi tiết đơn hàng
     */
    public function destroy(OrderItem $orderItem)
    {
        $orderItem->delete();
        return response()->json(['message' => 'Order item deleted successfully']);
    }
}
