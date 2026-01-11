<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Address extends Model
{
    use HasFactory;

    protected $table = 'address';

    protected $fillable = [
        'user_id',
        'fullname',
        'phone',
        'address_line',
        'city',
        'district',
        'ward',
        'type',
        'is_default',
    ];

    // Quan hệ với User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
