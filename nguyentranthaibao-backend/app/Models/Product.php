<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Brand;
use App\Models\Category; // import Category

class Product extends Model
{
    use HasFactory;

    protected $table = 'product';

    protected $fillable = [
        'brand_id',
        'category_id', // thêm category_id
        'name',
        'slug',
        'price',
        'sale_price',
        'sku',
        'stock',
        'thumbnail',
        'description',
        'detail',
        'status',
    ];

    // Quan hệ với Brand
    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    // Quan hệ với Category
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
