<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class BannerController extends Controller
{
    /**
     * Lấy danh sách banner (có search + phân trang)
     */
    public function index(Request $request)
    {
        $query = Banner::query();

        // Search theo name hoặc position
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('position', 'like', "%$search%");
            });
        }

        // Filter theo status nếu có
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $limit = (int) $request->get('limit', 10);
        $page  = (int) $request->get('page', 1);
        $offset = ($page - 1) * $limit;

        $total = $query->count();
        $data  = $query->offset($offset)->limit($limit)->get();

        return response()->json([
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'totalPage' => ceil($total / $limit),
            'data' => $data,
        ]);
    }

    /**
     * Chi tiết một banner
     */
    public function show(Banner $banner)
    {
        return response()->json($banner);
    }

    /**
     * Thêm mới banner (upload ảnh)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:150',
            'link'     => 'nullable|string',
            'image'    => 'required|image|mimes:jpeg,png,jpg,gif|max:4096',
            'position' => 'required|string|max:50',
            'status'   => 'nullable|integer|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['name','link','position','status']);

        // Upload ảnh
        $data['image'] = $this->uploadLocal($request->file('image'));

        $banner = Banner::create($data);

        return response()->json($banner, 201);
    }

    /**
     * Cập nhật banner
     */
    public function update(Request $request, Banner $banner)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'sometimes|required|string|max:150',
            'link'     => 'sometimes|nullable|string',
            'image'    => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:4096',
            'position' => 'sometimes|required|string|max:50',
            'status'   => 'sometimes|required|integer|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['name','link','position','status']);

        if ($request->hasFile('image')) {
            $data['image'] = $this->uploadLocal($request->file('image'));
        }

        $banner->update($data);

        return response()->json($banner);
    }

    /**
     * Xóa banner
     */
    public function destroy(Banner $banner)
    {
        $banner->delete();
        return response()->json(['message' => 'Xóa banner thành công']);
    }

    /**
     * Upload ảnh lên thư mục public/uploads/banners
     */
    private function uploadLocal($file)
    {
        $folder = public_path('uploads/banners');

        if (!file_exists($folder)) {
            mkdir($folder, 0777, true);
        }

        $filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $extension = $file->getClientOriginalExtension();

        $finalName = $filename . '.' . $extension;

        $file->move($folder, $finalName);

        return '/uploads/banners/' . $finalName;
    }
}
