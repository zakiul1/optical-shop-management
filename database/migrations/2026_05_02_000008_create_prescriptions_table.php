<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->date('prescription_date')->nullable();
            $table->decimal('right_sph', 5, 2)->nullable();
            $table->decimal('right_cyl', 5, 2)->nullable();
            $table->integer('right_axis')->nullable();
            $table->string('right_va')->nullable();
            $table->decimal('left_sph', 5, 2)->nullable();
            $table->decimal('left_cyl', 5, 2)->nullable();
            $table->integer('left_axis')->nullable();
            $table->string('left_va')->nullable();
            $table->decimal('near_addition', 5, 2)->nullable();
            $table->string('ipd')->nullable();
            $table->text('complaints')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};
