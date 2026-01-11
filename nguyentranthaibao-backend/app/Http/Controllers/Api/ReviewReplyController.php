<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReviewReply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewReplyController extends Controller
{
    /**
     * Hiển thị danh sách reply review, có phân trang
     */
    public function index(Request $request)
    {
        $query = ReviewReply::with(['review', 'user']);

        if ($request->filled('review_id')) {
            $query->where('review_id', $request->review_id);
        }

        // Phân trang
        $limit = (int) $request->get('limit', 10);
        $page  = (int) $request->get('page', 1);
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
     * Thêm reply mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'review_id' => 'required|exists:review,id',
            'user_id'   => 'nullable|exists:users,id',
            'reply'     => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $reply = ReviewReply::create($request->only([
            'review_id', 'user_id', 'reply'
        ]));

        return response()->json($reply->load(['review', 'user']), 201);
    }

    /**
     * Hiển thị chi tiết reply
     */
    public function show(ReviewReply $reviewReply)
    {
        return response()->json($reviewReply->load(['review', 'user']));
    }

    /**
     * Cập nhật reply
     */
    public function update(Request $request, ReviewReply $reviewReply)
    {
        $validator = Validator::make($request->all(), [
            'review_id' => 'sometimes|required|exists:review,id',
            'user_id'   => 'nullable|exists:users,id',
            'reply'     => 'sometimes|required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $reviewReply->update($request->only([
            'review_id', 'user_id', 'reply'
        ]));

        return response()->json($reviewReply->load(['review', 'user']));
    }

    /**
     * Xóa reply
     */
    public function destroy(ReviewReply $reviewReply)
    {
        $reviewReply->delete();
        return response()->json(['message' => 'Review reply deleted successfully']);
    }
}
