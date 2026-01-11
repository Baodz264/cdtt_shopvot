<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImportItem extends Model
{
    use HasFactory;

    protected $table = 'import_item';

    public $timestamps = false; // bảng không có created_at/updated_at

    protected $fillable = [
        'import_id',
        'product_id',
        'quantity',
        'price',
    ];

    /**
     * Quan hệ với Import
     */
    public function import()
    {
        return $this->belongsTo(Import::class);
    }

    /**
     * Quan hệ với Product
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
