<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReviewLike;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewLikeController extends Controller
{
    /**
     * Hiển thị danh sách review likes, phân trang
     */
    public function index(Request $request)
    {
        $query = ReviewLike::with(['review', 'user']);

        // Filter theo review_id
        if ($request->filled('review_id')) {
            $query->where('review_id', $request->review_id);
        }

        // Filter theo user_id
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter theo type: like/dislike
        if ($request->filled('type')) {
            $types = explode(',', $request->type); // hỗ trợ nhiều type: like,dislike
            $query->whereIn('type', $types);
        }

        // Filter theo khoảng thời gian tạo
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Phân trang
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


    /**
     * Thêm like/dislike mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'review_id' => 'required|exists:review,id',
            'user_id' => 'required|exists:users,id',
            'type' => 'required|in:like,dislike',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Kiểm tra user đã like/dislike chưa
        $existing = ReviewLike::where('review_id', $request->review_id)
            ->where('user_id', $request->user_id)
            ->first();
        if ($existing) {
            return response()->json(['message' => 'User already liked/disliked this review'], 409);
        }

        $like = ReviewLike::create($request->only(['review_id', 'user_id', 'type']));

        return response()->json($like->load(['review', 'user']), 201);
    }

    /**
     * Hiển thị chi tiết like
     */
    public function show(ReviewLike $reviewLike)
    {
        return response()->json($reviewLike->load(['review', 'user']));
    }

    /**
     * Cập nhật type like/dislike
     */
    public function update(Request $request, ReviewLike $reviewLike)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:like,dislike',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $reviewLike->update($request->only(['type']));

        return response()->json($reviewLike->load(['review', 'user']));
    }

    /**
     * Xóa like/dislike
     */
    public function destroy(ReviewLike $reviewLike)
    {
        $reviewLike->delete();

        return response()->json(['message' => 'Review like deleted successfully']);
    }
}
