<?php

namespace App\Http\Controllers\Admin\Website;

use App\Http\Controllers\Controller;
use App\Models\WebsiteSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class WebsiteSettingController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('WebsiteAdmin/Settings', ['settings' => WebsiteSetting::query()->first()]);
    }

    public function update(Request $request): RedirectResponse
    {
        $settings = WebsiteSetting::query()->firstOrCreate([], ['created_by' => auth()->id()]);
        $data = $request->validate([
            'site_name' => ['required','string','max:255'], 'tagline' => ['nullable','string','max:255'], 'tagline_bn' => ['nullable','string','max:255'],
            'short_description' => ['nullable','string'], 'short_description_bn' => ['nullable','string'], 'phone' => ['nullable','string','max:50'], 'whatsapp' => ['nullable','string','max:50'],
            'email' => ['nullable','email','max:255'], 'address' => ['nullable','string'], 'address_bn' => ['nullable','string'], 'opening_hours' => ['nullable','string','max:255'],
            'facebook_url' => ['nullable','url','max:255'], 'google_map_url' => ['nullable','url'], 'seo_title' => ['nullable','string','max:255'], 'seo_title_bn' => ['nullable','string','max:255'],
            'seo_description' => ['nullable','string'], 'seo_description_bn' => ['nullable','string'], 'logo' => ['nullable','image','mimes:jpg,jpeg,png,webp,svg','max:4096'], 'favicon' => ['nullable','image','mimes:jpg,jpeg,png,webp,svg,ico','max:2048'],
        ]);
        if ($request->hasFile('logo')) { if ($settings->logo_path) Storage::disk('public')->delete($settings->logo_path); $data['logo_path'] = $request->file('logo')->store('website/logos','public'); }
        if ($request->hasFile('favicon')) { if ($settings->favicon_path) Storage::disk('public')->delete($settings->favicon_path); $data['favicon_path'] = $request->file('favicon')->store('website/logos','public'); }
        unset($data['logo'], $data['favicon']);
        $settings->update([...$data, 'updated_by' => auth()->id()]);
        return back()->with('success', 'Website settings updated successfully.');
    }
}
