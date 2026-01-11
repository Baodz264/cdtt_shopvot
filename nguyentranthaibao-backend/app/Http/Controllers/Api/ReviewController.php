<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * Hiển thị danh sách review (phân trang + filter)
     * FE dùng API này để render ReviewList
     */
    public function index(Request $request)
    {
        $query = Review::with([
            'user:id,name,avatar',
            'images:id,review_id,image',
            'replies.user:id,name'
        ]);

        // Filter theo product
        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Filter theo user
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter theo rating >=
        if ($request->filled('min_rating')) {
            $query->where('rating', '>=', (int) $request->min_rating);
        }

        // Filter theo status
        if ($request->filled('status')) {
            $query->whereIn('status', explode(',', $request->status));
        }

        // Filter theo ngày tạo
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Phân trang
        $limit = (int) $request->get('limit', 10);
        $page  = (int) $request->get('page', 1);
        $offset = ($page - 1) * $limit;

        $total = $query->count();

        $data = $query
            ->latest('created_at')
            ->offset($offset)
            ->limit($limit)
            ->get();

        return response()->json([
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'totalPage' => ceil($total / $limit),
            'data' => $data
        ]);
    }

    /**
     * Thêm review mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id'    => 'nullable|exists:users,id',
            'product_id' => 'required|exists:product,id',
            'rating'     => 'required|integer|min:1|max:5',
            'content'    => 'nullable|string',
            'status'     => 'nullable|in:pending,approved,rejected',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $review = Review::create($request->only([
            'user_id',
            'product_id',
            'rating',
            'content',
            'status'
        ]));

        return response()->json(
            $review->load([
                'user:id,name,avatar',
                'images:id,review_id,image',
                'replies.user:id,name'
            ]),
            201
        );
    }

    /**
     * Hiển thị chi tiết review
     */
    public function show(Review $review)
    {
        return response()->json(
            $review->load([
                'user:id,name,avatar',
                'images:id,review_id,image',
                'replies.user:id,name'
            ])
        );
    }

    /**
     * Cập nhật review
     */
    public function update(Request $request, Review $review)
    {
        $validator = Validator::make($request->all(), [
            'user_id'    => 'nullable|exists:users,id',
            'product_id' => 'sometimes|required|exists:product,id',
            'rating'     => 'sometimes|required|integer|min:1|max:5',
            'content'    => 'nullable|string',
            'status'     => 'nullable|in:pending,approved,rejected',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $review->update($request->only([
            'user_id',
            'product_id',
            'rating',
            'content',
            'status'
        ]));

        return response()->json(
            $review->load([
                'user:id,name,avatar',
                'images:id,review_id,image',
                'replies.user:id,name'
            ])
        );
    }

    /**
     * Xóa review
     */
    public function destroy(Review $review)
    {
        $review->delete();

        return response()->json([
            'message' => 'Review deleted successfully'
        ]);
    }
}
