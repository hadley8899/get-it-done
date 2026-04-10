<?php

namespace Tests\Feature\Api\Boards;

use App\Models\Board;
use App\Models\BoardList;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
use Laravel\Passport\Passport;
use Tests\Feature\Api\ApiTestCase;

class BoardListFlowTest extends ApiTestCase
{
    public function test_store_board_list_assigns_incremental_position(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        $board = Board::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
        ]);

        BoardList::factory()->create([
            'board_id' => $board->id,
            'name' => 'Existing List',
            'position' => 1,
        ]);

        $response = $this->postJson("/boards/{$workspace->uuid}/{$board->uuid}/boardLists", [
            'name' => 'New List',
        ]);

        $response
            ->assertStatus(201)
            ->assertJsonPath('name', 'New List')
            ->assertJsonPath('position', 2);

        $this->assertDatabaseHas('board_lists', [
            'board_id' => $board->id,
            'name' => 'New List',
            'position' => 2,
        ]);
    }

    public function test_reorder_lists_updates_positions_by_uuid_order(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        $board = Board::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
        ]);

        $listOne = BoardList::factory()->create(['board_id' => $board->id, 'position' => 1]);
        $listTwo = BoardList::factory()->create(['board_id' => $board->id, 'position' => 2]);

        $response = $this->postJson("/boards/{$workspace->uuid}/{$board->uuid}/boardLists/reorder", [
            'boardLists' => [$listTwo->uuid, $listOne->uuid],
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('board_lists', ['id' => $listTwo->id, 'position' => 1]);
        $this->assertDatabaseHas('board_lists', ['id' => $listOne->id, 'position' => 2]);
    }

    public function test_reorder_tasks_updates_positions_within_same_list(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        $board = Board::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
        ]);
        $boardList = BoardList::factory()->create(['board_id' => $board->id]);

        $taskOne = Task::factory()->create([
            'board_list_id' => $boardList->id,
            'user_id' => $user->id,
            'position' => 1,
        ]);
        $taskTwo = Task::factory()->create([
            'board_list_id' => $boardList->id,
            'user_id' => $user->id,
            'position' => 2,
        ]);

        $response = $this->postJson("/boards/{$workspace->uuid}/{$board->uuid}/boardLists/{$boardList->uuid}/reorder-tasks", [
            'uuids' => [$taskTwo->uuid, $taskOne->uuid],
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('tasks', ['id' => $taskTwo->id, 'position' => 1]);
        $this->assertDatabaseHas('tasks', ['id' => $taskOne->id, 'position' => 2]);
    }

    public function test_move_task_moves_between_lists_and_repositions(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        $board = Board::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
        ]);

        $fromList = BoardList::factory()->create(['board_id' => $board->id, 'position' => 1]);
        $toList = BoardList::factory()->create(['board_id' => $board->id, 'position' => 2]);

        $movingTask = Task::factory()->create([
            'board_list_id' => $fromList->id,
            'user_id' => $user->id,
            'position' => 1,
        ]);

        $existingToTask = Task::factory()->create([
            'board_list_id' => $toList->id,
            'user_id' => $user->id,
            'position' => 1,
        ]);

        $response = $this->postJson("/boards/{$workspace->uuid}/{$board->uuid}/boardLists/move-task", [
            'fromListUuId' => $fromList->uuid,
            'toListUuId' => $toList->uuid,
            'fromListUuIds' => [],
            'toListUuIds' => [$existingToTask->uuid, $movingTask->uuid],
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('tasks', [
            'id' => $movingTask->id,
            'board_list_id' => $toList->id,
            'position' => 2,
        ]);

        $this->assertDatabaseHas('tasks', [
            'id' => $existingToTask->id,
            'board_list_id' => $toList->id,
            'position' => 1,
        ]);
    }

    public function test_destroy_board_list_soft_deletes_list_tasks_and_reindexes_remaining_lists(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        $board = Board::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
        ]);

        $listOne = BoardList::factory()->create(['board_id' => $board->id, 'position' => 1]);
        $listTwo = BoardList::factory()->create(['board_id' => $board->id, 'position' => 2]);

        $taskInDeletedList = Task::factory()->create([
            'board_list_id' => $listOne->id,
            'user_id' => $user->id,
        ]);

        $response = $this->deleteJson("/boards/{$workspace->uuid}/{$board->uuid}/boardLists/{$listOne->uuid}");

        $response
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertSoftDeleted('board_lists', ['id' => $listOne->id]);
        $this->assertSoftDeleted('tasks', ['id' => $taskInDeletedList->id]);
        $this->assertDatabaseHas('board_lists', ['id' => $listTwo->id, 'position' => 1]);
    }
}

