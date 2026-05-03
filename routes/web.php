<?php

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\PurchaseController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SaleController;
use App\Http\Controllers\Admin\StockAdjustmentController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\Admin\Website\GalleryController;
use App\Http\Controllers\Admin\Website\HeroSlideController;
use App\Http\Controllers\Admin\Website\InquiryController;
use App\Http\Controllers\Admin\Website\TestimonialController;
use App\Http\Controllers\Admin\Website\WebsiteDashboardController;
use App\Http\Controllers\Admin\Website\WebsiteServiceController;
use App\Http\Controllers\Admin\Website\WebsiteSettingController;
use App\Http\Controllers\Public\WebsiteController as PublicWebsiteController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function (): void {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
});

Route::post('locale', LocaleController::class)->name('locale.switch');

Route::get('/', [PublicWebsiteController::class, 'home'])->name('website.home');
Route::get('/home', fn () => redirect('/'));
Route::get('/about', [PublicWebsiteController::class, 'about'])->name('website.about');
Route::get('/services', [PublicWebsiteController::class, 'services'])->name('website.services');
Route::get('/collections', [PublicWebsiteController::class, 'products'])->name('website.products');
Route::get('/gallery', [PublicWebsiteController::class, 'gallery'])->name('website.gallery');
Route::get('/contact', [PublicWebsiteController::class, 'contact'])->name('website.contact');
Route::post('/contact', [PublicWebsiteController::class, 'storeContact'])->name('website.contact.store');
Route::post('/appointments', [PublicWebsiteController::class, 'storeAppointment'])->name('website.appointments.store');

Route::middleware(['auth', 'active'])->group(function (): void {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::redirect('/shop-admin', '/shop-admin/dashboard');
    Route::prefix('shop-admin')->group(function (): void {
        Route::get('/dashboard', DashboardController::class)->name('dashboard');
        Route::resource('products', ProductController::class)->except(['show']);
        Route::resource('categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('suppliers', SupplierController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('purchases', PurchaseController::class)->only(['index', 'create', 'store', 'show', 'destroy']);
        Route::resource('stock-adjustments', StockAdjustmentController::class)->only(['index', 'store']);
        Route::get('sales/{sale}/invoice', [SaleController::class, 'invoice'])->name('sales.invoice');
        Route::resource('sales', SaleController::class)->except(['edit', 'update']);
        Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('reports/print', [ReportController::class, 'print'])->name('reports.print');

        Route::middleware('admin')->group(function (): void {
            Route::resource('users', UserController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::get('activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
        });
    });

    Route::prefix('website-admin')->name('website-admin.')->group(function (): void {
        Route::get('/', WebsiteDashboardController::class)->name('dashboard');
        Route::get('settings', [WebsiteSettingController::class, 'edit'])->name('settings.edit');
        Route::post('settings', [WebsiteSettingController::class, 'update'])->name('settings.update');
        Route::resource('hero-slides', HeroSlideController::class)->only(['index','store','update','destroy']);
        Route::resource('services', WebsiteServiceController::class)->only(['index','store','update','destroy']);
        Route::resource('gallery', GalleryController::class)->only(['index','store','update','destroy'])->parameters(['gallery' => 'gallery']);
        Route::resource('testimonials', TestimonialController::class)->only(['index','store','update','destroy'])->parameters(['testimonials' => 'testimonial']);
        Route::get('messages', [InquiryController::class, 'messages'])->name('messages.index');
        Route::put('messages/{message}', [InquiryController::class, 'updateMessage'])->name('messages.update');
        Route::get('appointments', [InquiryController::class, 'appointments'])->name('appointments.index');
        Route::put('appointments/{appointment}', [InquiryController::class, 'updateAppointment'])->name('appointments.update');
    });

});
