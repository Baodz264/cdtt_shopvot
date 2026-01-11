<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\ProductVariant;

class ProductVariantValue extends Model
{
    use HasFactory;

    protected $table = 'product_variant_value';
    public $timestamps = false;

    protected $fillable = [
        'variant_id',
        'value',
        'extra_price',
        'stock',
        'thumbnail',
    ];

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }
}
