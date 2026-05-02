<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Customer;
use App\Models\Prescription;
use App\Models\Product;
use App\Models\Sale;
use App\Models\StockMovement;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'payment_status', 'from', 'to']);

        $sales = Sale::query()
            ->with(['customer', 'items.product', 'createdBy', 'updatedBy'])
            ->withCount('items')
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('invoice_no', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($query) use ($search): void {
                            $query->where('name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                        });
                });
            })
            ->when($filters['payment_status'] ?? null, fn ($query, string $status) => $query->where('payment_status', $status))
            ->when($filters['from'] ?? null, fn ($query, string $from) => $query->whereDate('sale_date', '>=', $from))
            ->when($filters['to'] ?? null, fn ($query, string $to) => $query->whereDate('sale_date', '<=', $to))
            ->latest('sale_date')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Sales/Index', [
            'sales' => $sales,
            'filters' => $filters,
            'summary' => [
                'today_total' => Sale::query()->whereDate('sale_date', today())->sum('total'),
                'today_paid' => Sale::query()->whereDate('sale_date', today())->sum('paid_amount'),
                'today_due' => Sale::query()->whereDate('sale_date', today())->sum('due_amount'),
                'today_count' => Sale::query()->whereDate('sale_date', today())->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Sales/Create', [
            'products' => Product::query()
                ->with(['category', 'medicineDetail', 'glassDetail'])
                ->where('is_active', true)
                ->where('stock_quantity', '>', 0)
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer.name' => ['nullable', 'string', 'max:255'],
            'customer.phone' => ['nullable', 'string', 'max:30'],
            'customer.age' => ['nullable', 'integer', 'min:0', 'max:150'],
            'customer.gender' => ['nullable', Rule::in(['male', 'female', 'other'])],
            'customer.address' => ['nullable', 'string'],

            'prescription.right_sph' => ['nullable', 'numeric', 'between:-30,30'],
            'prescription.right_cyl' => ['nullable', 'numeric', 'between:-30,30'],
            'prescription.right_axis' => ['nullable', 'integer', 'between:0,180'],
            'prescription.right_va' => ['nullable', 'string', 'max:30'],
            'prescription.left_sph' => ['nullable', 'numeric', 'between:-30,30'],
            'prescription.left_cyl' => ['nullable', 'numeric', 'between:-30,30'],
            'prescription.left_axis' => ['nullable', 'integer', 'between:0,180'],
            'prescription.left_va' => ['nullable', 'string', 'max:30'],
            'prescription.near_addition' => ['nullable', 'numeric', 'between:-10,10'],
            'prescription.ipd' => ['nullable', 'string', 'max:30'],
            'prescription.complaints' => ['nullable', 'string'],
            'prescription.remarks' => ['nullable', 'string'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.discount' => ['nullable', 'numeric', 'min:0'],

            'discount' => ['nullable', 'numeric', 'min:0'],
            'tax' => ['nullable', 'numeric', 'min:0'],
            'paid_amount' => ['nullable', 'numeric', 'min:0'],
            'payment_method' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);

        $sale = DB::transaction(function () use ($validated, $request): Sale {
            $customer = $this->createCustomerIfNeeded($validated['customer'] ?? []);
            $prescription = $customer ? $this->createPrescriptionIfNeeded($customer, $validated['prescription'] ?? []) : null;

            $preparedItems = [];
            $subtotal = 0;

            foreach ($validated['items'] as $item) {
                $product = Product::query()->lockForUpdate()->findOrFail($item['product_id']);
                $quantity = (int) $item['quantity'];
                $unitPrice = (float) $item['unit_price'];
                $discount = (float) ($item['discount'] ?? 0);

                if ($product->stock_quantity < $quantity) {
                    abort(422, "Not enough stock for {$product->name}. Available stock: {$product->stock_quantity}.");
                }

                $lineTotal = max(0, ($quantity * $unitPrice) - $discount);
                $subtotal += $lineTotal;

                $preparedItems[] = compact('product', 'quantity', 'unitPrice', 'discount', 'lineTotal');
            }

            $invoiceDiscount = (float) ($validated['discount'] ?? 0);
            $tax = (float) ($validated['tax'] ?? 0);
            $total = max(0, $subtotal - $invoiceDiscount + $tax);
            $paidAmount = min((float) ($validated['paid_amount'] ?? $total), $total);
            $dueAmount = max(0, $total - $paidAmount);

            $sale = Sale::query()->create([
                'invoice_no' => $this->generateInvoiceNo(),
                'customer_id' => $customer?->id,
                'prescription_id' => $prescription?->id,
                'sale_date' => now(),
                'subtotal' => $subtotal,
                'discount' => $invoiceDiscount,
                'tax' => $tax,
                'total' => $total,
                'paid_amount' => $paidAmount,
                'due_amount' => $dueAmount,
                'payment_status' => $dueAmount <= 0 ? 'paid' : ($paidAmount > 0 ? 'partial' : 'due'),
                'payment_method' => $validated['payment_method'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);

            foreach ($preparedItems as $item) {
                $product = $item['product'];
                $stockBefore = (int) $product->stock_quantity;
                $stockAfter = $stockBefore - $item['quantity'];

                $saleItem = $sale->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unitPrice'],
                    'discount' => $item['discount'],
                    'total_price' => $item['lineTotal'],
                ]);

                $product->update([
                    'stock_quantity' => $stockAfter,
                    'updated_by' => auth()->id(),
                ]);

                StockMovement::query()->create([
                    'product_id' => $product->id,
                    'movement_type' => 'stock_out',
                    'quantity' => $item['quantity'],
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockAfter,
                    'reference_type' => $saleItem::class,
                    'reference_id' => $saleItem->id,
                    'note' => 'Sold on invoice '.$sale->invoice_no,
                    'created_by' => auth()->id(),
                ]);
            }

            ActivityLog::query()->create([
                'user_id' => auth()->id(),
                'action' => 'created_sale',
                'loggable_type' => Sale::class,
                'loggable_id' => $sale->id,
                'old_values' => null,
                'new_values' => $sale->fresh(['customer', 'items'])->toArray(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return $sale;
        });

        return redirect()->route('sales.show', $sale)->with('success', 'Sale completed and stock updated successfully.');
    }

    public function show(Sale $sale): Response
    {
        $sale->load(['customer', 'prescription', 'items.product.category', 'items.product.medicineDetail', 'items.product.glassDetail', 'createdBy', 'updatedBy']);

        return Inertia::render('Sales/Show', [
            'sale' => $sale,
        ]);
    }

    public function invoice(Sale $sale): Response
    {
        $sale->load(['customer', 'prescription', 'items.product', 'createdBy', 'updatedBy']);

        return Inertia::render('Sales/Invoice', [
            'sale' => $sale,
            'shop' => [
                'name' => 'Madina Chokh Seba & Optical',
                'tagline' => 'Eye care, medicine and optical glass management',
                'phone' => '+880 1XXXXXXXXX',
                'address' => 'Shop address here',
            ],
        ]);
    }

    public function destroy(Request $request, Sale $sale): RedirectResponse
    {
        DB::transaction(function () use ($sale, $request): void {
            $sale->load('items.product');
            $oldValues = $sale->toArray();

            foreach ($sale->items as $item) {
                $product = Product::query()->lockForUpdate()->find($item->product_id);
                if (! $product) {
                    continue;
                }

                $stockBefore = (int) $product->stock_quantity;
                $stockAfter = $stockBefore + (int) $item->quantity;

                $product->update([
                    'stock_quantity' => $stockAfter,
                    'updated_by' => auth()->id(),
                ]);

                StockMovement::query()->create([
                    'product_id' => $product->id,
                    'movement_type' => 'return',
                    'quantity' => (int) $item->quantity,
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockAfter,
                    'reference_type' => $sale::class,
                    'reference_id' => $sale->id,
                    'note' => 'Sale deleted/reversed for invoice '.$sale->invoice_no,
                    'created_by' => auth()->id(),
                ]);
            }

            $sale->update(['updated_by' => auth()->id()]);
            $sale->delete();

            ActivityLog::query()->create([
                'user_id' => auth()->id(),
                'action' => 'deleted_sale',
                'loggable_type' => Sale::class,
                'loggable_id' => $sale->id,
                'old_values' => $oldValues,
                'new_values' => null,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        });

        return redirect()->route('sales.index')->with('success', 'Sale deleted and stock returned successfully.');
    }

    private function createCustomerIfNeeded(array $data): ?Customer
    {
        $hasCustomer = collect($data)->filter(fn ($value) => filled($value))->isNotEmpty();

        if (! $hasCustomer) {
            return null;
        }

        if (! empty($data['phone'])) {
            $existing = Customer::query()->where('phone', $data['phone'])->first();
            if ($existing) {
                $existing->update([
                    'name' => $data['name'] ?? $existing->name,
                    'age' => $data['age'] ?? $existing->age,
                    'gender' => $data['gender'] ?? $existing->gender,
                    'address' => $data['address'] ?? $existing->address,
                    'updated_by' => auth()->id(),
                ]);

                return $existing;
            }
        }

        return Customer::query()->create([
            'name' => $data['name'] ?? null,
            'phone' => $data['phone'] ?? null,
            'age' => $data['age'] ?? null,
            'gender' => $data['gender'] ?? null,
            'address' => $data['address'] ?? null,
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);
    }

    private function createPrescriptionIfNeeded(Customer $customer, array $data): ?Prescription
    {
        $hasPrescription = collect($data)->filter(fn ($value) => filled($value))->isNotEmpty();

        if (! $hasPrescription) {
            return null;
        }

        return Prescription::query()->create([
            ...$data,
            'customer_id' => $customer->id,
            'prescription_date' => Carbon::today(),
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);
    }

    private function generateInvoiceNo(): string
    {
        $prefix = 'INV-'.now()->format('Ymd');
        $count = Sale::query()->where('invoice_no', 'like', $prefix.'%')->count() + 1;

        return $prefix.'-'.str_pad((string) $count, 4, '0', STR_PAD_LEFT);
    }
}
