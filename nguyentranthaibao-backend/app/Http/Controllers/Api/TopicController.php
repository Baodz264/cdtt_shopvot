<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Topic;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class TopicController extends Controller
{
    // Lấy danh sách topic
    public function index(Request $request)
    {
        $query = Topic::query();

        /* ================= SEARCH ================= */

        if ($request->filled('keyword')) {
            $keyword = $request->keyword;
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%$keyword%")
                    ->orWhere('slug', 'like', "%$keyword%");
            });
        }

        /* ================= FILTER ================= */

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Lọc theo ngày tạo
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        /* ================= SORT ================= */

        $sortBy = $request->get('sort_by', 'id');          // id | name | created_at
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


    // Chi tiết topic
    public function show(Topic $topic)
    {
        return response()->json($topic);
    }

    // Thêm topic
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:150',
            'slug' => 'nullable|string|max:150|unique:topic,slug',
            'status' => 'nullable|integer|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $slug = $request->slug ?: Str::slug($request->name);

        // Tránh trùng slug
        $slugBase = $slug;
        $i = 1;
        while (Topic::where('slug', $slug)->exists()) {
            $slug = $slugBase . '-' . $i++;
        }

        $topic = Topic::create([
            'name' => $request->name,
            'slug' => $slug,
            'status' => $request->status ?? 1,
        ]);

        return response()->json($topic, 201);
    }

    // Cập nhật topic
    public function update(Request $request, Topic $topic)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:150',
            'slug' => 'sometimes|string|max:150',
            'status' => 'sometimes|required|integer|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['name', 'slug', 'status']);

        // Sinh slug nếu không có hoặc muốn thay đổi
        if (!empty($data['slug'])) {
            $slug = Str::slug($data['slug']);
        } elseif (!empty($data['name'])) {
            $slug = Str::slug($data['name']);
        } else {
            $slug = $topic->slug;
        }

        // Tránh trùng slug với record khác
        $slugBase = $slug;
        $i = 1;
        while (Topic::where('slug', $slug)->where('id', '!=', $topic->id)->exists()) {
            $slug = $slugBase . '-' . $i++;
        }
        $data['slug'] = $slug;

        $topic->update($data);

        return response()->json($topic);
    }

    // Xóa topic
    public function destroy(Topic $topic)
    {
        $topic->delete();
        return response()->json(['message' => 'Topic deleted successfully']);
    }
}
