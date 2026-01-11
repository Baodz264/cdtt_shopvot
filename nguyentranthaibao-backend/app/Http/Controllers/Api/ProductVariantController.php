<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProductVariantController extends Controller
{
    /**
     * Lấy danh sách biến thể sản phẩm (có phân trang & search)
     */
    public function index(Request $request)
    {
        $query = ProductVariant::query();

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $limit = (int) $request->get('limit', 10);
        $page  = (int) $request->get('page', 1);
        $offset = ($page - 1) * $limit;
        $total = $query->count();

        $data = $query->offset($offset)->limit($limit)->get();

        return response()->json([
            'page'      => $page,
            'limit'     => $limit,
            'total'     => $total,
            'totalPage' => ceil($total / $limit),
            'data'      => $data,
        ]);
    }

    /**
     * Chi tiết một biến thể sản phẩm
     */
    public function show(ProductVariant $productVariant)
    {
        return response()->json($productVariant);
    }

    /**
     * Thêm biến thể sản phẩm (có upload ảnh)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:product,id',
            'name'       => 'required|string|max:150',
            'image'      => 'nullable|image|mimes:jpeg,png,jpg,gif|max:4096',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['product_id', 'name']);

        if ($request->hasFile('image')) {
            $data['image'] = $this->uploadLocal($request->file('image'));
        }

        $variant = ProductVariant::create($data);

        return response()->json($variant, 201);
    }

    /**
     * Cập nhật biến thể sản phẩm (có upload ảnh)
     */
    public function update(Request $request, ProductVariant $productVariant)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'sometimes|exists:product,id',
            'name'       => 'sometimes|required|string|max:150',
            'image'      => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:4096',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['product_id', 'name']);

        if ($request->hasFile('image')) {
            // Xóa ảnh cũ nếu tồn tại
            if ($productVariant->image && file_exists(public_path($productVariant->image))) {
                unlink(public_path($productVariant->image));
            }
            $data['image'] = $this->uploadLocal($request->file('image'));
        }

        $productVariant->update($data);

        return response()->json($productVariant);
    }

    /**
     * Xóa biến thể sản phẩm
     */
    public function destroy(ProductVariant $productVariant)
    {
        if ($productVariant->image && file_exists(public_path($productVariant->image))) {
            unlink(public_path($productVariant->image));
        }

        $productVariant->delete();
        return response()->json(['message' => 'Product variant deleted successfully']);
    }

    /**
     * Upload ảnh lên public/uploads/products/variants
     */
    private function uploadLocal($file)
    {
        $folder = public_path('uploads/products/variants');

        if (!file_exists($folder)) {
            mkdir($folder, 0777, true);
        }

        $filename  = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $extension = $file->getClientOriginalExtension();
        $finalName = $filename . '.' . $extension;

        $file->move($folder, $finalName);

        return '/uploads/products/variants/' . $finalName;
    }
}
