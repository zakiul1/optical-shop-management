<?php

namespace App\Models;

use App\Models\Concerns\HasAuditUsers;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes, HasAuditUsers;

    protected $fillable = [
        'name', 'phone', 'age', 'gender', 'address', 'created_by', 'updated_by',
    ];

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }
}
