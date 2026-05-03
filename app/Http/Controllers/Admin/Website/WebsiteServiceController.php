<?php

namespace App\Http\Controllers\Admin\Website;

use App\Http\Controllers\Controller;
use App\Models\WebsiteService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class WebsiteServiceController extends Controller
{
    public function index(): Response { return Inertia::render('WebsiteAdmin/Services', ['services' => WebsiteService::query()->with(['createdBy','updatedBy'])->orderBy('sort_order')->latest()->get()]); }
    public function store(Request $request): RedirectResponse { $data = $this->validated($request); if ($request->hasFile('image')) $data['image_path'] = $request->file('image')->store('website/services','public'); WebsiteService::query()->create([...$data, 'created_by'=>auth()->id(), 'updated_by'=>auth()->id()]); return back()->with('success','Website service saved successfully.'); }
    public function update(Request $request, WebsiteService $websiteService): RedirectResponse { $data = $this->validated($request); if ($request->hasFile('image')) { if ($websiteService->image_path) Storage::disk('public')->delete($websiteService->image_path); $data['image_path'] = $request->file('image')->store('website/services','public'); } $websiteService->update([...$data, 'updated_by'=>auth()->id()]); return back()->with('success','Website service updated successfully.'); }
    public function destroy(WebsiteService $websiteService): RedirectResponse { if ($websiteService->image_path) Storage::disk('public')->delete($websiteService->image_path); $websiteService->delete(); return back()->with('success','Website service deleted successfully.'); }
    private function validated(Request $request): array { $data = $request->validate(['icon'=>['nullable','string','max:50'],'title'=>['required','string','max:255'],'title_bn'=>['nullable','string','max:255'],'description'=>['nullable','string'],'description_bn'=>['nullable','string'],'sort_order'=>['nullable','integer','min:0'],'is_featured'=>['boolean'],'is_active'=>['boolean'],'image'=>['nullable','image','mimes:jpg,jpeg,png,webp','max:4096']]); unset($data['image']); $data['icon']=$data['icon'] ?? 'eye'; $data['sort_order']=$data['sort_order'] ?? 0; $data['is_featured']=$request->boolean('is_featured', true); $data['is_active']=$request->boolean('is_active', true); return $data; }
}
