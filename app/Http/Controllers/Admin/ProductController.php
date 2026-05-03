<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'type', 'stock']);

        $products = Product::query()
            ->with(['category', 'supplier', 'medicineDetail', 'glassDetail', 'images', 'createdBy', 'updatedBy'])
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('brand', 'like', "%{$search}%");
                });
            })
            ->when($filters['type'] ?? null, fn ($query, string $type) => $query->where('product_type', $type))
            ->when(($filters['stock'] ?? null) === 'low', fn ($query) => $query->lowStock())
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'filters' => $filters,
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Products/Create', [
            'categories' => Category::query()->where('is_active', true)->orderBy('name')->get(),
            'suppliers' => Supplier::query()->where('is_active', true)->orderBy('name')->get(),
            'defaultType' => $request->query('type', 'medicine'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);
        $stockQuantity = (int) ($data['product']['stock_quantity'] ?? 0);

        $product = Product::query()->create([
            ...$data['product'],
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);

        $this->syncDetails($product, $data);
        $this->syncImages($request, $product);

        if ($stockQuantity > 0) {
            StockMovement::query()->create([
                'product_id' => $product->id,
                'movement_type' => 'stock_in',
                'quantity' => $stockQuantity,
                'stock_before' => 0,
                'stock_after' => $stockQuantity,
                'note' => 'Initial stock added during product creation.',
                'created_by' => auth()->id(),
            ]);
        }

        $this->logActivity('created', $product, null, $product->fresh(['medicineDetail', 'glassDetail', 'images'])->toArray(), $request);

        return redirect()->route('products.index')->with('success', 'Product created successfully.');
    }

    public function edit(Product $product): Response
    {
        $product->load(['category', 'supplier', 'medicineDetail', 'glassDetail', 'images', 'createdBy', 'updatedBy']);

        return Inertia::render('Products/Edit', [
            'product' => $product,
            'categories' => Category::query()->where('is_active', true)->orderBy('name')->get(),
            'suppliers' => Supplier::query()->where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $oldValues = $product->load(['medicineDetail', 'glassDetail', 'images'])->toArray();
        $oldStock = (int) $product->stock_quantity;
        $data = $this->validatedData($request, $product);
        $newStock = (int) ($data['product']['stock_quantity'] ?? 0);

        $product->update([
            ...$data['product'],
            'updated_by' => auth()->id(),
        ]);

        $this->syncDetails($product, $data);
        $this->syncImages($request, $product);

        if ($newStock !== $oldStock) {
            StockMovement::query()->create([
                'product_id' => $product->id,
                'movement_type' => $newStock > $oldStock ? 'stock_in' : 'adjustment',
                'quantity' => abs($newStock - $oldStock),
                'stock_before' => $oldStock,
                'stock_after' => $newStock,
                'note' => 'Stock adjusted from product edit form.',
                'created_by' => auth()->id(),
            ]);
        }

        $this->logActivity('updated', $product, $oldValues, $product->fresh(['medicineDetail', 'glassDetail', 'images'])->toArray(), $request);

        return redirect()->route('products.index')->with('success', 'Product updated successfully.');
    }

    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $oldValues = $product->load(['medicineDetail', 'glassDetail', 'images'])->toArray();
        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->path);
        }
        $product->update(['updated_by' => auth()->id()]);
        $product->delete();

        $this->logActivity('deleted', $product, $oldValues, null, $request);

        return redirect()->route('products.index')->with('success', 'Product deleted successfully.');
    }

    private function validatedData(Request $request, ?Product $product = null): array
    {
        $validated = $request->validate([
            'product_type' => ['required', Rule::in(['medicine', 'glass'])],
            'category_id' => ['nullable', 'exists:categories,id'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:255', Rule::unique('products', 'sku')->ignore($product?->id)],
            'barcode' => ['nullable', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['required', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'minimum_stock_alert' => ['required', 'integer', 'min:0'],
            'unit' => ['required', 'string', 'max:50'],
            'is_active' => ['boolean'],
            'images' => ['nullable', 'array', 'max:8'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'remove_image_ids' => ['nullable', 'array'],
            'remove_image_ids.*' => ['integer', 'exists:product_images,id'],
            'generic_name' => ['nullable', 'string', 'max:255'],
            'strength' => ['nullable', 'string', 'max:255'],
            'dosage_form' => ['nullable', 'string', 'max:255'],
            'manufacturer' => ['nullable', 'string', 'max:255'],
            'batch_no' => ['nullable', 'string', 'max:255'],
            'manufacture_date' => ['nullable', 'date'],
            'expire_date' => ['nullable', 'date'],
            'storage_note' => ['nullable', 'string'],
            'glass_type' => ['nullable', Rule::in(['frame', 'lens', 'sunglass', 'reading_glass', 'contact_lens'])],
            'model_no' => ['nullable', 'string', 'max:255'],
            'frame_material' => ['nullable', 'string', 'max:255'],
            'frame_color' => ['nullable', 'string', 'max:255'],
            'size' => ['nullable', 'string', 'max:255'],
            'lens_power' => ['nullable', 'string', 'max:255'],
            'sph' => ['nullable', 'numeric'],
            'cyl' => ['nullable', 'numeric'],
            'axis' => ['nullable', 'integer', 'min:0', 'max:180'],
            'addition' => ['nullable', 'numeric'],
            'lens_type' => ['nullable', 'string', 'max:255'],
            'blue_cut' => ['boolean'],
            'photochromic' => ['boolean'],
            'anti_reflection' => ['boolean'],
            'high_index' => ['boolean'],
            'show_on_website' => ['boolean'],
            'is_featured' => ['boolean'],
            'website_short_description' => ['nullable', 'string'],
            'website_short_description_bn' => ['nullable', 'string'],
        ]);

        return [
            'product' => collect($validated)->only([
                'category_id', 'supplier_id', 'product_type', 'name', 'sku', 'barcode', 'brand', 'description',
                'purchase_price', 'sale_price', 'stock_quantity', 'minimum_stock_alert', 'unit', 'is_active',
                'show_on_website', 'is_featured', 'website_short_description', 'website_short_description_bn',
            ])->merge([
                'is_active' => $request->boolean('is_active', true),
                'show_on_website' => $request->boolean('show_on_website'),
                'is_featured' => $request->boolean('is_featured'),
            ])->toArray(),
            'medicine' => collect($validated)->only([
                'generic_name', 'strength', 'dosage_form', 'manufacturer', 'batch_no', 'manufacture_date', 'expire_date', 'storage_note',
            ])->toArray(),
            'glass' => collect($validated)->only([
                'glass_type', 'model_no', 'frame_material', 'frame_color', 'size', 'lens_power', 'sph', 'cyl', 'axis', 'addition',
                'lens_type', 'blue_cut', 'photochromic', 'anti_reflection', 'high_index',
            ])->merge([
                'glass_type' => $validated['glass_type'] ?? 'frame',
                'blue_cut' => $request->boolean('blue_cut'),
                'photochromic' => $request->boolean('photochromic'),
                'anti_reflection' => $request->boolean('anti_reflection'),
                'high_index' => $request->boolean('high_index'),
            ])->toArray(),
        ];
    }

    private function syncDetails(Product $product, array $data): void
    {
        if ($product->product_type === 'medicine') {
            $product->medicineDetail()->updateOrCreate(['product_id' => $product->id], $data['medicine']);
            $product->glassDetail()->delete();
            return;
        }

        $product->glassDetail()->updateOrCreate(['product_id' => $product->id], $data['glass']);
        $product->medicineDetail()->delete();
    }

    private function syncImages(Request $request, Product $product): void
    {
        $removeIds = collect($request->input('remove_image_ids', []))->filter()->values();
        if ($removeIds->isNotEmpty()) {
            $product->images()->whereIn('id', $removeIds)->get()->each(function ($image): void {
                Storage::disk('public')->delete($image->path);
                $image->delete();
            });
        }

        foreach ($request->file('images', []) as $index => $file) {
            $path = $file->store('products', 'public');
            $product->images()->create([
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'sort_order' => (int) $product->images()->count() + $index,
            ]);
        }
    }

    private function logActivity(string $action, Product $product, ?array $oldValues, ?array $newValues, Request $request): void
    {
        ActivityLog::query()->create([
            'user_id' => auth()->id(),
            'action' => "product_{$action}",
            'loggable_type' => Product::class,
            'loggable_id' => $product->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}
