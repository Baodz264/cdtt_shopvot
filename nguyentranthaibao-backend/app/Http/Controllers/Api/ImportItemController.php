<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ImportItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ImportItemController extends Controller
{
    // Hiển thị danh sách import items, có phân trang
    public function index(Request $request)
    {
        $query = ImportItem::with(['import', 'product']);

        if ($request->filled('import_id')) {
            $query->where('import_id', $request->import_id);
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

    // Thêm import item mới
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'import_id' => 'required|exists:import,id',
            'product_id' => 'required|exists:product,id',
            'quantity' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $item = ImportItem::create($request->only([
            'import_id', 'product_id', 'quantity', 'price'
        ]));

        return response()->json($item->load(['import', 'product']), 201);
    }

    // Hiển thị chi tiết import item
    public function show(ImportItem $importItem)
    {
        return response()->json($importItem->load(['import', 'product']));
    }

    // Cập nhật import item
    public function update(Request $request, ImportItem $importItem)
    {
        $validator = Validator::make($request->all(), [
            'import_id' => 'sometimes|required|exists:import,id',
            'product_id' => 'sometimes|required|exists:product,id', // sửa từ products -> product
            'quantity' => 'sometimes|required|integer|min:1',
            'price' => 'sometimes|required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $importItem->update($request->only([
            'import_id', 'product_id', 'quantity', 'price'
        ]));

        return response()->json($importItem->load(['import', 'product']));
    }

    // Xóa import item
    public function destroy(ImportItem $importItem)
    {
        $importItem->delete();
        return response()->json(['message' => 'Import item deleted successfully']);
    }
}
