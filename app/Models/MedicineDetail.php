<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicineDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id', 'generic_name', 'strength', 'dosage_form', 'manufacturer', 'batch_no',
        'manufacture_date', 'expire_date', 'storage_note',
    ];

    protected $casts = [
        'manufacture_date' => 'date',
        'expire_date' => 'date',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
