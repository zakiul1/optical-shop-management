<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        [$startDate, $endDate, $filters] = $this->resolveDateRange($request);

        return Inertia::render('Reports/Index', [
            'filters' => $filters,
            'summary' => $this->salesSummary($startDate, $endDate),
            'salesByPeriod' => $this->salesByPeriod($startDate, $endDate, $filters['report_type']),
            'sales' => $this->salesList($startDate, $endDate),
            'topProducts' => $this->topProducts($startDate, $endDate),
            'paymentBreakdown' => $this->paymentBreakdown($startDate, $endDate),
            'lowStockProducts' => $this->lowStockProducts(),
            'expiryReports' => $this->expiryReports(),
            'stockMovements' => $this->stockMovements($startDate, $endDate),
        ]);
    }

    public function print(Request $request): Response
    {
        [$startDate, $endDate, $filters] = $this->resolveDateRange($request);

        return Inertia::render('Reports/Print', [
            'filters' => $filters,
            'summary' => $this->salesSummary($startDate, $endDate),
            'salesByPeriod' => $this->salesByPeriod($startDate, $endDate, $filters['report_type']),
            'sales' => $this->salesList($startDate, $endDate, 500),
            'topProducts' => $this->topProducts($startDate, $endDate, 20),
            'paymentBreakdown' => $this->paymentBreakdown($startDate, $endDate),
            'lowStockProducts' => $this->lowStockProducts(100),
            'expiryReports' => $this->expiryReports(100),
            'stockMovements' => $this->stockMovements($startDate, $endDate, 100),
            'shop' => [
                'name' => 'Madina Chokh Seba & Optical',
                'tagline' => 'Eye care, medicine and optical glass management',
                'phone' => '+880 1XXXXXXXXX',
                'address' => 'Shop address here',
            ],
        ]);
    }

    private function resolveDateRange(Request $request): array
    {
        $reportType = $request->string('report_type', 'daily')->toString();
        $reportType = in_array($reportType, ['daily', 'monthly', 'yearly', 'custom'], true) ? $reportType : 'daily';

        $today = Carbon::today();

        if ($reportType === 'monthly') {
            $month = $request->string('month', $today->format('Y-m'))->toString();
            $start = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
            $end = $start->copy()->endOfMonth();
        } elseif ($reportType === 'yearly') {
            $year = (int) $request->input('year', $today->year);
            $start = Carbon::create($year, 1, 1)->startOfYear();
            $end = $start->copy()->endOfYear();
        } elseif ($reportType === 'custom') {
            $start = $request->filled('start_date') ? Carbon::parse($request->input('start_date'))->startOfDay() : $today->copy()->startOfMonth();
            $end = $request->filled('end_date') ? Carbon::parse($request->input('end_date'))->endOfDay() : $today->copy()->endOfDay();
        } else {
            $date = $request->filled('date') ? Carbon::parse($request->input('date')) : $today;
            $start = $date->copy()->startOfDay();
            $end = $date->copy()->endOfDay();
        }

        if ($start->greaterThan($end)) {
            [$start, $end] = [$end->copy()->startOfDay(), $start->copy()->endOfDay()];
        }

        return [
            $start,
            $end,
            [
                'report_type' => $reportType,
                'date' => $start->format('Y-m-d'),
                'month' => $start->format('Y-m'),
                'year' => $start->format('Y'),
                'start_date' => $start->format('Y-m-d'),
                'end_date' => $end->format('Y-m-d'),
                'label' => $start->isSameDay($end)
                    ? $start->format('d M Y')
                    : $start->format('d M Y').' - '.$end->format('d M Y'),
            ],
        ];
    }

    private function salesQuery(Carbon $startDate, Carbon $endDate): Builder
    {
        return Sale::query()->whereBetween('sale_date', [$startDate, $endDate]);
    }

    private function salesSummary(Carbon $startDate, Carbon $endDate): array
    {
        $summary = $this->salesQuery($startDate, $endDate)
            ->selectRaw('COUNT(*) as invoice_count')
            ->selectRaw('COALESCE(SUM(subtotal), 0) as subtotal')
            ->selectRaw('COALESCE(SUM(discount), 0) as discount')
            ->selectRaw('COALESCE(SUM(tax), 0) as tax')
            ->selectRaw('COALESCE(SUM(total), 0) as total')
            ->selectRaw('COALESCE(SUM(paid_amount), 0) as paid')
            ->selectRaw('COALESCE(SUM(due_amount), 0) as due')
            ->first();

        $itemsSold = SaleItem::query()
            ->whereHas('sale', fn (Builder $query) => $query->whereBetween('sale_date', [$startDate, $endDate]))
            ->sum('quantity');

        $totalPurchaseCost = SaleItem::query()
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->whereNull('sales.deleted_at')
            ->whereBetween('sales.sale_date', [$startDate, $endDate])
            ->selectRaw('COALESCE(SUM(sale_items.quantity * products.purchase_price), 0) as total_cost')
            ->value('total_cost');

        $total = (float) $summary->total;

        return [
            'invoice_count' => (int) $summary->invoice_count,
            'items_sold' => (int) $itemsSold,
            'subtotal' => (float) $summary->subtotal,
            'discount' => (float) $summary->discount,
            'tax' => (float) $summary->tax,
            'total' => $total,
            'paid' => (float) $summary->paid,
            'due' => (float) $summary->due,
            'purchase_cost' => (float) $totalPurchaseCost,
            'estimated_profit' => $total - (float) $totalPurchaseCost,
            'average_invoice' => (int) $summary->invoice_count > 0 ? $total / (int) $summary->invoice_count : 0,
        ];
    }

    private function salesByPeriod(Carbon $startDate, Carbon $endDate, string $reportType): array
    {
        $format = match ($reportType) {
            'yearly' => '%Y-%m',
            'monthly', 'custom' => '%Y-%m-%d',
            default => '%Y-%m-%d %H:00',
        };

        return $this->salesQuery($startDate, $endDate)
            ->selectRaw("DATE_FORMAT(sale_date, '{$format}') as period")
            ->selectRaw('COUNT(*) as invoice_count')
            ->selectRaw('COALESCE(SUM(total), 0) as total')
            ->selectRaw('COALESCE(SUM(paid_amount), 0) as paid')
            ->selectRaw('COALESCE(SUM(due_amount), 0) as due')
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->toArray();
    }

    private function salesList(Carbon $startDate, Carbon $endDate, int $limit = 100): array
    {
        return $this->salesQuery($startDate, $endDate)
            ->with(['customer'])
            ->withCount('items')
            ->latest('sale_date')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    private function topProducts(Carbon $startDate, Carbon $endDate, int $limit = 10): array
    {
        return SaleItem::query()
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->whereNull('sales.deleted_at')
            ->whereBetween('sales.sale_date', [$startDate, $endDate])
            ->select('products.id', 'products.name', 'products.product_type', 'products.sku')
            ->selectRaw('COALESCE(SUM(sale_items.quantity), 0) as quantity_sold')
            ->selectRaw('COALESCE(SUM(sale_items.total_price), 0) as sales_amount')
            ->groupBy('products.id', 'products.name', 'products.product_type', 'products.sku')
            ->orderByDesc('quantity_sold')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    private function paymentBreakdown(Carbon $startDate, Carbon $endDate): array
    {
        return $this->salesQuery($startDate, $endDate)
            ->selectRaw("COALESCE(payment_method, 'Not set') as payment_method")
            ->selectRaw('COUNT(*) as invoice_count')
            ->selectRaw('COALESCE(SUM(total), 0) as total')
            ->selectRaw('COALESCE(SUM(paid_amount), 0) as paid')
            ->groupBy('payment_method')
            ->orderByDesc('paid')
            ->get()
            ->toArray();
    }

    private function lowStockProducts(int $limit = 30): array
    {
        return Product::query()
            ->with('category')
            ->lowStock()
            ->orderBy('stock_quantity')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    private function expiryReports(int $limit = 30): array
    {
        $today = Carbon::today();
        $withinOneMonth = $today->copy()->addMonth();

        return [
            'expired' => Product::query()
                ->medicine()
                ->with(['category', 'medicineDetail'])
                ->whereHas('medicineDetail', fn (Builder $query) => $query->whereNotNull('expire_date')->whereDate('expire_date', '<', $today))
                ->limit($limit)
                ->get()
                ->toArray(),
            'expiring_soon' => Product::query()
                ->medicine()
                ->with(['category', 'medicineDetail'])
                ->whereHas('medicineDetail', fn (Builder $query) => $query->whereBetween('expire_date', [$today, $withinOneMonth]))
                ->limit($limit)
                ->get()
                ->toArray(),
        ];
    }

    private function stockMovements(Carbon $startDate, Carbon $endDate, int $limit = 50): array
    {
        return StockMovement::query()
            ->with(['product'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->latest()
            ->limit($limit)
            ->get()
            ->toArray();
    }
}
