<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    use HasFactory;

    protected $table = 'voucher';

    protected $fillable = [
        'code',
        'name',
        'type',
        'discount_value',
        'max_discount',
        'min_order',
        'quantity',
        'used',
        'start_date',
        'end_date',
        'status'
    ];

    public $timestamps = false; // chỉ dùng created_at
}
