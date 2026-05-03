<?php

namespace App\Http\Controllers\Admin\Website;

use App\Http\Controllers\Controller;
use App\Models\AppointmentRequest;
use App\Models\ContactMessage;
use App\Models\HeroSlide;
use App\Models\Product;
use App\Models\WebsiteGalleryItem;
use App\Models\WebsiteService;
use App\Models\WebsiteTestimonial;
use Inertia\Inertia;
use Inertia\Response;

class WebsiteDashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('WebsiteAdmin/Dashboard', [
            'stats' => [
                'slides' => HeroSlide::query()->count(),
                'services' => WebsiteService::query()->count(),
                'gallery' => WebsiteGalleryItem::query()->count(),
                'testimonials' => WebsiteTestimonial::query()->count(),
                'website_products' => Product::query()->where('show_on_website', true)->count(),
                'new_messages' => ContactMessage::query()->where('status', 'new')->count(),
                'pending_appointments' => AppointmentRequest::query()->where('status', 'pending')->count(),
            ],
            'messages' => ContactMessage::query()->latest()->take(5)->get(),
            'appointments' => AppointmentRequest::query()->latest()->take(5)->get(),
        ]);
    }
}
