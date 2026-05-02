<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StockAdjustmentController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'type']);

        $movements = StockMovement::query()
            ->with(['product.category', 'createdBy'])
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $query->whereHas('product', function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($filters['type'] ?? null, fn ($query, string $type) => $query->where('movement_type', $type))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('StockAdjustments/Index', [
            'movements' => $movements,
            'filters' => $filters,
            'products' => Product::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'sku', 'stock_quantity', 'unit']),
            'summary' => [
                'stock_in' => StockMovement::query()->where('movement_type', 'stock_in')->whereDate('created_at', today())->sum('quantity'),
                'stock_out' => StockMovement::query()->where('movement_type', 'stock_out')->whereDate('created_at', today())->sum('quantity'),
                'adjustment' => StockMovement::query()->where('movement_type', 'adjustment')->whereDate('created_at', today())->sum('quantity'),
                'returns' => StockMovement::query()->where('movement_type', 'return')->whereDate('created_at', today())->sum('quantity'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'adjustment_type' => ['required', Rule::in(['increase', 'decrease', 'set'])],
            'quantity' => ['required', 'integer', 'min:0'],
            'note' => ['required', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($validated, $request): void {
            $product = Product::query()->lockForUpdate()->findOrFail($validated['product_id']);
            $stockBefore = (int) $product->stock_quantity;
            $quantity = (int) $validated['quantity'];

            $stockAfter = match ($validated['adjustment_type']) {
                'increase' => $stockBefore + $quantity,
                'decrease' => max(0, $stockBefore - $quantity),
                default => $quantity,
            };

            $product->update([
                'stock_quantity' => $stockAfter,
                'updated_by' => auth()->id(),
            ]);

            $movementQuantity = abs($stockAfter - $stockBefore);

            StockMovement::query()->create([
                'product_id' => $product->id,
                'movement_type' => 'adjustment',
                'quantity' => $movementQuantity,
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'note' => $validated['note'].' (Manual '.$validated['adjustment_type'].')',
                'created_by' => auth()->id(),
            ]);

            ActivityLog::query()->create([
                'user_id' => auth()->id(),
                'action' => 'manual_stock_adjustment',
                'loggable_type' => Product::class,
                'loggable_id' => $product->id,
                'old_values' => ['stock_quantity' => $stockBefore],
                'new_values' => ['stock_quantity' => $stockAfter, 'note' => $validated['note']],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        });

        return redirect()->route('stock-adjustments.index')->with('success', 'Stock adjusted successfully.');
    }
}
