<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->boolean('show_on_website')->default(false)->after('is_active');
            $table->boolean('is_featured')->default(false)->after('show_on_website');
            $table->text('website_short_description')->nullable()->after('is_featured');
            $table->text('website_short_description_bn')->nullable()->after('website_short_description');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->dropColumn(['show_on_website', 'is_featured', 'website_short_description', 'website_short_description_bn']);
        });
    }
};
