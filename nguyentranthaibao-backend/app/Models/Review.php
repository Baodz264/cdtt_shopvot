<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $table = 'review';

    public $timestamps = false; // bảng chỉ có created_at

    protected $fillable = [
        'user_id',
        'product_id',
        'rating',
        'content',
        'status',
    ];

    /**
     * Quan hệ với User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Quan hệ với Product
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

     public function images()
    {
        return $this->hasMany(ReviewImage::class);
    }

    public function replies()
    {
        return $this->hasMany(ReviewReply::class);
    }
}
