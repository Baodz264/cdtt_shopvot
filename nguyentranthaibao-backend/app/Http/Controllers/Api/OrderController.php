<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Lấy danh sách đơn hàng, có phân trang
     */
    public function index(Request $request)
    {
        $query = Order::query();

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Phân trang
        $limit = (int) $request->get('limit', 10);
        $page  = (int) $request->get('page', 1);
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

    /**
     * Chi tiết đơn hàng, bao gồm các item
     */
    public function show(Order $order)
    {
        return response()->json($order->load('items'));
    }

    /**
     * Tạo đơn hàng mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'nullable|exists:users,id',
            'address_id' => 'nullable|exists:address,id',
            'fullname' => 'required|string|max:150',
            'phone' => 'required|string|max:20',
            'note' => 'nullable|string',
            'total_money' => 'required|numeric',
            'payment_method' => 'required|in:cod,momo,vnpay,paypal',
            'status' => 'nullable|in:pending,confirmed,shipping,completed,cancelled',
            'payment_status' => 'nullable|in:unpaid,paid,refunded',
            'voucher_id' => 'nullable|exists:voucher,id',
            'discount_price' => 'nullable|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $order = Order::create($request->only([
            'user_id','address_id','fullname','phone','note','total_money',
            'payment_method','status','payment_status','voucher_id','discount_price'
        ]));

        return response()->json($order, 201);
    }

    /**
     * Cập nhật đơn hàng
     */
    public function update(Request $request, Order $order)
    {
        $validator = Validator::make($request->all(), [
            'fullname' => 'sometimes|required|string|max:150',
            'phone' => 'sometimes|required|string|max:20',
            'note' => 'sometimes|string',
            'total_money' => 'sometimes|numeric',
            'payment_method' => 'sometimes|in:cod,momo,vnpay,paypal',
            'status' => 'sometimes|in:pending,confirmed,shipping,completed,cancelled',
            'payment_status' => 'sometimes|in:unpaid,paid,refunded',
            'discount_price' => 'sometimes|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only([
            'fullname','phone','note','total_money','payment_method',
            'status','payment_status','discount_price'
        ]);

        $order->update($data);

        return response()->json($order);
    }

    /**
     * Xóa đơn hàng
     */
    public function destroy(Order $order)
    {
        $order->delete();
        return response()->json(['message' => 'Order deleted successfully']);
    }
}
