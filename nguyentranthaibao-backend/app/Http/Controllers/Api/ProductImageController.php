<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProductImage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class ProductImageController extends Controller
{
    /**
     * Lấy danh sách ảnh của sản phẩm (có phân trang)
     */
    public function index(Request $request)
    {
        $query = ProductImage::query();

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        $limit  = (int) $request->get('limit', 10);
        $page   = (int) $request->get('page', 1);
        $offset = ($page - 1) * $limit;
        $total  = $query->count();

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
     * Chi tiết ảnh sản phẩm
     */
    public function show(ProductImage $productImage)
    {
        return response()->json($productImage);
    }

    /**
     * Thêm ảnh sản phẩm (upload)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:product,id',
            'image'      => 'required|image|mimes:jpeg,png,jpg,gif|max:4096',
            'is_default' => 'nullable|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $imagePath = $this->uploadLocal($request->file('image'));

        $image = ProductImage::create([
            'product_id' => $request->product_id,
            'image'      => $imagePath,
            'is_default' => $request->is_default ?? 0,
        ]);

        return response()->json($image, 201);
    }

    /**
     * Cập nhật ảnh sản phẩm (upload)
     */
    public function update(Request $request, ProductImage $productImage)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'sometimes|exists:product,id',
            'image'      => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:4096',
            'is_default' => 'sometimes|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['product_id', 'is_default']);

        if ($request->hasFile('image')) {
            // Xóa ảnh cũ nếu tồn tại
            if ($productImage->image && file_exists(public_path($productImage->image))) {
                unlink(public_path($productImage->image));
            }
            $data['image'] = $this->uploadLocal($request->file('image'));
        }

        $productImage->update($data);

        return response()->json($productImage);
    }

    /**
     * Xóa ảnh sản phẩm
     */
    public function destroy(ProductImage $productImage)
    {
        if ($productImage->image && file_exists(public_path($productImage->image))) {
            unlink(public_path($productImage->image));
        }

        $productImage->delete();
        return response()->json(['message' => 'Product image deleted successfully']);
    }

    /**
     * Upload ảnh lên public/uploads/products/images
     */
    private function uploadLocal($file)
    {
        $folder = public_path('uploads/products/images');

        if (!file_exists($folder)) {
            mkdir($folder, 0777, true);
        }

        $filename  = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $extension = $file->getClientOriginalExtension();
        $finalName = $filename . '.' . $extension;

        $file->move($folder, $finalName);

        return '/uploads/products/images/' . $finalName;
    }
}  