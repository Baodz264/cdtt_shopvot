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
     * Lấy danh sách sản phẩm
     */
    public function index(Request $request)
    {
        $query = Product::with(['brand', 'category']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        if ($request->filled('slug')) {
            $query->where('slug', $request->slug);
        }

        if ($request->filled('price_from')) {
            $query->where('price', '>=', (float) $request->price_from);
        }

        if ($request->filled('price_to')) {
            $query->where('price', '<=', (float) $request->price_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $allowedSorts = ['id', 'name', 'price', 'sale_price', 'stock', 'created_at'];
        $sortBy = in_array($request->get('sortBy'), $allowedSorts)
            ? $request->get('sortBy')
            : 'id';

        $sortOrder = $request->get('sortOrder') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortOrder);

        $limit = max((int) $request->get('limit', 10), 1);
        $total = $query->count();
        $totalPage = max((int) ceil($total / $limit), 1);

        $page = max(1, min((int) $request->get('page', 1), $totalPage));

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

    public function show(Product $product)
    {
        $product->load(['brand', 'category']);
        return response()->json($product);
    }

    public function showBySlug($slug)
    {
        $product = Product::with(['brand', 'category'])
            ->where('slug', $slug)
            ->first();

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product);
    }

    /**
     * Thêm sản phẩm
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'brand_id' => 'nullable|exists:brand,id',
            'category_id' => 'nullable|exists:category,id',

            'name' => [
                'required',
                'string',
                'max:200',
                'regex:/^[\pL0-9\s\-]+$/u'
            ],

            'slug' => [
                'nullable',
                'string',
                'max:200',
                'unique:product,slug',
                'regex:/^[a-z0-9\-]+$/'
            ],

            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0|lte:price',

            'sku' => [
                'nullable',
                'string',
                'max:100',
                'regex:/^[\pL0-9\-]+$/u'
            ],

            'stock' => 'nullable|integer|min:0',
            'thumbnail' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:4096',
            'description' => 'nullable|string',
            'detail' => 'nullable|string',
            'status' => 'nullable|integer|in:0,1',
        ], [
            'name.regex' => 'Tên sản phẩm không được chứa ký tự đặc biệt',
            'slug.regex' => 'Slug chỉ gồm chữ thường, số và dấu gạch ngang',
            'sku.regex'  => 'SKU không được chứa ký tự đặc biệt',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->except('thumbnail');

        if (isset($data['sale_price'], $data['price']) && $data['sale_price'] >= $data['price']) {
            $data['sale_price'] = null;
        }

        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $this->uploadLocal($request->file('thumbnail'));
        }

        $slug = $request->slug ?: Str::slug($request->name);
        $base = $slug;
        $i = 1;
        while (Product::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }
        $data['slug'] = $slug;

        $product = Product::create($data);
        $product->load(['brand', 'category']);

        return response()->json($product, 201);
    }

    /**
     * Cập nhật sản phẩm
     */
    public function update(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'brand_id' => 'sometimes|nullable|exists:brand,id',
            'category_id' => 'sometimes|nullable|exists:category,id',

            'name' => [
                'sometimes',
                'required',
                'string',
                'max:200',
                'regex:/^[\pL0-9\s\-]+$/u'
            ],

            'slug' => [
                'sometimes',
                'string',
                'max:200',
                'unique:product,slug,' . $product->id,
                'regex:/^[a-z0-9\-]+$/'
            ],

            'price' => 'sometimes|required|numeric|min:0',
            'sale_price' => 'sometimes|nullable|numeric|min:0|lte:price',

            'sku' => [
                'sometimes',
                'string',
                'max:100',
                'regex:/^[\pL0-9\-]+$/u'
            ],

            'stock' => 'sometimes|integer|min:0',
            'thumbnail' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:4096',
            'description' => 'sometimes|string',
            'detail' => 'sometimes|string',
            'status' => 'sometimes|integer|in:0,1',
        ], [
            'name.regex' => 'Tên sản phẩm không được chứa ký tự đặc biệt',
            'slug.regex' => 'Slug chỉ gồm chữ thường, số và dấu gạch ngang',
            'sku.regex'  => 'SKU không được chứa ký tự đặc biệt',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->except('thumbnail');

        if (isset($data['sale_price'], $data['price']) && $data['sale_price'] >= $data['price']) {
            $data['sale_price'] = null;
        }

        if ($request->hasFile('thumbnail')) {
            if ($product->thumbnail && file_exists(public_path($product->thumbnail))) {
                unlink(public_path($product->thumbnail));
            }
            $data['thumbnail'] = $this->uploadLocal($request->file('thumbnail'));
        }

        $slug = $data['slug'] ?? ($data['name'] ?? $product->slug);
        $slug = Str::slug($slug);

        $base = $slug;
        $i = 1;
        while (
            Product::where('slug', $slug)
                ->where('id', '!=', $product->id)
                ->exists()
        ) {
            $slug = $base . '-' . $i++;
        }

        $data['slug'] = $slug;

        $product->update($data);
        $product->load(['brand', 'category']);

        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        if ($product->thumbnail && file_exists(public_path($product->thumbnail))) {
            unlink(public_path($product->thumbnail));
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }

    private function uploadLocal($file)
    {
        $folder = public_path('uploads/products');

        if (!file_exists($folder)) {
            mkdir($folder, 0777, true);
        }

        $filename = time() . '_' . Str::slug(
            pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)
        );

        $finalName = $filename . '.' . $file->getClientOriginalExtension();
        $file->move($folder, $finalName);

        return '/uploads/products/' . $finalName;
    }
}
