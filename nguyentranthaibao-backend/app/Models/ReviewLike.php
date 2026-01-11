<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReviewLike extends Model
{
    use HasFactory;

    protected $table = 'review_like';

    public $timestamps = false; // chỉ có created_at

    protected $fillable = [
        'review_id',
        'user_id',
        'type',
    ];

    /**
     * Quan hệ với Review
     */
    public function review()
    {
        return $this->belongsTo(Review::class);
    }

    /**
     * Quan hệ với User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
