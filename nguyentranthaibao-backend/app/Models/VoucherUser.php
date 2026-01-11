<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Voucher;
use App\Models\User;
use App\Models\Order;

class VoucherUser extends Model
{
    use HasFactory;

    protected $table = 'voucher_user';

    public $timestamps = false; // chỉ có used_at, không có created_at/updated_at mặc định

    protected $fillable = [
        'voucher_id',
        'user_id',
        'order_id',
        'used_at',
    ];

    // Quan hệ với Voucher
    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
    }

    // Quan hệ với User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Quan hệ với Order
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
