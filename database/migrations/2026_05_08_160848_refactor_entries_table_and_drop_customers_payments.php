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
            $table->dropForeign(['customer_id']);
            $table->dropForeign(['payment_id']);
            $table->dropColumn(['customer_id', 'payment_id']);
            
            $table->string('phone')->after('name');
            $table->enum('payment_type', ['pago movil', 'zelle', 'usdt'])->after('phone');
            $table->string('reference')->after('payment_type');
        });

        Schema::dropIfExists('payments');
        Schema::dropIfExists('customers');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('identification')->unique();
            $table->string('name');
            $table->string('phone');
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('identification');
            $table->string('bank');
            $table->string('phone');
            $table->string('reference');
            $table->decimal('amount_bs', 15, 2);
            $table->date('payment_date');
            $table->timestamps();
        });

        Schema::table('entries', function (Blueprint $table) {
            $table->unsignedBigInteger('customer_id')->after('championship_id')->nullable();
            $table->unsignedBigInteger('payment_id')->after('customer_id')->nullable();
            
            $table->foreign('customer_id')->references('id')->on('customers')->cascadeOnDelete();
            $table->foreign('payment_id')->references('id')->on('payments')->cascadeOnDelete();

            $table->dropColumn(['phone', 'payment_type', 'reference']);
        });
    }
};
