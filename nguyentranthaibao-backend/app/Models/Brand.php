<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    use HasFactory;

    protected $table = 'brand';

    // Nếu bạn không muốn Eloquent tự động xử lý timestamps
    public $timestamps = false;

    protected $fillable = [
        'name',
        'slug',
        'image',
        'status',
    ];
}
