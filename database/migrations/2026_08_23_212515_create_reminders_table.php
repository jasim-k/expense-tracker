<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('transaction_id')->constrained()->cascadeOnDelete();
            $table->string('trigger_field_key');
            $table->string('label')->nullable();
            $table->date('target_date');
            $table->integer('reminder_offset_days')->default(7);
            $table->boolean('is_completed')->default(false);
            $table->timestamp('last_notified_at')->nullable();
            $table->timestamps();

            $table->index(['target_date', 'is_completed']);
            $table->index(['user_id', 'is_completed']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reminders');
    }
};
