<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    /**
     * Lấy danh sách contact
     */
    public function index(Request $request)
    {
        $query = Contact::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
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

    /**
     * Chi tiết contact
     */
    public function show(Contact $contact)
    {
        return response()->json($contact);
    }

    /**
     * Thêm contact
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fullname' => 'required|string|max:150',
            'email'    => 'nullable|email|max:150',
            'phone'    => 'nullable|string|max:20',
            'message'  => 'required|string',
            'reply'    => 'nullable|string',
            'status'   => 'nullable|integer|in:0,1'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors'=>$validator->errors()],422);
        }

        $contact = Contact::create([
            'fullname' => $request->fullname,
            'email'    => $request->email,
            'phone'    => $request->phone,
            'message'  => $request->message,
            'reply'    => $request->reply,
            'status'   => $request->status ?? 0
        ]);

        return response()->json($contact, 201);
    }

    /**
     * Cập nhật contact
     */
    public function update(Request $request, Contact $contact)
    {
        $validator = Validator::make($request->all(), [
            'fullname' => 'sometimes|required|string|max:150',
            'email'    => 'sometimes|nullable|email|max:150',
            'phone'    => 'sometimes|nullable|string|max:20',
            'message'  => 'sometimes|required|string',
            'reply'    => 'sometimes|nullable|string',
            'status'   => 'sometimes|required|integer|in:0,1'
        ]);

        if($validator->fails()){
            return response()->json(['errors'=>$validator->errors()],422);
        }

        $contact->update($request->only(['fullname','email','phone','message','reply','status']));

        return response()->json($contact);
    }

    /**
     * Xóa contact
     */
    public function destroy(Contact $contact)
    {
        $contact->delete();
        return response()->json(['message'=>'Contact deleted successfully']);
    }
}
