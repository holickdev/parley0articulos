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
        Schema::table('entries', function (Blueprint $table) {
            $table->string('phone')->nullable()->change();
            $table->enum('payment_type', ['pago movil', 'zelle', 'usdt'])->nullable()->change();
            $table->string('reference')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('entries', function (Blueprint $table) {
            $table->string('phone')->nullable(false)->change();
            $table->enum('payment_type', ['pago movil', 'zelle', 'usdt'])->nullable(false)->change();
            $table->string('reference')->nullable(false)->change();
        });
    }
};
