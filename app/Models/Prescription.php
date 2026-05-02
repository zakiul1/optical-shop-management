<?php

namespace App\Models;

use App\Models\Concerns\HasAuditUsers;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Prescription extends Model
{
    use HasFactory, SoftDeletes, HasAuditUsers;

    protected $fillable = [
        'customer_id', 'prescription_date', 'right_sph', 'right_cyl', 'right_axis', 'right_va',
        'left_sph', 'left_cyl', 'left_axis', 'left_va', 'near_addition', 'ipd', 'complaints',
        'remarks', 'created_by', 'updated_by',
    ];

    protected $casts = [
        'prescription_date' => 'date',
        'right_sph' => 'decimal:2',
        'right_cyl' => 'decimal:2',
        'left_sph' => 'decimal:2',
        'left_cyl' => 'decimal:2',
        'near_addition' => 'decimal:2',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
