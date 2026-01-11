<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VoucherController extends Controller
{
    /**
     * Lấy danh sách voucher (có search + phân trang)
     */
    public function index(Request $request)
    {
        $query = Voucher::query();

        // Search theo code hoặc name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('code', 'like', "%$search%")
                  ->orWhere('name', 'like', "%$search%");
            });
        }

        // Filter theo status nếu có
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $query->orderBy('id', 'desc');

        $limit = (int) $request->get('limit', 10);
        $page  = (int) $request->get('page', 1);
        $offset = ($page - 1) * $limit;

        $total = $query->count();
        $data  = $query->offset($offset)->limit($limit)->get();

        return response()->json([
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'totalPage' => ceil($total / $limit),
            'from' => $total > 0 ? $offset + 1 : 0,
            'to' => ($offset + $limit) > $total ? $total : ($offset + $limit),
            'data' => $data
        ]);
    }

    /**
     * Chi tiết voucher
     */
    public function show(Voucher $voucher)
    {
        return response()->json($voucher);
    }

    /**
     * Thêm voucher
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code'           => 'required|string|max:50|unique:voucher,code',
            'name'           => 'required|string|max:150',
            'type'           => 'required|in:percent,fixed',
            'discount_value' => 'required|numeric',
            'max_discount'   => 'nullable|numeric',
            'min_order'      => 'nullable|numeric',
            'quantity'       => 'nullable|integer',
            'used'           => 'nullable|integer',
            'start_date'     => 'nullable|date',
            'end_date'       => 'nullable|date',
            'status'         => 'nullable|integer|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $voucher = Voucher::create($request->all());

        return response()->json($voucher, 201);
    }

    /**
     * Cập nhật voucher
     */
    public function update(Request $request, Voucher $voucher)
    {
        $validator = Validator::make($request->all(), [
            'code'           => 'sometimes|string|max:50|unique:voucher,code,' . $voucher->id,
            'name'           => 'sometimes|string|max:150',
            'type'           => 'sometimes|in:percent,fixed',
            'discount_value' => 'sometimes|numeric',
            'max_discount'   => 'sometimes|numeric',
            'min_order'      => 'sometimes|numeric',
            'quantity'       => 'sometimes|integer',
            'used'           => 'sometimes|integer',
            'start_date'     => 'sometimes|date',
            'end_date'       => 'sometimes|date',
            'status'         => 'sometimes|integer|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $voucher->update($request->all());

        return response()->json($voucher);
    }

    /**
     * Xóa voucher
     */
    public function destroy(Voucher $voucher)
    {
        $voucher->delete();
        return response()->json(['message' => 'Xóa voucher thành công']);
    }
}
