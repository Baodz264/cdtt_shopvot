<?php

use App\Models\Product;
use Illuminate\Support\Facades\Route;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Support\Str;

Route::get('/', function () {
     $query = Product::with(['brand', 'category'])->get();
     
     return $query;

});


