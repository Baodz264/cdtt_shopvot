<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProductSale;
use Illuminate\Support\Facades\Validator;

class ProductSaleController extends Controller
{
    /**
     * Danh sách sản phẩm sale
     */
    public function index(Request $request)
    {
        $query = ProductSale::with('product');

        /* ================= SEARCH ================= */

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        /* ================= FILTER ================= */

        // Trạng thái bật / tắt
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Chỉ lấy sale đang hiệu lực
        if ($request->boolean('active_only')) {
            $query->active();
        }

        // Lọc theo giá gốc
        if ($request->filled('min_original_price')) {
            $query->where('original_price', '>=', $request->min_original_price);
        }

        if ($request->filled('max_original_price')) {
            $query->where('original_price', '<=', $request->max_original_price);
        }

        // Lọc theo giá sale
        if ($request->filled('min_sale_price')) {
            $query->where('sale_price', '>=', $request->min_sale_price);
        }

        if ($request->filled('max_sale_price')) {
            $query->where('sale_price', '<=', $request->max_sale_price);
        }

        // Lọc theo % giảm
        if ($request->filled('min_percent')) {
            $query->where('sale_percent', '>=', $request->min_percent);
        }

        if ($request->filled('max_percent')) {
            $query->where('sale_percent', '<=', $request->max_percent);
        }

        // Lọc theo thời gian sale
        if ($request->filled('from_date')) {
            $query->whereDate('start_date', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('end_date', '<=', $request->to_date);
        }

        /* ================= SORT ================= */

        $sortBy = $request->get('sort_by', 'id'); // id | sale_price | sale_percent | created_at
        $sortOrder = $request->get('sort_order', 'desc'); // asc | desc

        $query->orderBy($sortBy, $sortOrder);

        /* ================= PAGINATION ================= */

        $limit = (int) $request->get('limit', 10);

        return response()->json(
            $query->paginate($limit)
        );
    }


    /**
     * Chi tiết sản phẩm sale
     */
    public function show($id)
    {
        $sale = ProductSale::with('product')->findOrFail($id);
        return response()->json($sale);
    }

    /**
     * Thêm sản phẩm sale
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:product,id|unique:product_sale,product_id',
            'original_price' => 'required|numeric|min:0',
            'sale_price' => 'required|numeric|min:0|lt:original_price',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $salePercent = round(
            100 - ($request->sale_price / $request->original_price * 100)
        );

        $sale = ProductSale::create([
            'product_id' => $request->product_id,
            'original_price' => $request->original_price,
            'sale_price' => $request->sale_price,
            'sale_percent' => $salePercent,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'status' => $request->status ?? true,
        ]);

        return response()->json([
            'message' => 'Product sale created successfully',
            'data' => $sale
        ], 201);
    }

    /**
     * Cập nhật sản phẩm sale
     */
    public function update(Request $request, $id)
    {
        $sale = ProductSale::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'product_id' => 'sometimes|exists:product,id|unique:product_sale,product_id,' . $sale->id,
            'original_price' => 'sometimes|numeric|min:0',
            'sale_price' => 'sometimes|numeric|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $sale->fill($request->only([
            'product_id',
            'original_price',
            'sale_price',
            'start_date',
            'end_date',
            'status',
        ]));

        // Tính lại % giảm nếu có giá
        if ($sale->original_price > 0 && $sale->sale_price > 0) {
            $sale->sale_percent = round(
                100 - ($sale->sale_price / $sale->original_price * 100)
            );
        }

        $sale->save();

        return response()->json([
            'message' => 'Product sale updated successfully',
            'data' => $sale
        ]);
    }

    /**
     * Xóa sản phẩm sale
     */
    public function destroy($id)
    {
        $sale = ProductSale::findOrFail($id);
        $sale->delete();

        return response()->json([
            'message' => 'Product sale deleted successfully'
        ]);
    }
}
