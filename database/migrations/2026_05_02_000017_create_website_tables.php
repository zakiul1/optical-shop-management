<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('website_settings', function (Blueprint $table): void {
            $table->id();
            $table->string('site_name')->default('Madina Optical');
            $table->string('tagline')->nullable();
            $table->string('tagline_bn')->nullable();
            $table->text('short_description')->nullable();
            $table->text('short_description_bn')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('favicon_path')->nullable();
            $table->string('phone')->nullable();
            $table->string('whatsapp')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->text('address_bn')->nullable();
            $table->string('opening_hours')->nullable();
            $table->string('facebook_url')->nullable();
            $table->string('google_map_url')->nullable();
            $table->string('seo_title')->nullable();
            $table->string('seo_title_bn')->nullable();
            $table->text('seo_description')->nullable();
            $table->text('seo_description_bn')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('hero_slides', function (Blueprint $table): void {
            $table->id();
            $table->string('eyebrow')->nullable();
            $table->string('eyebrow_bn')->nullable();
            $table->string('title');
            $table->string('title_bn')->nullable();
            $table->text('subtitle')->nullable();
            $table->text('subtitle_bn')->nullable();
            $table->string('button_text')->nullable();
            $table->string('button_text_bn')->nullable();
            $table->string('button_url')->nullable();
            $table->string('image_path')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('website_services', function (Blueprint $table): void {
            $table->id();
            $table->string('icon')->default('eye');
            $table->string('title');
            $table->string('title_bn')->nullable();
            $table->text('description')->nullable();
            $table->text('description_bn')->nullable();
            $table->string('image_path')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_featured')->default(true);
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('website_gallery_items', function (Blueprint $table): void {
            $table->id();
            $table->string('title')->nullable();
            $table->string('title_bn')->nullable();
            $table->string('category')->nullable();
            $table->string('image_path');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('website_testimonials', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('designation')->nullable();
            $table->string('designation_bn')->nullable();
            $table->text('message');
            $table->text('message_bn')->nullable();
            $table->unsignedTinyInteger('rating')->default(5);
            $table->string('photo_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('contact_messages', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('subject')->nullable();
            $table->text('message');
            $table->string('status')->default('new');
            $table->text('admin_note')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('appointment_requests', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('phone');
            $table->string('service_type')->nullable();
            $table->date('preferred_date')->nullable();
            $table->text('message')->nullable();
            $table->string('status')->default('pending');
            $table->text('admin_note')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointment_requests');
        Schema::dropIfExists('contact_messages');
        Schema::dropIfExists('website_testimonials');
        Schema::dropIfExists('website_gallery_items');
        Schema::dropIfExists('website_services');
        Schema::dropIfExists('hero_slides');
        Schema::dropIfExists('website_settings');
    }
};
