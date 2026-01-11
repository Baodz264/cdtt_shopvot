<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReviewImage extends Model
{
    use HasFactory;

    protected $table = 'review_image';

    public $timestamps = false; // chỉ có created_at, không có updated_at

    protected $fillable = [
        'review_id',
        'image',
    ];

    /**
     * Quan hệ với Review
     */
    public function review()
    {
        return $this->belongsTo(Review::class);
    }
}
