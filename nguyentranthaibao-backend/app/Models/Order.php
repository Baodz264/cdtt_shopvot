<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Address;
use App\Models\Voucher;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';

    protected $fillable = [
        'user_id',
        'address_id',
        'fullname',
        'phone',
        'note',
        'total_money',
        'payment_method',
        'status',
        'payment_status',
        'voucher_id',
        'discount_price',
    ];

    // Quan hệ với User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Quan hệ với Address
    public function address()
    {
        return $this->belongsTo(Address::class);
    }

    // Quan hệ với Voucher
    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
    }

    // Quan hệ với OrderItem
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
     public $timestamps = false;
}
