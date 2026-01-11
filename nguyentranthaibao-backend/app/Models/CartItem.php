<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Cart;
use App\Models\Product;
use App\Models\ProductVariantValue;

class CartItem extends Model
{
    use HasFactory;

    protected $table = 'cart_item';
    public $timestamps = false;

    protected $fillable = [
        'cart_id',
        'product_id',
        'variant_value_id',
        'quantity',
        'price',
    ];

    // Quan hệ với Cart
    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    // Quan hệ với Product
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Quan hệ với Product Variant Value
    public function variantValue()
    {
        return $this->belongsTo(ProductVariantValue::class, 'variant_value_id');
    }
}
