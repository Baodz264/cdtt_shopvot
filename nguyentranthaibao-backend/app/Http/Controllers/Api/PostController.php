<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Post;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    /**
     * Hiển thị danh sách bài viết (có phân trang, search theo title)
     */
    public function index(Request $request)
    {
        $query = Post::with(['topic', 'user']);

        /* ================= SEARCH ================= */

        if ($request->filled('keyword')) {
            $keyword = $request->keyword;
            $query->where(function ($q) use ($keyword) {
                $q->where('title', 'like', "%$keyword%")
                    ->orWhere('excerpt', 'like', "%$keyword%")
                    ->orWhereHas('topic', function ($t) use ($keyword) {
                        $t->where('name', 'like', "%$keyword%");
                    })
                    ->orWhereHas('user', function ($u) use ($keyword) {
                        $u->where('name', 'like', "%$keyword%");
                    });
            });
        }

        /* ================= FILTER ================= */

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('topic_id')) {
            $query->where('topic_id', $request->topic_id);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Lọc theo lượt xem
        if ($request->filled('min_views')) {
            $query->where('views', '>=', $request->min_views);
        }

        if ($request->filled('max_views')) {
            $query->where('views', '<=', $request->max_views);
        }

        // Lọc theo ngày tạo
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        /* ================= SORT ================= */

        $sortBy = $request->get('sort_by', 'created_at'); // created_at | views | title
        $sortOrder = $request->get('sort_order', 'desc'); // asc | desc

        $query->orderBy($sortBy, $sortOrder);

        /* ================= PAGINATION ================= */

        $limit = (int) $request->get('limit', 10);
        $page = (int) $request->get('page', 1);
        $offset = ($page - 1) * $limit;

        $total = $query->count();
        $posts = $query->offset($offset)->limit($limit)->get();

        return response()->json([
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'totalPage' => ceil($total / $limit),
            'data' => $posts,
        ]);
    }

    public function showBySlug(string $slug)
    {
        $post = Post::with(['topic', 'user'])
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json($post);
    }
    public function increaseView(Post $post)
    {
        $post->increment('views'); // tăng lên 1
        return response()->json(['success' => true, 'views' => $post->views]);
    }


    /**
     * Hiển thị chi tiết bài viết
     */
    public function show(Post $post)
    {
        $post->load(['topic', 'user']);
        return response()->json($post);
    }

    /**
     * Thêm bài viết mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'topic_id' => 'nullable|exists:topic,id',
            'user_id' => 'nullable|exists:users,id',
            'title' => 'required|string|max:200',
            'slug' => 'nullable|string|max:200|unique:post,slug',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:4096',
            'type' => 'required|in:post,page',
            'status' => 'nullable|integer',
            'views' => 'nullable|integer',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Tạo slug tự động nếu không có
        $slug = $request->slug ?: Str::slug($request->title);
        $slugBase = $slug;
        $i = 1;
        while (Post::where('slug', $slug)->exists()) {
            $slug = $slugBase . '-' . $i++;
        }

        $data = $request->all();
        $data['slug'] = $slug;

        // Upload ảnh nếu có
        if ($request->hasFile('image')) {
            $data['image'] = $this->uploadLocal($request->file('image'));
        }

        $post = Post::create($data);

        return response()->json($post, 201);
    }

    /**
     * Cập nhật bài viết
     */
    public function update(Request $request, Post $post)
    {
        $validator = Validator::make($request->all(), [
            'topic_id' => 'sometimes|nullable|exists:topic,id',
            'user_id' => 'sometimes|nullable|exists:users,id',
            'title' => 'sometimes|required|string|max:200',
            'slug' => "sometimes|string|max:200|unique:post,slug,{$post->id}",
            'excerpt' => 'nullable|string|max:500',
            'content' => 'sometimes|required|string',
            'image' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif|max:4096',
            'type' => 'sometimes|required|in:post,page',
            'status' => 'nullable|integer',
            'views' => 'nullable|integer',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->all();

        // Tạo slug tự động nếu không có
        if (empty($data['slug']) && !empty($data['title'])) {
            $slug = Str::slug($data['title']);
        } elseif (!empty($data['slug'])) {
            $slug = Str::slug($data['slug']);
        } else {
            $slug = $post->slug;
        }

        $slugBase = $slug;
        $i = 1;
        while (Post::where('slug', $slug)->where('id', '!=', $post->id)->exists()) {
            $slug = $slugBase . '-' . $i++;
        }

        $data['slug'] = $slug;

        // Upload ảnh mới nếu có
        if ($request->hasFile('image')) {
            // Xóa ảnh cũ nếu tồn tại
            if ($post->image && file_exists(public_path($post->image))) {
                unlink(public_path($post->image));
            }
            $data['image'] = $this->uploadLocal($request->file('image'));
        }

        $post->update($data);

        return response()->json($post);
    }

    /**
     * Xóa bài viết
     */
    public function destroy(Post $post)
    {
        if ($post->image && file_exists(public_path($post->image))) {
            unlink(public_path($post->image));
        }

        $post->delete();
        return response()->json(['message' => 'Post deleted successfully']);
    }

    /**
     * Upload ảnh lên thư mục public/uploads/posts
     */
    private function uploadLocal($file)
    {
        $folder = public_path('uploads/posts');

        if (!file_exists($folder)) {
            mkdir($folder, 0777, true);
        }

        $filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $extension = $file->getClientOriginalExtension();

        $finalName = $filename . '.' . $extension;

        $file->move($folder, $finalName);

        return '/uploads/posts/' . $finalName;
    }
}
