<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\VoucherUser;
use Illuminate\Support\Facades\Validator;

class VoucherUserController extends Controller
{
    /**
     * Lấy danh sách voucher đã dùng, có phân trang
     */
    public function index(Request $request)
    {
        $query = VoucherUser::query();

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('voucher_id')) {
            $query->where('voucher_id', $request->voucher_id);
        }

        if ($request->filled('order_id')) {
            $query->where('order_id', $request->order_id);
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
     * Ghi nhận voucher đã dùng
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'voucher_id' => 'required|exists:voucher,id',
            'user_id'    => 'required|exists:users,id',
            'order_id'   => 'required|exists:orders,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $used = VoucherUser::create([
            'voucher_id' => $request->voucher_id,
            'user_id'    => $request->user_id,
            'order_id'   => $request->order_id,
            'used_at'    => now(),
        ]);

        return response()->json($used, 201);
    }

    /**
     * Xóa voucher đã dùng
     */
    public function destroy(VoucherUser $voucherUser)
    {
        $voucherUser->delete();
        return response()->json(['message' => 'Voucher usage deleted successfully']);
    }
}
