<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MenuController extends Controller
{
    /**
     * Danh sách menu (có page, limit, search, filter)
     */
    public function index(Request $request)
    {
        $query = Menu::query();

        // Filter theo status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search theo name hoặc link
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('link', 'like', "%$search%");
            });
        }

        // Clone query để tính total trước khi phân trang
        $totalQuery = clone $query;
        $total = $totalQuery->count();

        // Phân trang
        $limit = (int) $request->get('limit', 10);
        $page  = (int) $request->get('page', 1);
        $menus = $query->orderBy('id', 'desc')
                       ->skip(($page - 1) * $limit)
                       ->take($limit)
                       ->get();

        return response()->json([
            'status' => true,
            'data' => $menus,
            'total' => $total,
            'limit' => $limit,
            'page'  => $page,
            'totalPage' => ceil($total / $limit),
            'message' => 'Tải dữ liệu menu thành công'
        ], 200);
    }

    /**
     * Chi tiết menu
     */
    public function show($id)
    {
        $menu = Menu::find($id);
        if (!$menu) {
            return response()->json([
                'status' => false,
                'message' => 'Menu không tồn tại'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $menu
        ], 200);
    }

    /**
     * Thêm menu
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'      => 'required|string|max:150',
            'link'      => 'nullable|string',
            'type'      => 'required|in:category,topic,post,custom',
            'parent_id' => 'nullable|integer|exists:menu,id',
            'position'  => 'required|string|max:50',
            'status'    => 'nullable|integer|in:0,1'
        ]);

        if ($validator->fails()) {
            return response()->json(['status'=>false,'errors'=>$validator->errors()], 422);
        }

        $menu = Menu::create([
            'name'      => $request->name,
            'link'      => $request->link,
            'type'      => $request->type,
            'parent_id' => $request->parent_id,
            'position'  => $request->position,
            'status'    => $request->status ?? 1
        ]);

        return response()->json([
            'status' => true,
            'data' => $menu,
            'message' => 'Tạo menu thành công'
        ], 201);
    }

    /**
     * Cập nhật menu
     */
    public function update(Request $request, $id)
    {
        $menu = Menu::find($id);
        if (!$menu) {
            return response()->json([
                'status' => false,
                'message' => 'Menu không tồn tại'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'      => 'sometimes|required|string|max:150',
            'link'      => 'sometimes|nullable|string',
            'type'      => 'sometimes|required|in:category,topic,post,custom',
            'parent_id' => 'sometimes|nullable|integer|exists:menu,id',
            'position'  => 'sometimes|required|string|max:50',
            'status'    => 'sometimes|required|integer|in:0,1'
        ]);

        if ($validator->fails()) {
            return response()->json(['status'=>false,'errors'=>$validator->errors()], 422);
        }

        $menu->update($request->only(['name','link','type','parent_id','position','status']));

        return response()->json([
            'status' => true,
            'data' => $menu,
            'message' => 'Cập nhật menu thành công'
        ], 200);
    }

    /**
     * Xóa menu
     */
    public function destroy($id)
    {
        $menu = Menu::find($id);
        if (!$menu) {
            return response()->json([
                'status' => false,
                'message' => 'Menu không tồn tại'
            ], 404);
        }

        $menu->delete();

        return response()->json([
            'status' => true,
            'message' => 'Xóa menu thành công'
        ], 200);
    }
}
