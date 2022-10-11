<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('knowledgebases', static function (Blueprint $table) {
            $table->id();
            $table->uuid();
            $table->unsignedBigInteger('category_id');
            $table->string('name');
            $table->string('description')->nullable()->default(null);
            $table->unsignedBigInteger('position')->default(0);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('knowledgebase');
    }
};
