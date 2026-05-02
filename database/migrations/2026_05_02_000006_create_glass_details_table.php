<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('glass_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->unique()->constrained('products')->cascadeOnDelete();
            $table->enum('glass_type', ['frame', 'lens', 'sunglass', 'reading_glass', 'contact_lens'])->default('frame');
            $table->string('model_no')->nullable();
            $table->string('frame_material')->nullable();
            $table->string('frame_color')->nullable();
            $table->string('size')->nullable();
            $table->string('lens_power')->nullable();
            $table->decimal('sph', 5, 2)->nullable();
            $table->decimal('cyl', 5, 2)->nullable();
            $table->integer('axis')->nullable();
            $table->decimal('addition', 5, 2)->nullable();
            $table->string('lens_type')->nullable();
            $table->boolean('blue_cut')->default(false);
            $table->boolean('photochromic')->default(false);
            $table->boolean('anti_reflection')->default(false);
            $table->boolean('high_index')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('glass_details');
    }
};
