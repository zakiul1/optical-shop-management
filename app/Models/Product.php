<?php

namespace App\Models;

use App\Models\Concerns\HasAuditUsers;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes, HasAuditUsers;

    protected $fillable = [
        'category_id', 'supplier_id', 'product_type', 'name', 'sku', 'barcode', 'brand', 'description',
        'purchase_price', 'sale_price', 'stock_quantity', 'minimum_stock_alert', 'unit', 'is_active',
        'show_on_website', 'is_featured', 'website_short_description', 'website_short_description_bn',
        'created_by', 'updated_by',
    ];

    protected $casts = [
        'purchase_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'minimum_stock_alert' => 'integer',
        'is_active' => 'boolean',
        'show_on_website' => 'boolean',
        'is_featured' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function medicineDetail(): HasOne
    {
        return $this->hasOne(MedicineDetail::class);
    }

    public function glassDetail(): HasOne
    {
        return $this->hasOne(GlassDetail::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('stock_quantity', '<=', 'minimum_stock_alert');
    }

    public function scopeMedicine($query)
    {
        return $query->where('product_type', 'medicine');
    }

    public function scopeGlass($query)
    {
        return $query->where('product_type', 'glass');
    }
}
