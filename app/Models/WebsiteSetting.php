<?php

namespace App\Models;

use App\Models\Concerns\HasAuditUsers;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class WebsiteSetting extends Model
{
    use HasFactory, HasAuditUsers;

    protected $fillable = [
        'site_name','tagline','tagline_bn','short_description','short_description_bn','logo_path','favicon_path',
        'phone','whatsapp','email','address','address_bn','opening_hours','facebook_url','google_map_url',
        'seo_title','seo_title_bn','seo_description','seo_description_bn','created_by','updated_by',
    ];

    protected $appends = ['logo_url', 'favicon_url'];

    public function getLogoUrlAttribute(): ?string
    {
        return $this->logo_path ? Storage::url($this->logo_path) : null;
    }

    public function getFaviconUrlAttribute(): ?string
    {
        return $this->favicon_path ? Storage::url($this->favicon_path) : null;
    }
}
