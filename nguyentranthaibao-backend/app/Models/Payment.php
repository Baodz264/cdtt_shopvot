<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $table = 'payment';

    public $timestamps = false; // chỉ có created_at

    protected $fillable = [
        'order_id',
        'method',
        'amount',
        'transaction_id',
        'payment_status',
        'message',
    ];

    /**
     * Quan hệ với Order
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
