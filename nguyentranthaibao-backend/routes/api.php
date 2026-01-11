<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\TopicController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\VoucherController;
use App\Http\Controllers\Api\VoucherClaimController;
use App\Http\Controllers\Api\VoucherUserController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductImageController;
use App\Http\Controllers\Api\ProductVariantController;
use App\Http\Controllers\Api\ProductVariantValueController;
use App\Http\Controllers\Api\ProductNewController;
use App\Http\Controllers\Api\ProductSaleController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CartItemController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OrderItemController;
use App\Http\Controllers\Api\ImportController;
use App\Http\Controllers\Api\ImportItemController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\PostImageController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ReviewImageController;
use App\Http\Controllers\Api\ReviewReplyController;
use App\Http\Controllers\Api\ReviewLikeController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ChatbotController;
use App\Http\Middleware\CheckAdmin;

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/verify-email', [AuthController::class, 'verifyEmail']);
Route::post('/verify-email-direct', [AuthController::class, 'verifyEmailDirect']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/change-password', [AuthController::class, 'changePassword']);

/*
|--------------------------------------------------------------------------
| AUTHENTICATED BASIC
|--------------------------------------------------------------------------
*/
Route::middleware('jwt.auth')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES (AI CŨNG XEM ĐƯỢC)
|--------------------------------------------------------------------------
*/
// Category – Brand – Menu
Route::post('/payments/vnpay', [PaymentController::class, 'createVnpayPayment']);
Route::get('/payments/vnpay-return', [PaymentController::class, 'vnpayReturn']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/menus', [MenuController::class, 'index']);

// Product
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/products/slug/{slug}', [ProductController::class, 'showBySlug']);
Route::get('/product-news', [ProductNewController::class, 'index']);
Route::get('/product-sales', [ProductSaleController::class, 'index']);
Route::apiResource('product-images', ProductImageController::class);
Route::apiResource('product-variants', ProductVariantController::class);
Route::apiResource('product-variant-values', ProductVariantValueController::class);
Route::apiResource('brands', BrandController::class);
Route::apiResource('post-images', PostImageController::class);

// Banner – Setting
Route::get('/banners', [BannerController::class, 'index']);
Route::get('/settings', [SettingController::class, 'index']);
Route::get('/settings/{setting}', [SettingController::class, 'show']);

// Post
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{post}', [PostController::class, 'show']);
Route::get('/posts/slug/{slug}', [PostController::class, 'showBySlug']);
Route::post('/posts/{post}/increase-view', [PostController::class, 'increaseView']);


// Review (PUBLIC VIEW)
Route::get('/reviews', [ReviewController::class, 'index']);
Route::get('/reviews/{review}', [ReviewController::class, 'show']);

/*
|--------------------------------------------------------------------------
| REVIEW (PUBLIC READ)  ✅ FIX 405
|--------------------------------------------------------------------------
*/
Route::get('/review-images', [ReviewImageController::class, 'index']);
Route::get('/review-likes', [ReviewLikeController::class, 'index']);
Route::get('/review-replies', [ReviewReplyController::class, 'index']);

// Voucher (PUBLIC VIEW)
Route::get('/vouchers', [VoucherController::class, 'index']);
Route::get('/vouchers/{voucher}', [VoucherController::class, 'show']);

/*
|--------------------------------------------------------------------------
| USER ROUTES (JWT)
|--------------------------------------------------------------------------
*/
Route::middleware('jwt.auth')->group(function () {
    Route::apiResource('users', UserController::class);
    // Cart – Order
    Route::apiResource('carts', CartController::class);
    Route::apiResource('cart-items', CartItemController::class);
    Route::delete('/cart-items/clear/{cart}', [CartItemController::class, 'clearCart']);
    Route::apiResource('orders', OrderController::class);
    Route::apiResource('order-items', OrderItemController::class);

    // Address
    Route::apiResource('addresses', AddressController::class);

    // Review (WRITE)
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);

    Route::apiResource('review-images', ReviewImageController::class)
        ->only(['store', 'destroy']);

    Route::apiResource('review-replies', ReviewReplyController::class)
        ->except(['index', 'show']);

    Route::apiResource('review-likes', ReviewLikeController::class)
        ->only(['store', 'destroy']);


    // Voucher
    // Voucher
    Route::get('/voucher-claims', [VoucherClaimController::class, 'index']);
    Route::post('/voucher-claims', [VoucherClaimController::class, 'store']);
    Route::get('/my-vouchers', [VoucherUserController::class, 'index']);


    // Post cá nhân
    Route::apiResource('posts', PostController::class)->except(['index', 'show']);
    

    // Payment
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::post('/payments', [PaymentController::class, 'store']);

    // VNPAY routes phải đứng trước /payments/{payment}


    Route::get('/payments/{payment}', [PaymentController::class, 'show']);


    // Chatbot
    Route::post('/chatbot', [ChatbotController::class, 'chat']);
});

/*
|--------------------------------------------------------------------------
| ADMIN ROUTES (JWT + CHECK ADMIN)
|--------------------------------------------------------------------------
*/
Route::middleware(['jwt.auth', CheckAdmin::class])->group(function () {


    
    Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
    Route::apiResource('topics', TopicController::class);
    Route::apiResource('menus', MenuController::class);
    Route::apiResource('contacts', ContactController::class);

    // Product
    Route::apiResource('products', ProductController::class)->except(['index', 'show']);
    Route::apiResource('product-news', ProductNewController::class)->except(['index', 'show']);
    Route::apiResource('product-sales', ProductSaleController::class)->except(['index', 'show']);

    // Voucher
    Route::apiResource('vouchers', VoucherController::class)->except(['index', 'show']);
    Route::apiResource('voucher-users', VoucherUserController::class);

    // Banner – Setting
    Route::apiResource('banners', BannerController::class)->except(['index']);
    Route::post('/settings', [SettingController::class, 'store']);
    Route::put('/settings/{setting}', [SettingController::class, 'update']);
    Route::delete('/settings/{setting}', [SettingController::class, 'destroy']);

    // Import
    Route::apiResource('imports', ImportController::class);
    Route::apiResource('import-items', ImportItemController::class);
});
