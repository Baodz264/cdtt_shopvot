<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class SettingController extends Controller
{
    /**
     * Lấy danh sách setting (có search + phân trang)
     */
    public function index(Request $request)
    {
        $query = Setting::query();

        // Search theo name hoặc email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
        }

        $query->orderBy('id', 'desc');

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
            'from' => $total > 0 ? $offset + 1 : 0,
            'to' => ($offset + $limit) > $total ? $total : ($offset + $limit),
            'data' => $data
        ]);
    }

    /**
     * Chi tiết setting
     */
    public function show(Setting $setting)
    {
        return response()->json($setting);
    }

    /**
     * Thêm setting (có upload logo)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'    => 'nullable|string|max:200',
            'email'   => 'nullable|email|max:150',
            'phone'   => 'nullable|string|max:50',
            'hotline' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'logo'    => 'nullable|image|mimes:jpeg,png,jpg,gif|max:4096',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['name','email','phone','hotline','address']);

        // Upload logo nếu có
        if ($request->hasFile('logo')) {
            $data['logo'] = $this->uploadLocal($request->file('logo'));
        }

        $setting = Setting::create($data);

        return response()->json($setting, 201);
    }

    /**
     * Cập nhật setting (có upload logo)
     */
    public function update(Request $request, Setting $setting)
    {
        $validator = Validator::make($request->all(), [
            'name'    => 'sometimes|string|max:200',
            'email'   => 'sometimes|email|max:150',
            'phone'   => 'sometimes|string|max:50',
            'hotline' => 'sometimes|string|max:50',
            'address' => 'sometimes|string',
            'logo'    => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:4096',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['name','email','phone','hotline','address']);

        // Upload logo mới nếu có, xóa logo cũ
        if ($request->hasFile('logo')) {
            if ($setting->logo && file_exists(public_path($setting->logo))) {
                unlink(public_path($setting->logo));
            }
            $data['logo'] = $this->uploadLocal($request->file('logo'));
        }

        $setting->update($data);

        return response()->json($setting);
    }

    /**
     * Xóa setting
     */
    public function destroy(Setting $setting)
    {
        // Xóa logo cũ nếu có
        if ($setting->logo && file_exists(public_path($setting->logo))) {
            unlink(public_path($setting->logo));
        }

        $setting->delete();
        return response()->json(['message' => 'Xóa setting thành công']);
    }

    /**
     * Upload ảnh lên thư mục public/uploads/settings
     */
    private function uploadLocal($file)
    {
        $folder = public_path('uploads/settings');

        if (!file_exists($folder)) {
            mkdir($folder, 0777, true);
        }

        $filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $extension = $file->getClientOriginalExtension();

        $finalName = $filename . '.' . $extension;

        $file->move($folder, $finalName);

        return '/uploads/settings/' . $finalName;
    }
}
