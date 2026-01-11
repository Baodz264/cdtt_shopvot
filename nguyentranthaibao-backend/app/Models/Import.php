<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Import extends Model
{
    use HasFactory;

    protected $table = 'import'; // tên bảng không theo chuẩn plural

    public $timestamps = false; // chỉ có created_at, không có updated_at

    protected $fillable = [
        'user_id',
        'note',
    ];

    /**
     * Quan hệ với User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
