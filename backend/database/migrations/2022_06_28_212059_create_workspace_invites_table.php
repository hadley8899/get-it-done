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
        Schema::create('workspace_invites', static function (Blueprint $table) {
            $table->id();
            $table->uuid();
            $table->string('email');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('workspace_id');
            $table->string('token');
            $table->timestamp('expires_at');
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
        Schema::dropIfExists('workspace_invites');
    }
};
