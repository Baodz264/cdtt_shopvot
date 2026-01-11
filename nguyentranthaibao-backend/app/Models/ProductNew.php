<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class ProductNew extends Model
{
    use HasFactory;

    protected $table = 'product_new';

    protected $fillable = [
        'product_id',
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

    // Sản phẩm mới đang active
    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    // Sản phẩm mới còn hiệu lực theo ngày
    public function scopeValidDate($query)
    {
        $today = Carbon::today();

        return $query->where(function ($q) use ($today) {
            $q->whereNull('start_date')
              ->orWhere('start_date', '<=', $today);
        })->where(function ($q) use ($today) {
            $q->whereNull('end_date')
              ->orWhere('end_date', '>=', $today);
        });
    }
}
