<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    /**
     * Lấy danh sách sản phẩm (có lọc + slug)
     * GET /api/products
     */
    public function index(Request $request)
    {
        $query = Product::with(['brand', 'category']);

        /* ================= LỌC ================= */
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        // 🔥 LỌC THEO SLUG
        if ($request->filled('slug')) {
            $query->where('slug', $request->slug);
        }

        // ===== LỌC THEO GIÁ =====
        if ($request->filled('price_from')) {
            $query->where('price', '>=', (float) $request->price_from);
        }

        if ($request->filled('price_to')) {
            $query->where('price', '<=', (float) $request->price_to);
        }

        /* ================= TÌM KIẾM ================= */
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        /* ================= SẮP XẾP ================= */
        $allowedSorts = ['id', 'name', 'price', 'sale_price', 'stock', 'created_at'];
        $sortBy = in_array($request->get('sortBy'), $allowedSorts)
            ? $request->get('sortBy')
            : 'id';

        $sortOrder = $request->get('sortOrder') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortOrder);

        /* ================= PHÂN TRANG ================= */
        $limit = max((int) $request->get('limit', 10), 1);
        $total = $query->count();

        $totalPage = max((int) ceil($total / $limit), 1);

        $page = (int) $request->get('page', 1);
        $page = max(1, min($page, $totalPage));

        $data = $query
            ->offset(($page - 1) * $limit)
            ->limit($limit)
            ->get();

        return response()->json([
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'totalPage' => $totalPage,
            'data' => $data,
        ]);
    }

    /**
     * Chi tiết sản phẩm theo ID
     * GET /api/products/{id}
     */
    public function show(Product $product)
    {
        $product->load(['brand', 'category']);
        return response()->json($product);
    }

    /**
     * Chi tiết sản phẩm theo SLUG (SEO)
     * GET /api/products/slug/{slug}
     */
    public function showBySlug($slug)
    {
        $product = Product::with(['brand', 'category'])
            ->where('slug', $slug)
            ->first();

        if (!$product) {
            return response()->json([
                'message' => 'Product not found'
            ], 404);
        }

        return response()->json($product);
    }

    /**
     * Thêm sản phẩm
     * POST /api/products
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'brand_id' => 'nullable|exists:brand,id',
            'category_id' => 'nullable|exists:category,id',
            'name' => 'required|string|max:200',
            'slug' => 'nullable|string|max:200|unique:product,slug',
            'price' => 'required|numeric',
            'sale_price' => 'nullable|numeric',
            'sku' => 'nullable|string|max:100',
            'stock' => 'nullable|integer',
            'thumbnail' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:4096',
            'description' => 'nullable|string',
            'detail' => 'nullable|string',
            'status' => 'nullable|integer|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->except('thumbnail');

        /* ===== Upload ảnh ===== */
        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $this->uploadLocal($request->file('thumbnail'));
        }

        /* ===== XỬ LÝ SLUG ===== */
        $slug = $request->slug ?: Str::slug($request->name);
        $slugBase = $slug;
        $i = 1;
        while (Product::where('slug', $slug)->exists()) {
            $slug = $slugBase . '-' . $i++;
        }
        $data['slug'] = $slug;

        $product = Product::create($data);
        $product->load(['brand', 'category']);

        return response()->json($product, 201);
    }

    /**
     * Cập nhật sản phẩm
     * PUT /api/products/{id}
     */
    public function update(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'brand_id' => 'sometimes|nullable|exists:brand,id',
            'category_id' => 'sometimes|nullable|exists:category,id',
            'name' => 'sometimes|required|string|max:200',
            'slug' => 'sometimes|string|max:200|unique:product,slug,' . $product->id,
            'price' => 'sometimes|required|numeric',
            'sale_price' => 'sometimes|numeric',
            'sku' => 'sometimes|string|max:100',
            'stock' => 'sometimes|integer',
            'thumbnail' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:4096',
            'description' => 'sometimes|string',
            'detail' => 'sometimes|string',
            'status' => 'sometimes|integer|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->except('thumbnail');

        /* ===== Upload ảnh mới ===== */
        if ($request->hasFile('thumbnail')) {
            if ($product->thumbnail && file_exists(public_path($product->thumbnail))) {
                unlink(public_path($product->thumbnail));
            }
            $data['thumbnail'] = $this->uploadLocal($request->file('thumbnail'));
        }

        /* ===== XỬ LÝ SLUG ===== */
        if (!empty($data['slug'])) {
            $slug = Str::slug($data['slug']);
        } elseif (!empty($data['name'])) {
            $slug = Str::slug($data['name']);
        } else {
            $slug = $product->slug;
        }

        $slugBase = $slug;
        $i = 1;
        while (
            Product::where('slug', $slug)
                ->where('id', '!=', $product->id)
                ->exists()
        ) {
            $slug = $slugBase . '-' . $i++;
        }

        $data['slug'] = $slug;

        $product->update($data);
        $product->load(['brand', 'category']);

        return response()->json($product);
    }

    /**
     * Xóa sản phẩm
     * DELETE /api/products/{id}
     */
    public function destroy(Product $product)
    {
        if ($product->thumbnail && file_exists(public_path($product->thumbnail))) {
            unlink(public_path($product->thumbnail));
        }

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully'
        ]);
    }

    /**
     * Upload ảnh local
     */
    private function uploadLocal($file)
    {
        $folder = public_path('uploads/products');

        if (!file_exists($folder)) {
            mkdir($folder, 0777, true);
        }

        $filename = time() . '_' . Str::slug(
            pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)
        );
        $extension = $file->getClientOriginalExtension();

        $finalName = $filename . '.' . $extension;
        $file->move($folder, $finalName);

        return '/uploads/products/' . $finalName;
    }
}
