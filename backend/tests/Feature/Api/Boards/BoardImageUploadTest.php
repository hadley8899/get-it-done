<?php

namespace Tests\Feature\Api\Boards;

use App\Models\Board;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Passport\Passport;
use Tests\Feature\Api\ApiTestCase;

class BoardImageUploadTest extends ApiTestCase
{
    public function test_store_uploads_board_image_to_public_disk_and_persists_public_path(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        Passport::actingAs($user);

        $workspace = Workspace::factory()->create(['user_id' => $user->id]);

        $response = $this->post("/boards/{$workspace->uuid}", [
            'name' => 'Board With Image',
            'description' => 'Image test board',
            'image' => UploadedFile::fake()->image('board-image.png', 300, 300),
        ], ['Accept' => 'application/json']);

        $response
            ->assertStatus(201)
            ->assertJsonPath('name', 'Board With Image');

        $imagePath = (string) $response->json('image');

        $this->assertMatchesRegularExpression('/^storage\/board-images\/.+$/', $imagePath);
        $this->assertStringStartsNotWith('/', $imagePath);
        $this->assertStringNotContainsString('storage/app/public', $imagePath);

        $diskPath = str_replace('storage/', '', $imagePath);
        Storage::disk('public')->assertExists($diskPath);

        $this->assertDatabaseHas('boards', [
            'workspace_id' => $workspace->id,
            'name' => 'Board With Image',
            'image' => $imagePath,
        ]);
    }

    public function test_store_without_image_uses_default_public_image_path(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $workspace = Workspace::factory()->create(['user_id' => $user->id]);

        $response = $this->postJson("/boards/{$workspace->uuid}", [
            'name' => 'Board Without Image',
            'description' => 'No image',
        ]);

        $response
            ->assertStatus(201)
            ->assertJsonPath('image', 'img/default-board-image.png');

        $this->assertDatabaseHas('boards', [
            'workspace_id' => $workspace->id,
            'name' => 'Board Without Image',
            'image' => 'img/default-board-image.png',
        ]);
    }

    public function test_update_with_new_image_rewrites_image_path_and_stores_file(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        Passport::actingAs($user);

        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        $board = Board::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'name' => 'Original Board',
            'image' => 'img/default-board-image.png',
        ]);

        $response = $this->post("/boards/{$workspace->uuid}/{$board->uuid}", [
            '_method' => 'PUT',
            'name' => 'Updated Board',
            'description' => 'Updated',
            'image' => UploadedFile::fake()->image('updated-board-image.png', 320, 320),
        ], ['Accept' => 'application/json']);

        $response
            ->assertOk()
            ->assertJsonPath('name', 'Updated Board');

        $newImagePath = (string) $response->json('image');

        $this->assertNotSame('img/default-board-image.png', $newImagePath);
        $this->assertMatchesRegularExpression('/^storage\/board-images\/.+$/', $newImagePath);

        $diskPath = str_replace('storage/', '', $newImagePath);
        Storage::disk('public')->assertExists($diskPath);

        $this->assertDatabaseHas('boards', [
            'id' => $board->id,
            'name' => 'Updated Board',
            'image' => $newImagePath,
        ]);
    }
}

