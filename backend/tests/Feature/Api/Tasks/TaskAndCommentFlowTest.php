<?php

namespace Tests\Feature\Api\Tasks;

use App\Models\Board;
use App\Models\BoardList;
use App\Models\Task;
use App\Models\TaskAttachment;
use App\Models\TaskComment;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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

    public function test_task_attachment_store_content_and_delete_flow(): void
    {
        Storage::fake('local');

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

        $uploadResponse = $this->postJson("/tasks/{$task->uuid}/attachments", [
            'file' => UploadedFile::fake()->image('diagram.png', 200, 200),
        ]);

        $uploadResponse
            ->assertStatus(201)
            ->assertJsonPath('original_name', 'diagram.png')
            ->assertJsonPath('is_image', true);

        $attachmentUuid = (string) $uploadResponse->json('uuid');
        $attachment = TaskAttachment::query()->where('uuid', $attachmentUuid)->firstOrFail();

        Storage::disk('local')->assertExists($attachment->storage_path);

        $showResponse = $this->getJson("/tasks/{$task->uuid}");
        $showResponse
            ->assertOk()
            ->assertJsonPath('attachments.0.uuid', $attachmentUuid);

        $contentResponse = $this->get("/tasks/{$task->uuid}/attachments/{$attachmentUuid}/content");
        $contentResponse->assertStatus(200);
        $this->assertStringContainsString('image/', (string) $contentResponse->headers->get('Content-Type'));

        $deleteResponse = $this->deleteJson("/tasks/{$task->uuid}/attachments/{$attachmentUuid}");
        $deleteResponse->assertStatus(204);

        $this->assertSoftDeleted('task_attachments', ['id' => $attachment->id]);
    }

    public function test_task_attachment_upload_rejects_blocked_extension(): void
    {
        Storage::fake('local');

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

        $response = $this->postJson("/tasks/{$task->uuid}/attachments", [
            'file' => UploadedFile::fake()->create('dangerous.exe', 20, 'application/octet-stream'),
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    public function test_task_attachment_content_requires_workspace_access(): void
    {
        Storage::fake('local');

        $owner = User::factory()->create();
        Passport::actingAs($owner);

        $workspace = Workspace::factory()->create(['user_id' => $owner->id]);
        $board = Board::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
        ]);
        $boardList = BoardList::factory()->create(['board_id' => $board->id]);

        $task = Task::factory()->create([
            'board_list_id' => $boardList->id,
            'user_id' => $owner->id,
        ]);

        $attachmentResponse = $this->postJson("/tasks/{$task->uuid}/attachments", [
            'file' => UploadedFile::fake()->create('notes.txt', 10, 'text/plain'),
        ])->assertStatus(201);

        $attachmentUuid = (string) $attachmentResponse->json('uuid');

        $outsider = User::factory()->create();
        Passport::actingAs($outsider);

        $response = $this->getJson("/tasks/{$task->uuid}/attachments/{$attachmentUuid}/content");
        $response->assertStatus(422);
    }
}

