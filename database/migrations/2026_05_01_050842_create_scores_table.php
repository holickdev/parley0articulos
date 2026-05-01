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
            $table->foreignId('turn_id')->constrained()->cascadeOnDelete();
            $table->foreignId('coleador_id')->constrained('coleadores')->cascadeOnDelete();
            $table->integer('effective_coleadas')->default(0); // ce
            $table->integer('null_coleadas')->default(0);      // cn
            $table->integer('gate_bulls')->default(0);         // tp
            $table->integer('articles')->default(0);           // ar
            $table->timestamps();

            $table->unique(['turn_id', 'coleador_id']);
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
