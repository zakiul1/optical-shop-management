<?php

namespace App\Models;

use App\Models\Concerns\HasAuditUsers;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class WebsiteTestimonial extends Model
{
    use HasFactory, HasAuditUsers;

    protected $fillable = ['name','designation','designation_bn','message','message_bn','rating','photo_path','is_active','created_by','updated_by'];
    protected $casts = ['is_active' => 'boolean', 'rating' => 'integer'];
    protected $appends = ['photo_url'];

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path ? Storage::url($this->photo_path) : null;
    }
}
