<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Address;
use Illuminate\Support\Facades\Validator;

class AddressController extends Controller
{
    // Lấy danh sách địa chỉ của user, có phân trang và tìm kiếm
    public function index(Request $request)
    {
        $query = Address::query();

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('fullname', 'like', "%$search%")
                  ->orWhere('phone', 'like', "%$search%")
                  ->orWhere('address_line', 'like', "%$search%");
            });
        }

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

    // Chi tiết địa chỉ
    public function show(Address $address)
    {
        return response()->json($address);
    }

    // Thêm địa chỉ
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'fullname' => 'required|string|max:150',
            'phone' => 'required|string|max:20',
            'address_line' => 'required|string',
            'city' => 'required|string|max:100',
            'district' => 'required|string|max:100',
            'ward' => 'required|string|max:100',
            'type' => 'nullable|in:billing,shipping',
            'is_default' => 'nullable|integer|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors'=>$validator->errors()],422);
        }

        if ($request->is_default) {
            Address::where('user_id', $request->user_id)->update(['is_default' => 0]);
        }

        $address = Address::create($request->all());

        return response()->json($address, 201);
    }

    // Cập nhật địa chỉ
    public function update(Request $request, Address $address)
    {
        $validator = Validator::make($request->all(), [
            'fullname' => 'sometimes|required|string|max:150',
            'phone' => 'sometimes|required|string|max:20',
            'address_line' => 'sometimes|required|string',
            'city' => 'sometimes|required|string|max:100',
            'district' => 'sometimes|required|string|max:100',
            'ward' => 'sometimes|required|string|max:100',
            'type' => 'sometimes|in:billing,shipping',
            'is_default' => 'sometimes|integer|in:0,1',
        ]);

        if($validator->fails()){
            return response()->json(['errors'=>$validator->errors()],422);
        }

        if ($request->has('is_default') && $request->is_default) {
            Address::where('user_id', $address->user_id)->update(['is_default' => 0]);
        }

        $data = $request->only([
            'fullname','phone','address_line','city','district','ward','type','is_default'
        ]);

        $address->update($data);

        return response()->json($address);
    }

    // Xóa địa chỉ
    public function destroy(Address $address)
    {
        $address->delete();
        return response()->json(['message'=>'Address deleted successfully']);
    }
}
