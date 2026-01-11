<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Product;

class ProductImage extends Model
{
    use HasFactory;

    protected $table = 'product_image';
    public $timestamps = false;

    protected $fillable = [
        'product_id',
        'image',
        'is_default',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
