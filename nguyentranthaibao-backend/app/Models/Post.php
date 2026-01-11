<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $table = 'post'; 

    protected $fillable = [
        'topic_id',
        'user_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'image',
        'type',
        'status',
        'views',
        'seo_title',
        'seo_description'
    ];

    /**
     * Quan hệ với bảng Topic
     */
    public function topic()
    {
        return $this->belongsTo(Topic::class);
    }

    /**
     * Quan hệ với bảng User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
