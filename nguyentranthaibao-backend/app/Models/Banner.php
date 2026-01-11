<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory;

    protected $table = 'banner';

    protected $fillable = [
        'name',
        'link',
        'image',
        'position',
        'status',
    ];

    public $timestamps = false; // vì migration không có created_at/updated_at
}
