<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'role', 'status']);

        $users = User::query()
            ->withCount('activityLogs')
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($filters['role'] ?? null, fn ($query, string $role) => $query->where('role', $role))
            ->when(($filters['status'] ?? null) === 'active', fn ($query) => $query->where('is_active', true))
            ->when(($filters['status'] ?? null) === 'inactive', fn ($query) => $query->where('is_active', false))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $filters,
            'summary' => [
                'total' => User::query()->count(),
                'active' => User::query()->where('is_active', true)->count(),
                'inactive' => User::query()->where('is_active', false)->count(),
                'admins' => User::query()->where('role', 'admin')->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateUser($request);
        $data['password'] = Hash::make($data['password']);
        $data['is_active'] = $request->boolean('is_active', true);
        $data['photo_path'] = $this->storePhoto($request);

        $user = User::query()->create($data);
        $this->logActivity('user_created', $user, null, $user->only(['id', 'name', 'email', 'phone', 'photo_path', 'role', 'is_active']), $request);

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $oldValues = $user->only(['id', 'name', 'email', 'phone', 'photo_path', 'role', 'is_active']);
        $data = $this->validateUser($request, $user);
        $data['is_active'] = $request->boolean('is_active', true);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        if ($request->boolean('remove_photo') && $user->photo_path) {
            Storage::disk('public')->delete($user->photo_path);
            $data['photo_path'] = null;
        }

        if ($newPhoto = $this->storePhoto($request)) {
            if ($user->photo_path) {
                Storage::disk('public')->delete($user->photo_path);
            }
            $data['photo_path'] = $newPhoto;
        }

        if ($user->is(auth()->user()) && (! $data['is_active'] || $data['role'] !== 'admin')) {
            return back()->with('error', 'You cannot deactivate yourself or remove your own admin role.');
        }

        if ($user->role === 'admin' && $data['role'] !== 'admin' && User::query()->where('role', 'admin')->where('id', '!=', $user->id)->count() < 1) {
            return back()->with('error', 'At least one admin user must remain.');
        }

        $user->update($data);
        $this->logActivity('user_updated', $user, $oldValues, $user->fresh()->only(['id', 'name', 'email', 'phone', 'photo_path', 'role', 'is_active']), $request);

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->is(auth()->user())) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        if ($user->role === 'admin' && User::query()->where('role', 'admin')->where('id', '!=', $user->id)->count() < 1) {
            return back()->with('error', 'At least one admin user must remain.');
        }

        $oldValues = $user->only(['id', 'name', 'email', 'phone', 'photo_path', 'role', 'is_active']);
        if ($user->photo_path) {
            Storage::disk('public')->delete($user->photo_path);
        }
        $this->logActivity('user_deleted', $user, $oldValues, null, $request);
        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }

    private function validateUser(Request $request, ?User $user = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user?->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'remove_photo' => ['boolean'],
            'role' => ['required', Rule::in(['admin', 'manager', 'staff'])],
            'is_active' => ['boolean'],
            'password' => [$user ? 'nullable' : 'required', 'string', 'min:8'],
        ]);
    }

    private function storePhoto(Request $request): ?string
    {
        return $request->hasFile('photo') ? $request->file('photo')->store('users', 'public') : null;
    }

    private function logActivity(string $action, User $targetUser, ?array $oldValues, ?array $newValues, Request $request): void
    {
        ActivityLog::query()->create([
            'user_id' => auth()->id(),
            'action' => $action,
            'loggable_type' => User::class,
            'loggable_id' => $targetUser->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}
