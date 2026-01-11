<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProductVariantValue;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class ProductVariantValueController extends Controller
{
    /**
     * Lấy danh sách giá trị biến thể (có phân trang, search)
     */
    public function index(Request $request)
    {
        $query = ProductVariantValue::query();

        if ($request->filled('variant_id')) {
            $query->where('variant_id', $request->variant_id);
        }

        if ($request->filled('search')) {
            $query->where('value', 'like', "%{$request->search}%");
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
            'from'      => $total > 0 ? $offset + 1 : 0,
            'to'        => ($offset + $limit) > $total ? $total : ($offset + $limit),
            'prevPage'  => $page > 1 ? $page - 1 : null,
            'nextPage'  => $page < ceil($total / $limit) ? $page + 1 : null,
            'data'      => $data,
        ]);
    }

    /**
     * Chi tiết một giá trị biến thể
     */
    public function show(ProductVariantValue $productVariantValue)
    {
        return response()->json($productVariantValue);
    }

    /**
     * Thêm giá trị biến thể (có upload ảnh)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'variant_id' => 'required|exists:product_variant,id',
            'value'      => 'required|string|max:150',
            'extra_price'=> 'nullable|numeric',
            'stock'      => 'nullable|integer',
            'thumbnail'  => 'nullable|image|mimes:jpeg,png,jpg,gif|max:4096',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors'=>$validator->errors()],422);
        }

        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $this->uploadLocal($request->file('thumbnail'));
        }

        $value = ProductVariantValue::create([
            'variant_id' => $request->variant_id,
            'value'      => $request->value,
            'extra_price'=> $request->extra_price ?? 0,
            'stock'      => $request->stock ?? 0,
            'thumbnail'  => $thumbnailPath,
        ]);

        return response()->json($value, 201);
    }

    /**
     * Cập nhật giá trị biến thể (có upload ảnh)
     */
    public function update(Request $request, ProductVariantValue $productVariantValue)
    {
        $validator = Validator::make($request->all(), [
            'variant_id' => 'sometimes|exists:product_variant,id',
            'value'      => 'sometimes|required|string|max:150',
            'extra_price'=> 'sometimes|numeric',
            'stock'      => 'sometimes|integer',
            'thumbnail'  => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:4096',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors'=>$validator->errors()],422);
        }

        $data = $request->only(['variant_id','value','extra_price','stock']);

        if ($request->hasFile('thumbnail')) {
            // Xóa ảnh cũ nếu tồn tại
            if ($productVariantValue->thumbnail && file_exists(public_path($productVariantValue->thumbnail))) {
                unlink(public_path($productVariantValue->thumbnail));
            }
            $data['thumbnail'] = $this->uploadLocal($request->file('thumbnail'));
        }

        if (!empty($data)) {
            $productVariantValue->update($data);
        }

        return response()->json($productVariantValue);
    }

    /**
     * Xóa giá trị biến thể
     */
    public function destroy(ProductVariantValue $productVariantValue)
    {
        if ($productVariantValue->thumbnail && file_exists(public_path($productVariantValue->thumbnail))) {
            unlink(public_path($productVariantValue->thumbnail));
        }

        $productVariantValue->delete();
        return response()->json(['message'=>'Product variant value deleted successfully']);
    }

    /**
     * Upload ảnh lên public/uploads/products/variants/values
     */
    private function uploadLocal($file)
    {
        $folder = public_path('uploads/products/variants/values');

        if (!file_exists($folder)) {
            mkdir($folder, 0777, true);
        }

        $filename  = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $extension = $file->getClientOriginalExtension();
        $finalName = $filename . '.' . $extension;

        $file->move($folder, $finalName);

        return '/uploads/products/variants/values/' . $finalName;
    }
}
