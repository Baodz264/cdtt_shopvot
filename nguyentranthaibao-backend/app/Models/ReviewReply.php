<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReviewReply extends Model
{
    use HasFactory;

    protected $table = 'review_reply';

    public $timestamps = false; // chỉ có created_at, không có updated_at

    protected $fillable = [
        'review_id',
        'user_id',
        'reply',
    ];

    /**
     * Quan hệ với Review
     */
    public function review()
    {
        return $this->belongsTo(Review::class);
    }

    /**
     * Quan hệ với User (người trả lời)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
