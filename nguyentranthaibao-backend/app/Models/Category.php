<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'category';

    // Các trường được phép thêm/sửa
    protected $fillable = ['name', 'slug', 'image', 'status'];

    public $timestamps = false; // vì bạn dùng created_at thủ công
}
