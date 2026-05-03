<?php

namespace App\Http\Controllers\Admin\Website;

use App\Http\Controllers\Controller;
use App\Models\WebsiteTestimonial;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TestimonialController extends Controller
{
    public function index(): Response { return Inertia::render('WebsiteAdmin/Testimonials', ['testimonials' => WebsiteTestimonial::query()->with(['createdBy','updatedBy'])->latest()->get()]); }
    public function store(Request $request): RedirectResponse { $data=$this->validated($request); if ($request->hasFile('photo')) $data['photo_path']=$request->file('photo')->store('website/testimonials','public'); WebsiteTestimonial::query()->create([...$data,'created_by'=>auth()->id(),'updated_by'=>auth()->id()]); return back()->with('success','Testimonial saved successfully.'); }
    public function update(Request $request, WebsiteTestimonial $testimonial): RedirectResponse { $data=$this->validated($request); if ($request->hasFile('photo')) { if ($testimonial->photo_path) Storage::disk('public')->delete($testimonial->photo_path); $data['photo_path']=$request->file('photo')->store('website/testimonials','public'); } $testimonial->update([...$data,'updated_by'=>auth()->id()]); return back()->with('success','Testimonial updated successfully.'); }
    public function destroy(WebsiteTestimonial $testimonial): RedirectResponse { if ($testimonial->photo_path) Storage::disk('public')->delete($testimonial->photo_path); $testimonial->delete(); return back()->with('success','Testimonial deleted successfully.'); }
    private function validated(Request $request): array { $data=$request->validate(['name'=>['required','string','max:255'],'designation'=>['nullable','string','max:255'],'designation_bn'=>['nullable','string','max:255'],'message'=>['required','string'],'message_bn'=>['nullable','string'],'rating'=>['required','integer','min:1','max:5'],'is_active'=>['boolean'],'photo'=>['nullable','image','mimes:jpg,jpeg,png,webp','max:4096']]); unset($data['photo']); $data['is_active']=$request->boolean('is_active', true); return $data; }
}
