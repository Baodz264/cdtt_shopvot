<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PostImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PostImageController extends Controller
{
    /**
     * Danh sách ảnh bài viết
     */
    public function index(Request $request)
    {
        $query = PostImage::with('post');

        if ($request->filled('post_id')) {
            $query->where('post_id', $request->post_id);
        }

        $limit  = (int) $request->get('limit', 10);
        $page   = (int) $request->get('page', 1);
        $offset = ($page - 1) * $limit;

        $total = $query->count();
        $data  = $query->offset($offset)->limit($limit)->get();

        return response()->json([
            'page'      => $page,
            'limit'     => $limit,
            'total'     => $total,
            'totalPage' => ceil($total / $limit),
            'data'      => $data,
        ]);
    }

    /**
     * Thêm ảnh mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'post_id'    => 'required|exists:post,id',
            'image'      => 'required|image|mimes:jpeg,png,jpg,gif|max:4096',
            'is_default' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors'=>$validator->errors()], 422);
        }

        // Upload ảnh
        $imagePath = $this->uploadLocal($request->file('image'));

        $data = $request->all();
        $data['image'] = $imagePath;

        $postImage = PostImage::create($data);

        return response()->json($postImage, 201);
    }

    /**
     * Chi tiết ảnh
     */
    public function show(PostImage $postImage)
    {
        $postImage->load('post');
        return response()->json($postImage);
    }

    /**
     * Cập nhật ảnh
     */
    public function update(Request $request, PostImage $postImage)
    {
        $validator = Validator::make($request->all(), [
            'post_id'    => 'sometimes|required|exists:post,id',
            'image'      => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:4096',
            'is_default' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors'=>$validator->errors()], 422);
        }

        $data = $request->all();

        // Upload ảnh mới nếu có
        if ($request->hasFile('image')) {
            // Xóa ảnh cũ nếu tồn tại
            if ($postImage->image && file_exists(public_path($postImage->image))) {
                unlink(public_path($postImage->image));
            }
            $data['image'] = $this->uploadLocal($request->file('image'));
        }

        $postImage->update($data);

        return response()->json($postImage);
    }

    /**
     * Xóa ảnh
     */
    public function destroy(PostImage $postImage)
    {
        if ($postImage->image && file_exists(public_path($postImage->image))) {
            unlink(public_path($postImage->image));
        }

        $postImage->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    /**
     * Upload ảnh lên thư mục public/uploads/post_images
     */
    private function uploadLocal($file)
    {
        $folder = public_path('uploads/post_images');

        if (!file_exists($folder)) {
            mkdir($folder, 0777, true);
        }

        $filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $extension = $file->getClientOriginalExtension();

        $finalName = $filename . '.' . $extension;

        $file->move($folder, $finalName);

        return '/uploads/post_images/' . $finalName;
    }
}
