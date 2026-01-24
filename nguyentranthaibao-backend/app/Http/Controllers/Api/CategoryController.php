<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    /**
     * Lấy danh sách Category (có search + phân trang)
     */
    public function index(Request $request)
    {
        $query = Category::query();

        /* ================= FILTER ================= */

        // Filter theo status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search theo name hoặc slug
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                    ->orWhere('slug', 'like', "%$search%");
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

        $sortBy = $request->get('sort_by', 'id');      // id | name | created_at
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
            'data' => $data,
        ]);
    }


    /**
     * Chi tiết Category
     */
    public function show(Category $category)
    {
        return response()->json($category);
    }

    /**
     * Thêm Category mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:150',
            'slug' => 'nullable|string|max:150|unique:category,slug',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:4096',
            'status' => 'nullable|integer|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $slug = $request->slug ?: Str::slug($request->name);

        // Tránh trùng slug
        $slugBase = $slug;
        $i = 1;
        while (Category::where('slug', $slug)->exists()) {
            $slug = $slugBase . '-' . $i++;
        }

        $data = $request->only(['name', 'status']);
        $data['slug'] = $slug;

        if ($request->hasFile('image')) {
            $data['image'] = $this->uploadLocal($request->file('image'));
        }

        $category = Category::create($data);

        return response()->json($category, 201);
    }

    /**
     * Cập nhật Category
     */
    public function update(Request $request, Category $category)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:150',
            'slug' => 'sometimes|string|max:150',
            'image' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif|max:4096',
            'status' => 'sometimes|required|integer|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['name', 'status']);

        // Xử lý slug
        if ($request->filled('slug')) {
            $slug = Str::slug($request->slug);
        } elseif ($request->filled('name')) {
            $slug = Str::slug($request->name);
        } else {
            $slug = $category->slug;
        }

        $slugBase = $slug;
        $i = 1;
        while (Category::where('slug', $slug)->where('id', '!=', $category->id)->exists()) {
            $slug = $slugBase . '-' . $i++;
        }
        $data['slug'] = $slug;

        if ($request->hasFile('image')) {
            if ($category->image && file_exists(public_path($category->image))) {
                unlink(public_path($category->image));
            }
            $data['image'] = $this->uploadLocal($request->file('image'));
        }

        $category->update($data);

        return response()->json($category);
    }

    /**
     * Xóa Category
     */
    public function destroy(Category $category)
    {
        if ($category->image && file_exists(public_path($category->image))) {
            unlink(public_path($category->image));
        }

        $category->delete();

        return response()->json(['message' => 'Xóa category thành công']);
    }

    /**
     * Upload ảnh lên thư mục public/uploads/categories
     */
    private function uploadLocal($file)
    {
        $folder = public_path('uploads/categories');

        if (!file_exists($folder)) {
            mkdir($folder, 0777, true);
        }

        $filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $extension = $file->getClientOriginalExtension();

        $finalName = $filename . '.' . $extension;

        $file->move($folder, $finalName);

        return '/uploads/categories/' . $finalName;
    }
}
