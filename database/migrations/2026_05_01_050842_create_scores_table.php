<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('round_id')->constrained()->cascadeOnDelete();
            $table->foreignId('coleador_id')->constrained('coleadores')->cascadeOnDelete();
            $table->integer('effective_coleadas')->default(0); // ce
            $table->integer('null_coleadas')->default(0);      // cn
            $table->integer('gate_bulls')->default(0);         // tp
            $table->json('articles')->nullable();              // ar (JSON: {"5B": 5, "2C": 2})
            $table->timestamps();

            // Un coleador solo puede tener una puntuación por ronda
            $table->unique(['round_id', 'coleador_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scores');
    }
};
