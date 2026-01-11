<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Voucher;
use App\Models\User;

class VoucherClaim extends Model
{
    use HasFactory;

    protected $table = 'voucher_claim';

    public $timestamps = false; // bảng chỉ có claimed_at, không có created_at/updated_at mặc định

    protected $fillable = [
        'voucher_id',
        'user_id',
        'claimed_at',
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
}
