<?php

namespace App\Http\Controllers\Admin\Website;

use App\Http\Controllers\Controller;
use App\Models\HeroSlide;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class HeroSlideController extends Controller
{
    public function index(): Response { return Inertia::render('WebsiteAdmin/HeroSlides', ['slides' => HeroSlide::query()->with(['createdBy','updatedBy'])->orderBy('sort_order')->latest()->get()]); }
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        if ($request->hasFile('image')) $data['image_path'] = $request->file('image')->store('website/heroes','public');
        HeroSlide::query()->create([...$data, 'created_by' => auth()->id(), 'updated_by' => auth()->id()]);
        return back()->with('success', 'Hero slide saved successfully.');
    }
    public function update(Request $request, HeroSlide $heroSlide): RedirectResponse
    {
        $data = $this->validated($request);
        if ($request->hasFile('image')) { if ($heroSlide->image_path) Storage::disk('public')->delete($heroSlide->image_path); $data['image_path'] = $request->file('image')->store('website/heroes','public'); }
        $heroSlide->update([...$data, 'updated_by' => auth()->id()]);
        return back()->with('success', 'Hero slide updated successfully.');
    }
    public function destroy(HeroSlide $heroSlide): RedirectResponse
    {
        if ($heroSlide->image_path) Storage::disk('public')->delete($heroSlide->image_path);
        $heroSlide->delete();
        return back()->with('success', 'Hero slide deleted successfully.');
    }
    private function validated(Request $request): array
    {
        $data = $request->validate(['eyebrow'=>['nullable','string','max:255'],'eyebrow_bn'=>['nullable','string','max:255'],'title'=>['required','string','max:255'],'title_bn'=>['nullable','string','max:255'],'subtitle'=>['nullable','string'],'subtitle_bn'=>['nullable','string'],'button_text'=>['nullable','string','max:255'],'button_text_bn'=>['nullable','string','max:255'],'button_url'=>['nullable','string','max:255'],'sort_order'=>['nullable','integer','min:0'],'is_active'=>['boolean'],'image'=>['nullable','image','mimes:jpg,jpeg,png,webp','max:4096']]);
        unset($data['image']); $data['is_active'] = $request->boolean('is_active', true); $data['sort_order'] = $data['sort_order'] ?? 0; return $data;
    }
}
