<?php

namespace Tests\Feature\Api\Knowledgebase;

use App\Models\Knowledgebase;
use App\Models\KnowledgebaseCategory;
use App\Models\KnowledgebaseItem;
use App\Models\User;
use App\Models\Workspace;
use Laravel\Passport\Passport;
use Tests\Feature\Api\ApiTestCase;

class KnowledgebaseItemFlowTest extends ApiTestCase
{
    public function test_store_list_update_show_and_destroy_knowledgebase_item(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $workspace = Workspace::factory()->create(['user_id' => $user->id]);

        $category = new KnowledgebaseCategory();
        $category->workspace_id = $workspace->id;
        $category->name = 'Item Category';
        $category->position = 1;
        $category->saveOrFail();

        $knowledgebase = new Knowledgebase();
        $knowledgebase->category_id = $category->id;
        $knowledgebase->name = 'Item KB';
        $knowledgebase->description = null;
        $knowledgebase->position = 1;
        $knowledgebase->saveOrFail();

        $storeResponse = $this->postJson("/knowledgebase/{$workspace->uuid}/{$category->uuid}/knowledgebases/{$knowledgebase->uuid}/items", [
            'name' => 'First Item',
            'contents' => 'First contents',
        ]);

        $storeResponse
            ->assertOk()
            ->assertJsonPath('name', 'First Item')
            ->assertJsonPath('contents', 'First contents')
            ->assertJsonPath('position', 1);

        $itemUuid = (string) $storeResponse->json('uuid');

        $listResponse = $this->getJson("/knowledgebase/{$workspace->uuid}/{$category->uuid}/knowledgebases/{$knowledgebase->uuid}/items");

        $listResponse
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.uuid', $itemUuid);

        $showResponse = $this->getJson("/knowledgebase/{$workspace->uuid}/{$category->uuid}/knowledgebases/{$knowledgebase->uuid}/items/{$itemUuid}");
        $showResponse
            ->assertOk()
            ->assertJsonPath('uuid', $itemUuid)
            ->assertJsonPath('name', 'First Item');

        $updateResponse = $this->putJson("/knowledgebase/{$workspace->uuid}/{$category->uuid}/knowledgebases/{$knowledgebase->uuid}/items/{$itemUuid}", [
            'name' => 'Updated Item',
            'contents' => 'Updated contents',
        ]);

        $updateResponse
            ->assertOk()
            ->assertJsonPath('uuid', $itemUuid)
            ->assertJsonPath('name', 'Updated Item')
            ->assertJsonPath('contents', 'Updated contents');

        $destroyResponse = $this->deleteJson("/knowledgebase/{$workspace->uuid}/{$category->uuid}/knowledgebases/{$knowledgebase->uuid}/items/{$itemUuid}");
        $destroyResponse
            ->assertOk()
            ->assertJsonPath('success', true);

        $item = KnowledgebaseItem::withTrashed()->where('uuid', $itemUuid)->firstOrFail();
        $this->assertSoftDeleted('knowledgebase_items', ['id' => $item->id]);
    }
}



