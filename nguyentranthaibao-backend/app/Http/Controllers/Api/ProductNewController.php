<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProductNew;
use Illuminate\Support\Facades\Validator;

class ProductNewController extends Controller
{
    /**
     * Danh sách sản phẩm mới (search + phân trang)
     */
    public function index(Request $request)
    {
        $query = ProductNew::with('product');

        // Search theo tên sản phẩm
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        // Lọc theo trạng thái
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Chỉ lấy sản phẩm mới còn hiệu lực
        if ($request->boolean('valid_only')) {
            $query->active()->validDate();
        }

        $limit = (int) $request->get('limit', 10);
        $page  = (int) $request->get('page', 1);

        $data = $query->orderByDesc('id')->paginate($limit, ['*'], 'page', $page);

        return response()->json([
            'page'      => $data->currentPage(),
            'limit'     => $data->perPage(),
            'total'     => $data->total(),
            'totalPage' => $data->lastPage(),
            'data'      => $data->items(),
        ]);
    }

    /**
     * Chi tiết sản phẩm mới
     */
    public function show($id)
    {
        $productNew = ProductNew::with('product')->findOrFail($id);
        return response()->json($productNew);
    }

    /**
     * Thêm sản phẩm mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:product,id|unique:product_new,product_id',
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date|after_or_equal:start_date',
            'status'     => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $productNew = ProductNew::create([
            'product_id' => $request->product_id,
            'start_date' => $request->start_date,
            'end_date'   => $request->end_date,
            'status'     => $request->status ?? true,
        ]);

        return response()->json([
            'message' => 'Product new created successfully',
            'data'    => $productNew
        ], 201);
    }

    /**
     * Cập nhật sản phẩm mới
     */
    public function update(Request $request, $id)
    {
        $productNew = ProductNew::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:product,id|unique:product_new,product_id,' . $productNew->id,
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date|after_or_equal:start_date',
            'status'     => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $productNew->update([
            'product_id' => $request->product_id,
            'start_date' => $request->start_date,
            'end_date'   => $request->end_date,
            'status'     => $request->status,
        ]);

        return response()->json([
            'message' => 'Product new updated successfully',
            'data'    => $productNew
        ]);
    }

    /**
     * Xóa sản phẩm mới
     */
    public function destroy($id)
    {
        $productNew = ProductNew::findOrFail($id);
        $productNew->delete();

        return response()->json([
            'message' => 'Product new deleted successfully'
        ]);
    }
}
