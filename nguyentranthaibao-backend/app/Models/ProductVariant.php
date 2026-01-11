<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Product;

class ProductVariant extends Model
{
    use HasFactory;

    protected $table = 'product_variant';
    public $timestamps = false;

    protected $fillable = [
        'product_id',
        'name',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
