<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedule_settings', function (Blueprint $table) {
            $table->id();
            $table->json('operating_days');
            $table->time('opening_time')->default('09:00:00');
            $table->time('closing_time')->default('17:00:00');
            $table->unsignedInteger('slot_duration')->default(30);
            $table->unsignedInteger('max_per_slot')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_settings');
    }
};
