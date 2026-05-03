<?php

namespace App\Models;

use App\Models\Concerns\HasAuditUsers;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class WebsiteService extends Model
{
    use HasFactory, HasAuditUsers;

    protected $fillable = ['icon','title','title_bn','description','description_bn','image_path','sort_order','is_featured','is_active','created_by','updated_by'];
    protected $casts = ['is_featured' => 'boolean', 'is_active' => 'boolean', 'sort_order' => 'integer'];
    protected $appends = ['image_url'];

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path ? Storage::url($this->image_path) : null;
    }
}
