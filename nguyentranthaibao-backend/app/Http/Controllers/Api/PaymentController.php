<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    /**
     * Lấy danh sách payments, có phân trang
     */
    public function index(Request $request)
    {
        $query = Payment::with('order');

        if ($request->filled('order_id')) {
            $query->where('order_id', $request->order_id);
        }

        // Phân trang
        $limit = (int) $request->get('limit', 10);
        $page = (int) $request->get('page', 1);
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
     * Thêm payment mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'method' => 'required|in:cod,momo,vnpay,paypal',
            'amount' => 'required|numeric|min:0',
            'transaction_id' => 'nullable|string',
            'payment_status' => 'nullable|in:pending,paid,failed,refunded',
            'message' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payment = Payment::create($request->only([
            'order_id',
            'method',
            'amount',
            'transaction_id',
            'payment_status',
            'message'
        ]));

        return response()->json($payment->load('order'), 201);
    }

    /**
     * Hiển thị chi tiết payment
     */
    public function show(Payment $payment)
    {
        return response()->json($payment->load('order'));
    }

    /**
     * Cập nhật payment
     */
    public function update(Request $request, Payment $payment)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'sometimes|required|exists:orders,id',
            'method' => 'sometimes|required|in:cod,momo,vnpay,paypal',
            'amount' => 'sometimes|required|numeric|min:0',
            'transaction_id' => 'nullable|string',
            'payment_status' => 'nullable|in:pending,paid,failed,refunded',
            'message' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payment->update($request->only([
            'order_id',
            'method',
            'amount',
            'transaction_id',
            'payment_status',
            'message'
        ]));

        return response()->json($payment->load('order'));
    }

    /**
     * Xóa payment
     */
    public function destroy(Payment $payment)
    {
        $payment->delete();

        return response()->json(['message' => 'Payment deleted successfully']);
    }

    /**
     * Tạo URL thanh toán VNPAY
     */
    public function createVnpayPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:1000',
            'order_info' => 'nullable|string', // thêm order_info nếu muốn
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $amount = $request->amount * 100; // VNPAY yêu cầu *100

        // Tạo dữ liệu VNPAY
        $vnpData = [
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => env('VNP_TMN_CODE'),
            "vnp_Amount" => $amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => date('YmdHis'),
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $request->ip(),
            "vnp_Locale" => "vn",
            "vnp_OrderInfo" => $request->order_info ?? 'Thanh toán đơn hàng',
            "vnp_OrderType" => "other",
            "vnp_ReturnUrl" => env('VNP_RETURN_URL'),
            "vnp_TxnRef" => time(), // tạm dùng timestamp làm reference
        ];

        ksort($vnpData);
        $query = http_build_query($vnpData);
        $vnpData['vnp_SecureHash'] = hash_hmac('sha512', $query, env('VNP_HASH_SECRET'));

        $vnpUrl = env('VNP_URL') . '?' . http_build_query($vnpData);

        return response()->json(['payment_url' => $vnpUrl]);
    }


    /**
     * Xử lý callback VNPAY
     */
    public function vnpayReturn(Request $request)
    {
        try {
            // ⚠️ VNPAY gửi qua QUERY STRING
            $vnpData = $request->query();

            $vnpSecureHash = $vnpData['vnp_SecureHash'] ?? null;
            unset($vnpData['vnp_SecureHash'], $vnpData['vnp_SecureHashType']);

            ksort($vnpData);

            $checkHash = hash_hmac(
                'sha512',
                http_build_query($vnpData),
                env('VNP_HASH_SECRET')
            );

            if ($checkHash !== $vnpSecureHash) {
                return response()->json([
                    'message' => 'Invalid signature'
                ], 400);
            }

            $orderId = $vnpData['vnp_TxnRef'] ?? null;

            if (!$orderId) {
                return response()->json([
                    'message' => 'Missing order id'
                ], 400);
            }

            $paymentStatus = ($vnpData['vnp_ResponseCode'] === '00')
                ? 'paid'
                : 'failed';

            // ✅ KHÔNG TẠO TRÙNG PAYMENT
            $payment = Payment::updateOrCreate(
                [
                    'order_id' => $orderId,
                    'method' => 'vnpay',
                ],
                [
                    'amount' => ($vnpData['vnp_Amount'] ?? 0) / 100,
                    'transaction_id' => $vnpData['vnp_TransactionNo'] ?? null,
                    'payment_status' => $paymentStatus,
                    'message' => $vnpData['vnp_Message'] ?? null,
                ]
            );

            return response()->json([
                'payment' => $payment
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Internal server error',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
            ], 500);
        }
    }

}
