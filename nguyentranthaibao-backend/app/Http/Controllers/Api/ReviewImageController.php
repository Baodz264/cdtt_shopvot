<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReviewImage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class ReviewImageController extends Controller
{
    /**
     * Hiển thị danh sách ảnh review, có phân trang
     */
    public function index(Request $request)
    {
        $query = ReviewImage::with('review');

        if ($request->filled('review_id')) {
            $query->where('review_id', $request->review_id);
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
            'data'      => $data
        ]);
    }

    /**
     * Thêm ảnh review mới (upload)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'review_id' => 'required|exists:review,id',
            'image'     => 'required|image|mimes:jpeg,png,jpg,gif|max:4096',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors'=>$validator->errors()], 422);
        }

        $imagePath = $this->uploadLocal($request->file('image'));

        $reviewImage = ReviewImage::create([
            'review_id' => $request->review_id,
            'image'     => $imagePath,
        ]);

        return response()->json($reviewImage->load('review'), 201);
    }

    /**
     * Hiển thị chi tiết ảnh review
     */
    public function show(ReviewImage $reviewImage)
    {
        return response()->json($reviewImage->load('review'));
    }

    /**
     * Cập nhật ảnh review (upload)
     */
    public function update(Request $request, ReviewImage $reviewImage)
    {
        $validator = Validator::make($request->all(), [
            'review_id' => 'sometimes|required|exists:review,id',
            'image'     => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:4096',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors'=>$validator->errors()], 422);
        }

        $data = $request->only(['review_id']);

        if ($request->hasFile('image')) {
            // Xóa ảnh cũ nếu tồn tại
            if ($reviewImage->image && file_exists(public_path($reviewImage->image))) {
                unlink(public_path($reviewImage->image));
            }
            $data['image'] = $this->uploadLocal($request->file('image'));
        }

        $reviewImage->update($data);

        return response()->json($reviewImage->load('review'));
    }

    /**
     * Xóa ảnh review
     */
    public function destroy(ReviewImage $reviewImage)
    {
        if ($reviewImage->image && file_exists(public_path($reviewImage->image))) {
            unlink(public_path($reviewImage->image));
        }

        $reviewImage->delete();

        return response()->json(['message' => 'Review image deleted successfully']);
    }

    /**
     * Upload ảnh lên public/uploads/reviews/images
     */
    private function uploadLocal($file)
    {
        $folder = public_path('uploads/reviews/images');

        if (!file_exists($folder)) {
            mkdir($folder, 0777, true);
        }

        $filename  = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $extension = $file->getClientOriginalExtension();
        $finalName = $filename . '.' . $extension;

        $file->move($folder, $finalName);

        return '/uploads/reviews/images/' . $finalName;
    }
}
