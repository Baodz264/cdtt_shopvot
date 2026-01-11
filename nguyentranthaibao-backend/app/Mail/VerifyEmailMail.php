<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerifyEmailMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $link;

    /**
     * Khởi tạo Mailable với token xác thực
     */
    public function __construct(string $token)
    {
        // Link xác thực → frontend Next.js xử lý
        $this->link = env('FRONTEND_URL', 'http://localhost:3000') . '/verify-email?token=' . urlencode($token);
    }

    /**
     * Build mail
     */
    public function build()
    {
        return $this->subject('Xác thực tài khoản')
                    ->view('emails.verify-email-html')  // HTML email
                    ->text('emails.verify-email-text') // Plain text fallback
                    ->with(['link' => $this->link]);
    }
}
