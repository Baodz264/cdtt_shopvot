<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\VoucherClaim;
use Illuminate\Support\Facades\Validator;

class VoucherClaimController extends Controller
{
    /**
     * Lấy danh sách voucher đã claim (KÈM voucher)
     */
    public function index(Request $request)
    {
        // 🔥 LOAD QUAN HỆ voucher
        $query = VoucherClaim::with('voucher');

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('voucher_id')) {
            $query->where('voucher_id', $request->voucher_id);
        }

        $limit = (int) $request->get('limit', 10);
        $page  = (int) $request->get('page', 1);
        $offset = ($page - 1) * $limit;

        $total = $query->count();

        $data = $query
            ->offset($offset)
            ->limit($limit)
            ->get();

        return response()->json([
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'totalPage' => ceil($total / $limit),
            'data' => $data
        ]);
    }

    /**
     * Claim voucher
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'voucher_id' => 'required|exists:voucher,id',
            'user_id'    => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $exists = VoucherClaim::where('voucher_id', $request->voucher_id)
            ->where('user_id', $request->user_id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Voucher already claimed by this user'], 409);
        }

        $claim = VoucherClaim::create([
            'voucher_id' => $request->voucher_id,
            'user_id'    => $request->user_id,
            'claimed_at' => now(),
        ]);

        return response()->json($claim, 201);
    }

    /**
     * Xóa claim voucher
     */
    public function destroy(VoucherClaim $voucherClaim)
    {
        $voucherClaim->delete();
        return response()->json(['message' => 'Voucher claim deleted successfully']);
    }
}
