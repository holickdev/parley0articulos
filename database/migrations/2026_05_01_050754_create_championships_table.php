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
        Schema::create('championships', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('coleadores_count'); // n_coleadores
            $table->integer('rounds_count')->default(4); // n_rondas
            $table->decimal('entry_price', 10, 2); // precio_cuadro
            $table->boolean('has_articles')->default(false);
            $table->enum('status', ['open', 'in_progress', 'finished'])->default('open');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('championships');
    }
};
