<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $table = 'setting';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'hotline',
        'address',
        'logo'
    ];

    public $timestamps = false; // bảng chỉ có updated_at
}
