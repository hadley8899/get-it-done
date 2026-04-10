<?php

namespace Tests\Feature\Api\Knowledgebase;

use App\Models\Knowledgebase;
use App\Models\KnowledgebaseCategory;
use App\Models\KnowledgebaseItem;
use App\Models\User;
use App\Models\Workspace;
use Laravel\Passport\Passport;
use Tests\Feature\Api\ApiTestCase;

class KnowledgebaseFlowTest extends ApiTestCase
{
    public function test_categories_returns_root_categories_only(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $workspace = Workspace::factory()->create(['user_id' => $user->id]);

        $rootCategory = new KnowledgebaseCategory();
        $rootCategory->workspace_id = $workspace->id;
        $rootCategory->name = 'Root Category';
        $rootCategory->description = 'Root';
        $rootCategory->position = 1;
        $rootCategory->saveOrFail();

        $childCategory = new KnowledgebaseCategory();
        $childCategory->workspace_id = $workspace->id;
        $childCategory->parent_id = $rootCategory->id;
        $childCategory->name = 'Child Category';
        $childCategory->description = 'Child';
        $childCategory->position = 1;
        $childCategory->saveOrFail();

        $response = $this->getJson("/knowledgebase/{$workspace->uuid}/categories");

        $response
            ->assertOk()
            ->assertJsonFragment(['uuid' => $rootCategory->uuid, 'name' => 'Root Category'])
            ->assertJsonMissing(['uuid' => $childCategory->uuid, 'name' => 'Child Category']);
    }

    public function test_store_category_and_child_and_fetch_children(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $workspace = Workspace::factory()->create(['user_id' => $user->id]);

        $storeRootResponse = $this->postJson("/knowledgebase/{$workspace->uuid}/categories", [
            'name' => 'Parent Category',
            'description' => 'Parent description',
        ]);

        $storeRootResponse
            ->assertOk()
            ->assertJsonPath('name', 'Parent Category');

        $parentUuid = (string) $storeRootResponse->json('uuid');

        $storeChildResponse = $this->postJson("/knowledgebase/{$workspace->uuid}/categories", [
            'name' => 'Child Category',
            'description' => 'Child description',
            'parent_uuid' => $parentUuid,
        ]);

        $storeChildResponse
            ->assertOk()
            ->assertJsonPath('name', 'Child Category');

        $childrenResponse = $this->getJson("/knowledgebase/{$workspace->uuid}/categories/{$parentUuid}/children");

        $childrenResponse
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Child Category');
    }

    public function test_update_category_persists_new_name_and_description(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $workspace = Workspace::factory()->create(['user_id' => $user->id]);

        $category = new KnowledgebaseCategory();
        $category->workspace_id = $workspace->id;
        $category->name = 'Original Category';
        $category->description = 'Original description';
        $category->position = 1;
        $category->saveOrFail();

        $response = $this->putJson("/knowledgebase/{$workspace->uuid}/categories/{$category->uuid}", [
            'name' => 'Updated Category',
            'description' => 'Updated description',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('name', 'Updated Category')
            ->assertJsonPath('description', 'Updated description');

        $this->assertDatabaseHas('knowledgebase_categories', [
            'id' => $category->id,
            'name' => 'Updated Category',
            'description' => 'Updated description',
        ]);
    }

    public function test_knowledgebase_store_list_update_and_destroy_flow(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $workspace = Workspace::factory()->create(['user_id' => $user->id]);

        $category = new KnowledgebaseCategory();
        $category->workspace_id = $workspace->id;
        $category->name = 'Knowledge Category';
        $category->description = null;
        $category->position = 1;
        $category->saveOrFail();

        $storeResponse = $this->postJson("/knowledgebase/{$workspace->uuid}/{$category->uuid}/knowledgebases", [
            'name' => 'Knowledgebase One',
            'description' => 'KB description',
        ]);

        $storeResponse
            ->assertOk()
            ->assertJsonPath('name', 'Knowledgebase One');

        $knowledgebaseUuid = (string) $storeResponse->json('uuid');

        $listResponse = $this->getJson("/knowledgebase/{$workspace->uuid}/{$category->uuid}/knowledgebases");

        $listResponse
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Knowledgebase One');

        $updateResponse = $this->putJson("/knowledgebase/{$workspace->uuid}/{$category->uuid}/knowledgebases/{$knowledgebaseUuid}", [
            'name' => 'Knowledgebase Updated',
            'description' => 'Updated KB description',
            'position' => 1,
        ]);

        $updateResponse
            ->assertOk()
            ->assertJsonPath('name', 'Knowledgebase Updated')
            ->assertJsonPath('description', 'Updated KB description');

        $knowledgebase = Knowledgebase::query()->where('uuid', $knowledgebaseUuid)->firstOrFail();

        $kbItem = new KnowledgebaseItem();
        $kbItem->knowledgebase_id = $knowledgebase->id;
        $kbItem->name = 'Item to delete';
        $kbItem->contents = 'text';
        $kbItem->position = 1;
        $kbItem->saveOrFail();

        $destroyResponse = $this->deleteJson("/knowledgebase/{$workspace->uuid}/{$category->uuid}/knowledgebases/{$knowledgebaseUuid}");

        $destroyResponse
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertSoftDeleted('knowledgebases', ['id' => $knowledgebase->id]);
        $this->assertSoftDeleted('knowledgebase_items', ['knowledgebase_id' => $knowledgebase->id]);
    }

    public function test_destroy_category_soft_deletes_category_knowledgebases_and_items(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $workspace = Workspace::factory()->create(['user_id' => $user->id]);

        $category = new KnowledgebaseCategory();
        $category->workspace_id = $workspace->id;
        $category->name = 'Delete Category';
        $category->position = 1;
        $category->saveOrFail();

        $knowledgebase = new Knowledgebase();
        $knowledgebase->category_id = $category->id;
        $knowledgebase->name = 'Delete KB';
        $knowledgebase->description = null;
        $knowledgebase->position = 1;
        $knowledgebase->saveOrFail();

        $item = new KnowledgebaseItem();
        $item->knowledgebase_id = $knowledgebase->id;
        $item->name = 'Delete Item';
        $item->contents = 'x';
        $item->position = 1;
        $item->saveOrFail();

        $response = $this->deleteJson("/knowledgebase/{$workspace->uuid}/categories/{$category->uuid}");

        $response
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertSoftDeleted('knowledgebase_categories', ['id' => $category->id]);
        $this->assertSoftDeleted('knowledgebases', ['id' => $knowledgebase->id]);
        $this->assertSoftDeleted('knowledgebase_items', ['id' => $item->id]);
    }
}



