<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariantValue;

class OrderItem extends Model
{
    use HasFactory;

    protected $table = 'order_item';

    protected $fillable = [
        'order_id',
        'product_id',
        'variant_value_id',
        'quantity',
        'price',
    ];

    // Quan hệ với Order
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // Quan hệ với Product
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Quan hệ với Variant Value
    public function variantValue()
    {
        return $this->belongsTo(ProductVariantValue::class, 'variant_value_id');
    }
    public $timestamps = false;
}
