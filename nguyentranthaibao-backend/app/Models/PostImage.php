<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PostImage extends Model
{
    use HasFactory;

    protected $table = 'post_image'; // đặt tên bảng nếu khác chuẩn plural

    protected $fillable = [
        'post_id',
        'image',
        'is_default',
    ];

    public $timestamps = false; // vì migration chỉ có created_at, không có updated_at

    /**
     * Quan hệ với Post
     */
    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
