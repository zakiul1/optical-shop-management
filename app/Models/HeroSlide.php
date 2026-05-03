<?php

namespace App\Models;

use App\Models\Concerns\HasAuditUsers;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class HeroSlide extends Model
{
    use HasFactory, HasAuditUsers;

    protected $fillable = ['eyebrow','eyebrow_bn','title','title_bn','subtitle','subtitle_bn','button_text','button_text_bn','button_url','image_path','sort_order','is_active','created_by','updated_by'];
    protected $casts = ['is_active' => 'boolean', 'sort_order' => 'integer'];
    protected $appends = ['image_url'];

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path ? Storage::url($this->image_path) : null;
    }
}
