<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderPlacedMail;

class OrderController extends Controller
{
    /**
     * Lấy danh sách đơn hàng, có phân trang
     */
    public function index(Request $request)
    {
        $query = Order::query();

        /* ================= FILTER ================= */

        // Lọc theo user
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Lọc theo trạng thái đơn
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Lọc theo trạng thái thanh toán
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Lọc theo phương thức thanh toán
        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        // Lọc theo khoảng tiền
        if ($request->filled('min_total')) {
            $query->where('total_money', '>=', $request->min_total);
        }

        if ($request->filled('max_total')) {
            $query->where('total_money', '<=', $request->max_total);
        }

        // Lọc theo ngày tạo
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Search fullname / phone
        if ($request->filled('keyword')) {
            $keyword = $request->keyword;
            $query->where(function ($q) use ($keyword) {
                $q->where('fullname', 'like', "%$keyword%")
                    ->orWhere('phone', 'like', "%$keyword%");
            });
        }

        /* ================= SORT ================= */

        $sortBy = $request->get('sort_by', 'created_at'); // created_at | total_money
        $sortOrder = $request->get('sort_order', 'desc'); // asc | desc

        $query->orderBy($sortBy, $sortOrder);

        /* ================= PAGINATION ================= */

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

        // Tạo đơn hàng
        $order = Order::create($request->only([
            'user_id',
            'address_id',
            'fullname',
            'phone',
            'note',
            'total_money',
            'payment_method',
            'status',
            'payment_status',
            'voucher_id',
            'discount_price'
        ]));

        /**
         * ===== GỬI MAIL XÁC NHẬN ĐƠN HÀNG =====
         */
        try {
            $email = null;

            // Nếu có user_id → lấy email user
            if ($request->filled('user_id')) {
                $user = User::find($request->user_id);
                $email = $user?->email;
            }

            // Nếu có email thì gửi
            if ($email) {
                Mail::to($email)->send(new OrderPlacedMail($order));
            }
        } catch (\Exception $e) {
            // Không crash API nếu gửi mail lỗi
            \Log::error('Send mail order error: ' . $e->getMessage());
        }

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
            'fullname',
            'phone',
            'note',
            'total_money',
            'payment_method',
            'status',
            'payment_status',
            'discount_price'
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
