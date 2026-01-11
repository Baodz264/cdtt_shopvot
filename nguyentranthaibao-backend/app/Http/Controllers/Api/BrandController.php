<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class BrandController extends Controller
{
    /**
     * GET /api/brands
     * ?page=1
     * ?limit=10
     * ?search=apple
     * ?status=1
     * ?sort=name
     * ?order=asc
     */
    public function index(Request $request)
    {
        $query = Brand::query();

        /* =======================
         * FILTER: STATUS
         * ======================= */
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        /* =======================
         * FILTER: ID LIST
         * ======================= */
        if ($request->filled('ids')) {
            $ids = array_map('intval', explode(',', $request->ids));
            $query->whereIn('id', $ids);
        }

        /* =======================
         * FILTER: CREATED AT RANGE
         * ======================= */
        if ($request->filled('created_from')) {
            $query->whereDate('created_at', '>=', $request->created_from);
        }
        if ($request->filled('created_to')) {
            $query->whereDate('created_at', '<=', $request->created_to);
        }

        /* =======================
         * SEARCH: NAME + SLUG
         * ======================= */
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        /* =======================
         * SORT
         * ======================= */
        $allowedSort = ['id', 'name', 'created_at', 'status'];
        $sort = in_array($request->get('sort', 'id'), $allowedSort) ? $request->get('sort', 'id') : 'id';
        $order = $request->get('order', 'desc') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sort, $order);

        /* =======================
         * PAGINATION
         * ======================= */
        $limit = (int) $request->get('limit', 10);
        $brands = $query->paginate($limit);

        return response()->json([
            'data' => $brands->items(),
            'pagination' => [
                'total' => $brands->total(),
                'per_page' => $brands->perPage(),
                'current' => $brands->currentPage(),
                'last_page' => $brands->lastPage(),
            ]
        ]);
    }


    /**
     * GET /api/brands/{id}
     */
    public function show(Brand $brand)
    {
        return response()->json($brand);
    }

    /**
     * POST /api/brands
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:150',
            'slug' => 'nullable|string|max:150|unique:brand,slug',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:4096',
            'status' => 'nullable|integer|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        /* =======================
         * SLUG AUTO + UNIQUE
         * ======================= */
        $slug = $request->slug
            ? Str::slug($request->slug)
            : Str::slug($request->name);

        $slugBase = $slug;
        $i = 1;
        while (Brand::where('slug', $slug)->exists()) {
            $slug = "{$slugBase}-{$i}";
            $i++;
        }

        $data = [
            'name' => $request->name,
            'slug' => $slug,
            'status' => $request->get('status', 1),
        ];

        /* =======================
         * IMAGE UPLOAD
         * ======================= */
        if ($request->hasFile('image')) {
            $data['image'] = $this->uploadLocal($request->file('image'));
        }

        $brand = Brand::create($data);

        return response()->json($brand, 201);
    }

    /**
     * PUT /api/brands/{id}
     */
    public function update(Request $request, Brand $brand)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:150',
            'slug' => 'sometimes|nullable|string|max:150',
            'image' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif|max:4096',
            'status' => 'sometimes|required|integer|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['name', 'status']);

        /* =======================
         * SLUG UPDATE
         * ======================= */
        if ($request->filled('slug')) {
            $slug = Str::slug($request->slug);
        } elseif ($request->filled('name')) {
            $slug = Str::slug($request->name);
        } else {
            $slug = $brand->slug;
        }

        $slugBase = $slug;
        $i = 1;
        while (
            Brand::where('slug', $slug)
                ->where('id', '!=', $brand->id)
                ->exists()
        ) {
            $slug = "{$slugBase}-{$i}";
            $i++;
        }

        $data['slug'] = $slug;

        /* =======================
         * IMAGE UPDATE
         * ======================= */
        if ($request->hasFile('image')) {
            if ($brand->image && file_exists(public_path($brand->image))) {
                unlink(public_path($brand->image));
            }
            $data['image'] = $this->uploadLocal($request->file('image'));
        }

        $brand->update($data);

        return response()->json($brand);
    }

    /**
     * DELETE /api/brands/{id}
     */
    public function destroy(Brand $brand)
    {
        if ($brand->image && file_exists(public_path($brand->image))) {
            unlink(public_path($brand->image));
        }

        $brand->delete();

        return response()->json([
            'message' => 'Brand deleted successfully'
        ]);
    }

    /**
     * Upload ảnh local
     */
    private function uploadLocal($file)
    {
        $folder = public_path('uploads/brands');

        if (!file_exists($folder)) {
            mkdir($folder, 0777, true);
        }

        $filename = time() . '_' . Str::slug(
            pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)
        );

        $finalName = $filename . '.' . $file->getClientOriginalExtension();

        $file->move($folder, $finalName);

        return '/uploads/brands/' . $finalName;
    }
}
