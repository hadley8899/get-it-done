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
        Schema::create('knowledgebase_items', static function (Blueprint $table) {
            $table->id();
            $table->uuid();
            $table->unsignedBigInteger('knowledgebase_id');
            $table->string('name');
            $table->text('contents')->nullable()->default(null);
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
        Schema::dropIfExists('knowledgebase_items');
    }
};
