<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\BoardListController;
use App\Http\Controllers\BoardTemplateController;
use App\Http\Controllers\BoardTemplateItemController;
use App\Http\Controllers\KnowledgebaseController;
use App\Http\Controllers\KnowledgebaseItemsController;
use App\Http\Controllers\TaskCommentController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\WorkspaceController;
use App\Http\Controllers\WorkspaceMembersController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::post('login', [AuthController::class, 'login'])->name('login');
Route::post('register', [AuthController::class, 'register'])->name('register');

// Details for workspace invite, Needs to be public
Route::get('workspace-members/details/{workspaceInvite:token}', [WorkspaceMembersController::class, 'details'])->name('workspace-members.details');

Route::middleware(['auth:api'])->group(function () {

    Route::prefix('user')->group(function () {
        Route::get('details', [AuthController::class, 'userDetails']);
        Route::post('update', [AuthController::class, 'update']);
        Route::post('change-password', [AuthController::class, 'changePassword']);
        Route::get('logout', [AuthController::class, 'logout']);
    });

    Route::prefix('boards')->group(function () {
        Route::prefix('{workspace:uuid}')->group(function () {
            Route::get('', [BoardController::class, 'index'])->name('boards.index');
            Route::post('', [BoardController::class, 'store'])->name('boards.store');

            Route::prefix('{board:uuid}')->group(function () {
                Route::get('', [BoardController::class, 'show'])->name('boards.show');
                Route::put('', [BoardController::class, 'update'])->name('boards.update');
                Route::delete('', [BoardController::class, 'destroy'])->name('boards.destroy');

                Route::get('boardLists', [BoardListController::class, 'listsForBoard'])->name('boards.lists');
                Route::get('boardListsNoTasks', [BoardListController::class, 'listsForBoardNoTasks'])->name('boards.lists.no-tasks');
                Route::post('boardLists', [BoardListController::class, 'store'])->name('boards.lists');
                Route::post('boardLists/reorder', [BoardListController::class, 'reorderLists'])->name('boards.lists');
                Route::post('boardLists/move-task', [BoardListController::class, 'moveTask'])->name('boards.lists.move');
                Route::post('boardLists/{boardList:uuid}/reorder-tasks', [BoardListController::class, 'reorderTasks'])->name('boards.lists.reorder-tasks');
                Route::delete('boardLists/{boardList:uuid}', [BoardListController::class, 'destroy'])->name('boards.lists.destroy');
                Route::put('boardLists/{boardList:uuid}', [BoardListController::class, 'update'])->name('boards.lists.update');

                Route::post('{boardList:uuid}/tasks', [TaskController::class, 'store'])->name('boards.lists.tasks.store');
            });
        });
    });

    Route::prefix('board-templates')->group(function () {
        Route::get('', [BoardTemplateController::class, 'index'])->name('board-templates.index');
        Route::post('', [BoardTemplateController::class, 'store'])->name('board-templates.store');
        Route::get('{boardTemplate:uuid}', [BoardTemplateController::class, 'show'])->name('board-templates.show');
        Route::put('{boardTemplate:uuid}', [BoardTemplateController::class, 'update'])->name('board-templates.update');
        Route::delete('{boardTemplate:uuid}', [BoardTemplateController::class, 'destroy'])->name('board-templates.destroy');

        Route::prefix('items/{boardTemplate:uuid}')->group(function() {
            Route::get('', [BoardTemplateItemController::class, 'index'])->name('board-templates.items.index');
            Route::post('reorder', [BoardTemplateItemController::class, 'reorder'])->name('board-templates.items.reorder');
            Route::get('{boardTemplateItem:uuid}', [BoardTemplateItemController::class, 'show'])->name('board-templates.items.show');
            Route::post('', [BoardTemplateItemController::class, 'store'])->name('board-templates.items.store');
            Route::put('{boardTemplateItem:uuid}', [BoardTemplateItemController::class, 'update'])->name('board-templates.items.update');
            Route::delete('{boardTemplateItem:uuid}', [BoardTemplateItemController::class, 'destroy'])->name('board-templates.items.destroy');
        });
    });

    Route::prefix('workspaces')->group(function () {
        Route::get('', [WorkspaceController::class, 'index'])->name('workspaces.index');
        Route::post('', [WorkspaceController::class, 'store'])->name('workspaces.store');
        Route::get('{workspace:uuid}', [WorkspaceController::class, 'show'])->name('workspaces.show');
        Route::put('{workspace:uuid}', [WorkspaceController::class, 'update'])->name('workspaces.update');
        Route::delete('{workspace:uuid}', [WorkspaceController::class, 'destroy'])->name('workspaces.destroy');

        Route::get('{workspace:uuid}/members', [WorkspaceMembersController::class, 'index'])->name('workspace-members.index');
    });

    Route::prefix('tasks/{task:uuid}')->group(function () {
        Route::get('', [TaskController::class, 'show'])->name('tasks.show');
        Route::put('', [TaskController::class, 'update'])->name('tasks.update');
        Route::delete('', [TaskController::class, 'destroy'])->name('tasks.destroy');

        Route::prefix('comments')->group(function () {
            Route::get('', [TaskCommentController::class, 'index'])->name('tasks.comments');
            Route::post('', [TaskCommentController::class, 'store'])->name('tasks.comments.store');
            Route::put('{taskComment:uuid}', [TaskCommentController::class, 'update'])->name('tasks.comments.update');
            Route::delete('{taskComment:uuid}', [TaskCommentController::class, 'destroy'])->name('tasks.comments.destroy');
        });
    });

    Route::prefix('workspace-members')->group(function () {
        Route::post('invite', [WorkspaceMembersController::class, 'invite'])->name('workspace-members.invite');
        Route::get('accept/{workspaceInvite:token}', [WorkspaceMembersController::class, 'accept'])->name('workspace-members.accept');
    });

    Route::prefix('knowledgebase/{workspace:uuid}')->group(function () {
        Route::prefix('categories')->group(function () {
            Route::get('', [KnowledgebaseController::class, 'categories'])->name('knowledgebase.categories');
            Route::get('{knowledgebaseCategory:uuid}', [KnowledgebaseController::class, 'category'])->name('knowledgebase.category');
            Route::put('{knowledgebaseCategory:uuid}', [KnowledgebaseController::class, 'updateCategory'])->name('knowledgebase.category.update');
            Route::post('', [KnowledgebaseController::class, 'storeCategory'])->name('knowledgebase.category.store');
            Route::get('{knowledgebaseCategory:uuid}/children', [KnowledgebaseController::class, 'categoryChildren'])->name('knowledgebase.categories.children');
            Route::delete('{knowledgebaseCategory:uuid}', [KnowledgebaseController::class, 'destroyCategory'])->name('knowledgebase.category.destroy');
        });

        Route::prefix('{knowledgebaseCategory:uuid}/knowledgebases')->group(function () {
            Route::get('', [KnowledgebaseController::class, 'knowledgebases'])->name('knowledgebase.knowledgebases');
            Route::get('{knowledgebase:uuid}', [KnowledgebaseController::class, 'knowledgebase'])->name('knowledgebase.knowledgebase');
            Route::post('', [KnowledgebaseController::class, 'storeKnowledgebase'])->name('knowledgebase.knowledgebase.store');
            Route::put('{knowledgebase:uuid}', [KnowledgebaseController::class, 'updateKnowledgebase'])->name('knowledgebase.knowledgebase.update');
            Route::delete('{knowledgebase:uuid}', [KnowledgebaseController::class, 'destroyKnowledgebase'])->name('knowledgebase.knowledgebase.destroy');

            Route::prefix('{knowledgebase:uuid}/items')->group(function () {
                Route::get('', [KnowledgebaseItemsController::class, 'items'])->name('knowledgebase.items');
                Route::get('{knowledgebaseItem:uuid}', [KnowledgebaseItemsController::class, 'item'])->name('knowledgebase.item');
                Route::post('', [KnowledgebaseItemsController::class, 'storeItem'])->name('knowledgebase.item.store');
                Route::put('{knowledgebaseItem:uuid}', [KnowledgebaseItemsController::class, 'updateItem'])->name('knowledgebase.item.update');
                Route::delete('{knowledgebaseItem:uuid}', [KnowledgebaseItemsController::class, 'destroyItem'])->name('knowledgebase.item.destroy');
            });
        });
    });
});
