<?php

namespace Tests\Feature\Api\Tasks;

use App\Models\Board;
use App\Models\BoardList;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Laravel\Passport\Passport;
use Tests\Feature\Api\ApiTestCase;

class TaskAndCommentFlowTest extends ApiTestCase
{
    public function test_store_task_creates_task_with_current_user_assignment(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        $board = Board::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
        ]);
        $boardList = BoardList::factory()->create(['board_id' => $board->id]);

        $response = $this->postJson("/boards/{$workspace->uuid}/{$board->uuid}/{$boardList->uuid}/tasks", [
            'name' => 'Initial Task',
            'description' => 'Task from test',
            'assigned_to' => 'current user',
            'hours_worked' => null,
        ]);

        $response
            ->assertStatus(201)
            ->assertJsonPath('name', 'Initial Task')
            ->assertJsonPath('board_list', $boardList->uuid)
            ->assertJsonPath('hours_worked', 0)
            ->assertJsonPath('assigned_to.uuid', $user->uuid);

        $this->assertDatabaseHas('tasks', [
            'board_list_id' => $boardList->id,
            'user_id' => $user->id,
            'assigned_to' => $user->id,
            'name' => 'Initial Task',
            'hours_worked' => 0,
        ]);
    }

    public function test_update_task_changes_board_list_assignee_and_hours_worked(): void
    {
        $owner = User::factory()->create();
        $assignee = User::factory()->create();
        Passport::actingAs($owner);

        $workspace = Workspace::factory()->create(['user_id' => $owner->id]);

        WorkspaceMember::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $assignee->id,
        ]);

        $board = Board::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
        ]);

        $fromList = BoardList::factory()->create(['board_id' => $board->id]);
        $toList = BoardList::factory()->create(['board_id' => $board->id]);

        $task = Task::factory()->create([
            'board_list_id' => $fromList->id,
            'user_id' => $owner->id,
            'assigned_to' => $owner->id,
            'hours_worked' => 1,
        ]);

        $response = $this->putJson("/tasks/{$task->uuid}", [
            'name' => 'Updated Task',
            'description' => 'Updated description',
            'board_list' => $toList->uuid,
            'assigned_to' => $assignee->uuid,
            'hours_worked' => 5,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('name', 'Updated Task')
            ->assertJsonPath('hours_worked', 5)
            ->assertJsonPath('assigned_to.uuid', $assignee->uuid);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'board_list_id' => $toList->id,
            'assigned_to' => $assignee->id,
            'hours_worked' => 5,
            'name' => 'Updated Task',
        ]);
    }

    public function test_task_show_returns_comments(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        $board = Board::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
        ]);
        $boardList = BoardList::factory()->create(['board_id' => $board->id]);

        $task = Task::factory()->create([
            'board_list_id' => $boardList->id,
            'user_id' => $user->id,
            'assigned_to' => $user->id,
        ]);

        $comment = TaskComment::query()->create([
            'task_id' => $task->id,
            'user_id' => $user->id,
            'comment' => 'First comment',
        ]);

        $response = $this->getJson("/tasks/{$task->uuid}");

        $response
            ->assertOk()
            ->assertJsonPath('uuid', $task->uuid)
            ->assertJsonPath('comments.0.uuid', $comment->uuid)
            ->assertJsonPath('comments.0.comment', 'First comment');
    }

    public function test_task_comment_store_update_and_destroy_flow(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        $board = Board::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
        ]);
        $boardList = BoardList::factory()->create(['board_id' => $board->id]);

        $task = Task::factory()->create([
            'board_list_id' => $boardList->id,
            'user_id' => $user->id,
            'assigned_to' => $user->id,
        ]);

        $storeResponse = $this->postJson("/tasks/{$task->uuid}/comments", [
            'comment' => 'Comment from test',
        ]);

        $storeResponse
            ->assertStatus(201)
            ->assertJsonPath('comment', 'Comment from test')
            ->assertJsonPath('user.uuid', $user->uuid);

        $comment = TaskComment::query()->where('task_id', $task->id)->firstOrFail();

        $indexResponse = $this->getJson("/tasks/{$task->uuid}/comments");
        $indexResponse
            ->assertOk()
            ->assertJsonPath('0.uuid', $comment->uuid);

        $updateResponse = $this->putJson("/tasks/{$task->uuid}/comments/{$comment->uuid}", [
            'comment' => 'Updated comment text',
        ]);

        $updateResponse
            ->assertOk()
            ->assertJsonPath('uuid', $comment->uuid)
            ->assertJsonPath('comment', 'Updated comment text');

        $deleteResponse = $this->deleteJson("/tasks/{$task->uuid}/comments/{$comment->uuid}");
        $deleteResponse->assertStatus(204);

        $this->assertSoftDeleted('task_comments', ['id' => $comment->id]);
    }

    public function test_destroy_task_soft_deletes_task(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $workspace = Workspace::factory()->create(['user_id' => $user->id]);
        $board = Board::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
        ]);
        $boardList = BoardList::factory()->create(['board_id' => $board->id]);

        $task = Task::factory()->create([
            'board_list_id' => $boardList->id,
            'user_id' => $user->id,
        ]);

        $response = $this->deleteJson("/tasks/{$task->uuid}");

        $response->assertStatus(204);

        $this->assertSoftDeleted('tasks', ['id' => $task->id]);
    }
}


