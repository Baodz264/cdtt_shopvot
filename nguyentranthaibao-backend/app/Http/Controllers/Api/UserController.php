<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;

class UserController extends Controller
{
    /**
     * Upload avatar lên thư mục public/uploads/avatars
     */
    private function uploadAvatar($file)
    {
        if (!$file) return null;

        $folder = public_path('uploads/avatars');

        if (!File::isDirectory($folder)) {
            File::makeDirectory($folder, 0777, true, true);
        }

        $filename = time() . '_' . $file->getClientOriginalName();
        $file->move($folder, $filename);

        return '/uploads/avatars/' . $filename;
    }

    /**
     * Lấy danh sách user (có search + phân trang)
     */
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

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
     * Chi tiết User
     */
    public function show(User $user)
    {
        return response()->json($user);
    }

    /**
     * Thêm user mới (upload avatar)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'nullable|string|max:100',
            'email'    => 'required|email|max:150|unique:users',
            'phone'    => 'nullable|string|max:20',
            'password' => 'required|string|min:8',
            'avatar'   => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'role'     => 'required|in:customer,admin',
            'status'   => 'required|integer|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['name','email','phone','role','status']);
        $data['password'] = Hash::make($request->password);

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $this->uploadAvatar($request->file('avatar'));
        }

        $user = User::create($data);

        return response()->json($user, 201);
    }

    /**
     * Cập nhật user
     */
    public function update(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'sometimes|nullable|string|max:100',
            'email'    => 'sometimes|required|email|max:150|unique:users,email,' . $user->id,
            'phone'    => 'sometimes|nullable|string|max:20',
            'password' => 'sometimes|nullable|string|min:8',
            'avatar'   => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'role'     => 'sometimes|in:customer,admin',
            'status'   => 'sometimes|integer|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['name','email','phone','role','status']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        if ($request->hasFile('avatar')) {
            // Xóa avatar cũ nếu tồn tại
            if ($user->avatar) {
                $oldPath = public_path(ltrim($user->avatar, '/'));
                if (File::exists($oldPath)) File::delete($oldPath);
            }
            $data['avatar'] = $this->uploadAvatar($request->file('avatar'));
        }

        $user->update($data);

        return response()->json($user);
    }

    /**
     * Xóa user
     */
    public function destroy(User $user)
    {
        if ($user->avatar) {
            $oldPath = public_path(ltrim($user->avatar, '/'));
            if (File::exists($oldPath)) File::delete($oldPath);
        }

        $user->delete();

        return response()->json(['message' => 'Xóa người dùng thành công']);
    }
}
