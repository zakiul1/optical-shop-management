<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'status']);

        $suppliers = Supplier::query()
            ->with(['createdBy', 'updatedBy'])
            ->withCount(['products', 'purchases'])
            ->withSum('purchases as total_purchase_amount', 'total')
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when(($filters['status'] ?? null) === 'active', fn ($query) => $query->where('is_active', true))
            ->when(($filters['status'] ?? null) === 'inactive', fn ($query) => $query->where('is_active', false))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Suppliers/Index', [
            'suppliers' => $suppliers,
            'filters' => $filters,
            'summary' => [
                'total' => Supplier::query()->count(),
                'active' => Supplier::query()->where('is_active', true)->count(),
                'inactive' => Supplier::query()->where('is_active', false)->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);

        $supplier = Supplier::query()->create([
            ...$data,
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);

        $this->logActivity('created_supplier', $supplier, null, $supplier->toArray(), $request);

        return redirect()->route('suppliers.index')->with('success', 'Supplier saved successfully.');
    }

    public function update(Request $request, Supplier $supplier): RedirectResponse
    {
        $oldValues = $supplier->toArray();
        $data = $this->validatedData($request);

        $supplier->update([
            ...$data,
            'updated_by' => auth()->id(),
        ]);

        $this->logActivity('updated_supplier', $supplier, $oldValues, $supplier->fresh()->toArray(), $request);

        return redirect()->route('suppliers.index')->with('success', 'Supplier updated successfully.');
    }

    public function destroy(Request $request, Supplier $supplier): RedirectResponse
    {
        if ($supplier->products()->exists() || $supplier->purchases()->exists()) {
            return back()->with('error', 'This supplier has products or purchases. Mark inactive instead of deleting.');
        }

        $oldValues = $supplier->toArray();
        $supplier->update(['updated_by' => auth()->id()]);
        $supplier->delete();

        $this->logActivity('deleted_supplier', $supplier, $oldValues, null, $request);

        return redirect()->route('suppliers.index')->with('success', 'Supplier deleted successfully.');
    }

    private function validatedData(Request $request): array
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        return [
            ...$validated,
            'is_active' => $request->boolean('is_active', true),
        ];
    }

    private function logActivity(string $action, Supplier $supplier, ?array $oldValues, ?array $newValues, Request $request): void
    {
        ActivityLog::query()->create([
            'user_id' => auth()->id(),
            'action' => $action,
            'loggable_type' => Supplier::class,
            'loggable_id' => $supplier->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}
