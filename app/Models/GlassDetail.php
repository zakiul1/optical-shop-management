<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GlassDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id', 'glass_type', 'model_no', 'frame_material', 'frame_color', 'size', 'lens_power',
        'sph', 'cyl', 'axis', 'addition', 'lens_type', 'blue_cut', 'photochromic', 'anti_reflection', 'high_index',
    ];

    protected $casts = [
        'sph' => 'decimal:2',
        'cyl' => 'decimal:2',
        'addition' => 'decimal:2',
        'blue_cut' => 'boolean',
        'photochromic' => 'boolean',
        'anti_reflection' => 'boolean',
        'high_index' => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
