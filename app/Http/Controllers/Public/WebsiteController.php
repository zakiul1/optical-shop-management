<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\AppointmentRequest;
use App\Models\ContactMessage;
use App\Models\HeroSlide;
use App\Models\Product;
use App\Models\WebsiteGalleryItem;
use App\Models\WebsiteService;
use App\Models\WebsiteSetting;
use App\Models\WebsiteTestimonial;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WebsiteController extends Controller
{
    private function shared(): array
    {
        return [
            'settings' => WebsiteSetting::query()->first(),
            'services' => WebsiteService::query()->where('is_active', true)->orderBy('sort_order')->get(),
        ];
    }

    public function home(): Response
    {
        return Inertia::render('Website/Home', [
            ...$this->shared(),
            'slides' => HeroSlide::query()->where('is_active', true)->orderBy('sort_order')->get(),
            'featuredProducts' => Product::query()->with(['images','category'])->where('is_active', true)->where('show_on_website', true)->where('is_featured', true)->latest()->take(8)->get(),
            'gallery' => WebsiteGalleryItem::query()->where('is_active', true)->orderBy('sort_order')->take(6)->get(),
            'testimonials' => WebsiteTestimonial::query()->where('is_active', true)->latest()->take(6)->get(),
        ]);
    }

    public function about(): Response
    {
        return Inertia::render('Website/About', $this->shared());
    }

    public function services(): Response
    {
        return Inertia::render('Website/Services', $this->shared());
    }

    public function products(Request $request): Response
    {
        return Inertia::render('Website/Products', [
            ...$this->shared(),
            'filters' => $request->only(['type','search']),
            'products' => Product::query()->with(['images','category','medicineDetail','glassDetail'])
                ->where('is_active', true)
                ->where('show_on_website', true)
                ->when($request->query('type'), fn ($query, string $type) => $query->where('product_type', $type))
                ->when($request->query('search'), fn ($query, string $search) => $query->where('name', 'like', "%{$search}%"))
                ->latest()->paginate(12)->withQueryString(),
        ]);
    }

    public function gallery(): Response
    {
        return Inertia::render('Website/Gallery', [
            ...$this->shared(),
            'gallery' => WebsiteGalleryItem::query()->where('is_active', true)->orderBy('sort_order')->paginate(18),
        ]);
    }

    public function contact(): Response
    {
        return Inertia::render('Website/Contact', $this->shared());
    }

    public function storeContact(Request $request): RedirectResponse
    {
        ContactMessage::query()->create($request->validate([
            'name' => ['required','string','max:255'],
            'phone' => ['nullable','string','max:50'],
            'email' => ['nullable','email','max:255'],
            'subject' => ['nullable','string','max:255'],
            'message' => ['required','string','max:5000'],
        ]));
        return back()->with('success', 'Message sent successfully. We will contact you soon.');
    }

    public function storeAppointment(Request $request): RedirectResponse
    {
        AppointmentRequest::query()->create($request->validate([
            'name' => ['required','string','max:255'],
            'phone' => ['required','string','max:50'],
            'service_type' => ['nullable','string','max:255'],
            'preferred_date' => ['nullable','date'],
            'message' => ['nullable','string','max:5000'],
        ]));
        return back()->with('success', 'Appointment request submitted successfully.');
    }
}
