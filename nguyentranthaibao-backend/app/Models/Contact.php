<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    use HasFactory;

    protected $table = 'contact';

    protected $fillable = [
        'fullname',
        'email',
        'phone',
        'message',
        'reply',
        'status'
    ];

    public $timestamps = false; // vì migration chỉ có created_at
}
