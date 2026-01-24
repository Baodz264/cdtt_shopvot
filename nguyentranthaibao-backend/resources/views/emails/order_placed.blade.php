<!DOCTYPE html>

<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Xác nhận đơn hàng</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:20px 0;">
        <tr>
            <td align="center">
                <!-- Container -->
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

```
                <!-- Header -->
                <tr>
                    <td style="background:linear-gradient(135deg,#4f46e5,#6366f1);padding:25px;text-align:center;color:#ffffff;">
                        <h1 style="margin:0;font-size:26px;">🎉 ĐẶT HÀNG THÀNH CÔNG</h1>
                        <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">
                            Cảm ơn bạn đã tin tưởng Shop Online
                        </p>
                    </td>
                </tr>

                <!-- Content -->
                <tr>
                    <td style="padding:30px;color:#333333;">
                        <h2 style="margin-top:0;font-size:20px;">
                            Xin chào <span style="color:#4f46e5;">{{ $order->fullname }}</span> 👋
                        </h2>

                        <p style="font-size:15px;line-height:1.6;">
                            Chúng tôi đã nhận được đơn hàng của bạn. Dưới đây là thông tin chi tiết:
                        </p>

                        <!-- Order Info -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-collapse:collapse;">
                            <tr>
                                <td style="padding:10px;border-bottom:1px solid #e5e7eb;">
                                    <strong>Mã đơn hàng</strong>
                                </td>
                                <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">
                                    #{{ $order->id }}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:10px;border-bottom:1px solid #e5e7eb;">
                                    <strong>Số điện thoại</strong>
                                </td>
                                <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">
                                    {{ $order->phone }}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:10px;border-bottom:1px solid #e5e7eb;">
                                    <strong>Phương thức thanh toán</strong>
                                </td>
                                <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">
                                    {{ $order->payment_method }}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:12px;">
                                    <strong>Tổng tiền</strong>
                                </td>
                                <td style="padding:12px;text-align:right;font-size:18px;font-weight:bold;color:#16a34a;">
                                    {{ number_format($order->total_money) }} đ
                                </td>
                            </tr>
                        </table>

                        @if($order->note)
                        <div style="margin-top:20px;padding:15px;background:#f9fafb;border-left:4px solid #6366f1;border-radius:6px;">
                            <strong>📝 Ghi chú:</strong><br>
                            <span style="font-size:14px;color:#555;">
                                {{ $order->note }}
                            </span>
                        </div>
                        @endif

                        <!-- Message -->
                        <p style="margin-top:25px;font-size:15px;line-height:1.6;">
                            🚚 Đơn hàng của bạn sẽ được xử lý và giao trong thời gian sớm nhất.
                            Nếu có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ với chúng tôi.
                        </p>

                        <!-- Button -->
                        <div style="text-align:center;margin:30px 0;">
                            <a href="{{ url('/') }}"
                               style="display:inline-block;background:#4f46e5;color:#ffffff;
                                      padding:12px 28px;border-radius:30px;
                                      text-decoration:none;font-size:15px;">
                                🔍 Truy cập Shop
                            </a>
                        </div>

                        <p style="font-size:14px;color:#555;">
                            Trân trọng,<br>
                            <strong>Shop Online</strong> ❤️
                        </p>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="background:#f3f4f6;padding:15px;text-align:center;font-size:12px;color:#777;">
                        © {{ date('Y') }} Shop Online. Mọi quyền được bảo lưu.
                    </td>
                </tr>

            </table>
            <!-- End Container -->
        </td>
    </tr>
</table>
```

</body>
</html>
