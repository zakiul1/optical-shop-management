<?php

namespace App\Http\Controllers\Admin\Website;

use App\Http\Controllers\Controller;
use App\Models\WebsiteGalleryItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class GalleryController extends Controller
{
    public function index(): Response { return Inertia::render('WebsiteAdmin/Gallery', ['items' => WebsiteGalleryItem::query()->with(['createdBy','updatedBy'])->orderBy('sort_order')->latest()->get()]); }
    public function store(Request $request): RedirectResponse { $data=$this->validated($request, true); $data['image_path']=$request->file('image')->store('website/gallery','public'); WebsiteGalleryItem::query()->create([...$data,'created_by'=>auth()->id(),'updated_by'=>auth()->id()]); return back()->with('success','Gallery item saved successfully.'); }
    public function update(Request $request, WebsiteGalleryItem $gallery): RedirectResponse { $data=$this->validated($request, false); if ($request->hasFile('image')) { if ($gallery->image_path) Storage::disk('public')->delete($gallery->image_path); $data['image_path']=$request->file('image')->store('website/gallery','public'); } $gallery->update([...$data,'updated_by'=>auth()->id()]); return back()->with('success','Gallery item updated successfully.'); }
    public function destroy(WebsiteGalleryItem $gallery): RedirectResponse { if ($gallery->image_path) Storage::disk('public')->delete($gallery->image_path); $gallery->delete(); return back()->with('success','Gallery item deleted successfully.'); }
    private function validated(Request $request, bool $required): array { $data=$request->validate(['title'=>['nullable','string','max:255'],'title_bn'=>['nullable','string','max:255'],'category'=>['nullable','string','max:255'],'sort_order'=>['nullable','integer','min:0'],'is_active'=>['boolean'],'image'=>[$required?'required':'nullable','image','mimes:jpg,jpeg,png,webp','max:4096']]); unset($data['image']); $data['sort_order']=$data['sort_order'] ?? 0; $data['is_active']=$request->boolean('is_active', true); return $data; }
}
