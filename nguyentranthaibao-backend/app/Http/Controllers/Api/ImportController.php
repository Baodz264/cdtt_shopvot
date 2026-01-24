<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Import;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ImportController extends Controller
{
    /**
     * Hiển thị danh sách import, có phân trang
     */
    public function index(Request $request)
    {
        $query = Import::with('user');

        /* ================= FILTER ================= */

        // Lọc theo user
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Search theo note hoặc tên user
        if ($request->filled('keyword')) {
            $keyword = $request->keyword;

            $query->where(function ($q) use ($keyword) {
                $q->where('note', 'like', "%$keyword%")
                    ->orWhereHas('user', function ($u) use ($keyword) {
                        $u->where('name', 'like', "%$keyword%");
                    });
            });
        }

        // Lọc theo ngày tạo
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        /* ================= SORT ================= */

        $sortBy = $request->get('sort_by', 'created_at'); // created_at | id
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
     * Thêm import mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'nullable|exists:users,id',
            'note' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $import = Import::create($request->only(['user_id', 'note']));

        return response()->json($import->load('user'), 201);
    }

    /**
     * Hiển thị chi tiết import
     */
    public function show(Import $import)
    {
        return response()->json($import->load('user'));
    }

    /**
     * Cập nhật import
     */
    public function update(Request $request, Import $import)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'nullable|exists:users,id',
            'note' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $import->update($request->only(['user_id', 'note']));

        return response()->json($import->load('user'));
    }

    /**
     * Xóa import
     */
    public function destroy(Import $import)
    {
        $import->delete();
        return response()->json(['message' => 'Import deleted successfully']);
    }
}
