<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppointmentRequest extends Model
{
    use HasFactory;
    protected $fillable = ['name','phone','service_type','preferred_date','message','status','admin_note','updated_by'];
    protected $casts = ['preferred_date' => 'date'];

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
