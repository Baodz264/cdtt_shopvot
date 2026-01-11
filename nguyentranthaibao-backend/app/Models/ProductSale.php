<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class ProductSale extends Model
{
    use HasFactory;

    protected $table = 'product_sale';

    protected $fillable = [
        'product_id',
        'original_price',
        'sale_price',
        'sale_percent',
        'start_date',
        'end_date',
        'status',
    ];

    protected $casts = [
        'status'     => 'boolean',
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    /* ================= RELATION ================= */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /* ================= SCOPE ================= */

    // Sale đang hoạt động + còn hiệu lực
    public function scopeActive($query)
    {
        $today = Carbon::today();

        return $query->where('status', true)
            ->where(function ($q) use ($today) {
                $q->whereNull('start_date')
                  ->orWhere('start_date', '<=', $today);
            })
            ->where(function ($q) use ($today) {
                $q->whereNull('end_date')
                  ->orWhere('end_date', '>=', $today);
            });
    }

    /* ================= ACCESSOR ================= */

    // % giảm tự động nếu không lưu
    public function getDiscountPercentAttribute()
    {
        if ($this->original_price > 0 && $this->sale_price > 0) {
            return round(100 - ($this->sale_price / $this->original_price * 100));
        }
        return 0;
    }
}
