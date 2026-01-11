<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Xác thực tài khoản</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 30px auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);}
        h2 { color: #333; }
        p { color: #555; line-height: 1.5; }
        a.button { display: inline-block; padding: 12px 25px; margin-top: 20px; background-color: #007BFF; color: #fff !important; text-decoration: none; border-radius: 5px; font-weight: bold; }
        a.button:hover { background-color: #0056b3; }
        .footer { margin-top: 30px; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Xin chào,</h2>
        <p>Bạn vừa đăng ký tài khoản trên hệ thống của chúng tôi. Vui lòng nhấn nút bên dưới để xác thực email và kích hoạt tài khoản:</p>
        <a href="{{ $link }}" class="button">Xác thực tài khoản</a>
        <p>Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.</p>
        <div class="footer">© 2025 Shop của bạn. Bảo mật thông tin luôn được ưu tiên.</div>
    </div>
</body>
</html>
