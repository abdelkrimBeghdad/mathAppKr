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
        Schema::create('payment_ledgers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('access_record_id')->nullable()->constrained('access_records')->onDelete('set null');
            $table->decimal('amount_dzd', 10, 2)->default(0.00);
            $table->integer('coins_amount')->default(0);
            $table->string('payment_method'); // 'ccp', 'baridimob', 'coins', 'external_receipt', 'manual_grant'
            $table->string('transaction_type'); // 'credit', 'debit'
            $table->string('description');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_ledgers');
    }
};
