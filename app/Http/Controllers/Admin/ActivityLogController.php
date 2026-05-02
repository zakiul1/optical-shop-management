<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'action', 'user_id', 'date_from', 'date_to']);

        $logs = ActivityLog::query()
            ->with('user:id,name,email,role')
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('action', 'like', "%{$search}%")
                        ->orWhere('loggable_type', 'like', "%{$search}%")
                        ->orWhere('ip_address', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($query) => $query->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
                });
            })
            ->when($filters['action'] ?? null, fn ($query, string $action) => $query->where('action', $action))
            ->when($filters['user_id'] ?? null, fn ($query, string $userId) => $query->where('user_id', $userId))
            ->when($filters['date_from'] ?? null, fn ($query, string $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($query, string $date) => $query->whereDate('created_at', '<=', $date))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('ActivityLogs/Index', [
            'logs' => $logs,
            'filters' => $filters,
            'users' => User::query()->orderBy('name')->get(['id', 'name', 'email']),
            'actions' => ActivityLog::query()->select('action')->distinct()->orderBy('action')->pluck('action'),
            'summary' => [
                'total' => ActivityLog::query()->count(),
                'today' => ActivityLog::query()->whereDate('created_at', today())->count(),
                'updates' => ActivityLog::query()->where('action', 'like', '%updated%')->count(),
                'deletes' => ActivityLog::query()->where('action', 'like', '%deleted%')->count(),
            ],
        ]);
    }
}
