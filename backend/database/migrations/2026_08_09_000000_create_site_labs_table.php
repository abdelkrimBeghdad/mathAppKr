<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_labs', function (Blueprint $table) {
            $table->id();
            $table->string('lab_key')->unique();         // e.g. 'exp-simple'
            $table->string('title_ar');                   // عنوان المختبر بالعربية
            $table->string('category');                   // e.g. 'expansion', 'trig', ...
            $table->string('difficulty')->default('مبتدئ');
            $table->string('access_type')->default('classic'); // classic | premium
            $table->integer('price')->default(0);         // price in coins
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_labs');
    }
};
