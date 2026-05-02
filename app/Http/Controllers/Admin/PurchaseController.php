<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\StockMovement;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'payment_status', 'from', 'to']);

        $purchases = Purchase::query()
            ->with(['supplier', 'items.product', 'createdBy', 'updatedBy'])
            ->withCount('items')
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('purchase_no', 'like', "%{$search}%")
                        ->orWhereHas('supplier', function ($query) use ($search): void {
                            $query->where('name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                        });
                });
            })
            ->when($filters['payment_status'] ?? null, fn ($query, string $status) => $query->where('payment_status', $status))
            ->when($filters['from'] ?? null, fn ($query, string $from) => $query->whereDate('purchase_date', '>=', $from))
            ->when($filters['to'] ?? null, fn ($query, string $to) => $query->whereDate('purchase_date', '<=', $to))
            ->latest('purchase_date')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Purchases/Index', [
            'purchases' => $purchases,
            'filters' => $filters,
            'summary' => [
                'today_total' => Purchase::query()->whereDate('purchase_date', today())->sum('total'),
                'today_paid' => Purchase::query()->whereDate('purchase_date', today())->sum('paid_amount'),
                'today_due' => Purchase::query()->whereDate('purchase_date', today())->sum('due_amount'),
                'today_count' => Purchase::query()->whereDate('purchase_date', today())->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Purchases/Create', [
            'products' => Product::query()->with(['category', 'medicineDetail'])->where('is_active', true)->orderBy('name')->get(),
            'suppliers' => Supplier::query()->where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'purchase_date' => ['required', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.manufacture_date' => ['nullable', 'date'],
            'items.*.expire_date' => ['nullable', 'date'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'paid_amount' => ['nullable', 'numeric', 'min:0'],
            'payment_method' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);

        $purchase = DB::transaction(function () use ($validated, $request): Purchase {
            $preparedItems = [];
            $subtotal = 0;

            foreach ($validated['items'] as $item) {
                $product = Product::query()->lockForUpdate()->findOrFail($item['product_id']);
                $quantity = (int) $item['quantity'];
                $unitPrice = (float) $item['unit_price'];
                $lineTotal = $quantity * $unitPrice;
                $subtotal += $lineTotal;
                $preparedItems[] = compact('product', 'quantity', 'unitPrice', 'lineTotal', 'item');
            }

            $discount = (float) ($validated['discount'] ?? 0);
            $total = max(0, $subtotal - $discount);
            $paidAmount = min((float) ($validated['paid_amount'] ?? 0), $total);
            $dueAmount = max(0, $total - $paidAmount);

            $purchase = Purchase::query()->create([
                'purchase_no' => $this->generatePurchaseNo(),
                'supplier_id' => $validated['supplier_id'] ?? null,
                'purchase_date' => $validated['purchase_date'],
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $total,
                'paid_amount' => $paidAmount,
                'due_amount' => $dueAmount,
                'payment_status' => $dueAmount <= 0 ? 'paid' : ($paidAmount > 0 ? 'partial' : 'due'),
                'payment_method' => $validated['payment_method'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);

            foreach ($preparedItems as $prepared) {
                $product = $prepared['product'];
                $stockBefore = (int) $product->stock_quantity;
                $stockAfter = $stockBefore + $prepared['quantity'];

                $purchaseItem = $purchase->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $prepared['quantity'],
                    'unit_price' => $prepared['unitPrice'],
                    'total_price' => $prepared['lineTotal'],
                    'manufacture_date' => $prepared['item']['manufacture_date'] ?? null,
                    'expire_date' => $prepared['item']['expire_date'] ?? null,
                ]);

                $product->update([
                    'purchase_price' => $prepared['unitPrice'],
                    'stock_quantity' => $stockAfter,
                    'updated_by' => auth()->id(),
                ]);

                if ($product->product_type === 'medicine' && (! empty($prepared['item']['manufacture_date']) || ! empty($prepared['item']['expire_date']))) {
                    $product->medicineDetail()->updateOrCreate(['product_id' => $product->id], [
                        'manufacture_date' => $prepared['item']['manufacture_date'] ?? $product->medicineDetail?->manufacture_date,
                        'expire_date' => $prepared['item']['expire_date'] ?? $product->medicineDetail?->expire_date,
                    ]);
                }

                StockMovement::query()->create([
                    'product_id' => $product->id,
                    'movement_type' => 'stock_in',
                    'quantity' => $prepared['quantity'],
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockAfter,
                    'reference_type' => $purchaseItem::class,
                    'reference_id' => $purchaseItem->id,
                    'note' => 'Purchased on '.$purchase->purchase_no,
                    'created_by' => auth()->id(),
                ]);
            }

            ActivityLog::query()->create([
                'user_id' => auth()->id(),
                'action' => 'created_purchase',
                'loggable_type' => Purchase::class,
                'loggable_id' => $purchase->id,
                'old_values' => null,
                'new_values' => $purchase->fresh(['supplier', 'items'])->toArray(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return $purchase;
        });

        return redirect()->route('purchases.show', $purchase)->with('success', 'Purchase saved and stock-in completed successfully.');
    }

    public function show(Purchase $purchase): Response
    {
        $purchase->load(['supplier', 'items.product.category', 'items.product.medicineDetail', 'createdBy', 'updatedBy']);

        return Inertia::render('Purchases/Show', [
            'purchase' => $purchase,
        ]);
    }

    public function destroy(Request $request, Purchase $purchase): RedirectResponse
    {
        DB::transaction(function () use ($purchase, $request): void {
            $purchase->load('items.product');
            $oldValues = $purchase->toArray();

            foreach ($purchase->items as $item) {
                $product = Product::query()->lockForUpdate()->find($item->product_id);
                if (! $product) {
                    continue;
                }

                if ($product->stock_quantity < $item->quantity) {
                    abort(422, "Cannot delete purchase {$purchase->purchase_no}; {$product->name} stock is lower than the purchased quantity.");
                }

                $stockBefore = (int) $product->stock_quantity;
                $stockAfter = $stockBefore - (int) $item->quantity;

                $product->update([
                    'stock_quantity' => $stockAfter,
                    'updated_by' => auth()->id(),
                ]);

                StockMovement::query()->create([
                    'product_id' => $product->id,
                    'movement_type' => 'adjustment',
                    'quantity' => (int) $item->quantity,
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockAfter,
                    'reference_type' => $purchase::class,
                    'reference_id' => $purchase->id,
                    'note' => 'Purchase deleted/reversed for '.$purchase->purchase_no,
                    'created_by' => auth()->id(),
                ]);
            }

            $purchase->update(['updated_by' => auth()->id()]);
            $purchase->delete();

            ActivityLog::query()->create([
                'user_id' => auth()->id(),
                'action' => 'deleted_purchase',
                'loggable_type' => Purchase::class,
                'loggable_id' => $purchase->id,
                'old_values' => $oldValues,
                'new_values' => null,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        });

        return redirect()->route('purchases.index')->with('success', 'Purchase deleted and stock reversed successfully.');
    }

    private function generatePurchaseNo(): string
    {
        $prefix = 'PUR-'.now()->format('Ymd');
        $count = Purchase::query()->where('purchase_no', 'like', $prefix.'%')->count() + 1;

        return $prefix.'-'.str_pad((string) $count, 4, '0', STR_PAD_LEFT);
    }
}
