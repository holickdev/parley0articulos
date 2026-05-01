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
        Schema::create('championship_coleador', function (Blueprint $table) {
            $table->foreignId('championship_id')->constrained()->cascadeOnDelete();
            $table->foreignId('coleador_id')->constrained('coleadores')->cascadeOnDelete();
            $table->primary(['championship_id', 'coleador_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('championship_coleador');
    }
};
