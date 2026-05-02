<?php

namespace App\Http\Middleware;

use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => fn () => $request->user() ? array_merge($request->user()->only(['id', 'name', 'email', 'phone', 'photo_path', 'role', 'is_active']), ['photo_url' => $request->user()->photo_path ? Storage::url($request->user()->photo_path) : null]) : null,
            ],
            'locale' => fn () => $request->session()->get('locale', 'en'),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'systemAlerts' => fn () => $request->user() ? [
                'low_stock_count' => Product::query()->lowStock()->count(),
                'expiring_medicine_count' => Product::query()
                    ->medicine()
                    ->whereHas('medicineDetail', fn ($query) => $query->whereBetween('expire_date', [Carbon::today(), Carbon::today()->addMonth()]))
                    ->count(),
                'expired_medicine_count' => Product::query()
                    ->medicine()
                    ->whereHas('medicineDetail', fn ($query) => $query->whereDate('expire_date', '<', Carbon::today()))
                    ->count(),
            ] : [
                'low_stock_count' => 0,
                'expiring_medicine_count' => 0,
                'expired_medicine_count' => 0,
            ],
        ];
    }
}
