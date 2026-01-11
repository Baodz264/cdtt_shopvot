<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\CartItem;

class Cart extends Model
{
    use HasFactory;

    protected $table = 'cart';
    public $timestamps = false; // chỉ có created_at

    protected $fillable = [
        'user_id',
        'created_at',
    ];

    // Quan hệ với User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Quan hệ với CartItem
    public function items()
    {
        return $this->hasMany(CartItem::class);
    }
}
