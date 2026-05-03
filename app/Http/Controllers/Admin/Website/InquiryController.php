<?php

namespace App\Http\Controllers\Admin\Website;

use App\Http\Controllers\Controller;
use App\Models\AppointmentRequest;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InquiryController extends Controller
{
    public function messages(): Response { return Inertia::render('WebsiteAdmin/Messages', ['messages' => ContactMessage::query()->with('updatedBy')->latest()->paginate(15)]); }
    public function appointments(): Response { return Inertia::render('WebsiteAdmin/Appointments', ['appointments' => AppointmentRequest::query()->with('updatedBy')->latest()->paginate(15)]); }
    public function updateMessage(Request $request, ContactMessage $message): RedirectResponse { $data=$request->validate(['status'=>['required','in:new,read,contacted,closed'],'admin_note'=>['nullable','string']]); $message->update([...$data,'updated_by'=>auth()->id()]); return back()->with('success','Message updated successfully.'); }
    public function updateAppointment(Request $request, AppointmentRequest $appointment): RedirectResponse { $data=$request->validate(['status'=>['required','in:pending,contacted,confirmed,completed,cancelled'],'admin_note'=>['nullable','string']]); $appointment->update([...$data,'updated_by'=>auth()->id()]); return back()->with('success','Appointment updated successfully.'); }
}
