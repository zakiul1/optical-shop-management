<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\StockMovement;
use App\Models\Sale;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $today = Carbon::today();
        $nextMonth = Carbon::today()->addMonth();

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_products' => Product::query()->count(),
                'medicine_products' => Product::query()->medicine()->count(),
                'glass_products' => Product::query()->glass()->count(),
                'low_stock_products' => Product::query()->lowStock()->count(),
                'expiring_medicines' => Product::query()
                    ->medicine()
                    ->whereHas('medicineDetail', fn ($query) => $query->whereBetween('expire_date', [$today, $nextMonth]))
                    ->count(),
                'today_sales' => Sale::query()->whereDate('sale_date', $today)->sum('total'),
                'monthly_sales' => Sale::query()->whereBetween('sale_date', [Carbon::today()->startOfMonth(), Carbon::today()->endOfMonth()])->sum('total'),
                'today_purchases' => Purchase::query()->whereDate('purchase_date', $today)->sum('total'),
                'monthly_purchases' => Purchase::query()->whereBetween('purchase_date', [Carbon::today()->startOfMonth(), Carbon::today()->endOfMonth()])->sum('total'),
            ],
            'lowStockProducts' => Product::query()
                ->with('category')
                ->lowStock()
                ->latest()
                ->take(8)
                ->get(),
            'expiringMedicines' => Product::query()
                ->with(['category', 'medicineDetail'])
                ->medicine()
                ->whereHas('medicineDetail', fn ($query) => $query->whereBetween('expire_date', [$today, $nextMonth]))
                ->orderBy(
                    \App\Models\MedicineDetail::select('expire_date')
                        ->whereColumn('medicine_details.product_id', 'products.id')
                        ->limit(1)
                )
                ->take(8)
                ->get(),
            'recentStockMovements' => StockMovement::query()
                ->with(['product', 'createdBy'])
                ->latest()
                ->take(10)
                ->get(),
            'recentSales' => Sale::query()
                ->with(['customer', 'createdBy'])
                ->latest('sale_date')
                ->take(8)
                ->get(),
            'recentPurchases' => Purchase::query()
                ->with(['supplier', 'createdBy'])
                ->latest('purchase_date')
                ->take(8)
                ->get(),
        ]);
    }
}
