<?php

namespace App\Console\Commands;

use App\Models\Board;
use App\Models\BoardList;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Exception;
use Illuminate\Console\Command;

class Fun extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fun:fill';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     *
     * @return int
     * @throws Exception
     */
    public function handle(): int
    {
        $this->info('Starting to populate the database...');

        // Create a bunch of users
        User::factory()->count(100)->create()->each(function ($user, $userIndex) {
            $this->info("Creating workspaces for user " . ($userIndex + 1) . "/100");

            // For each user, create 2-10 workspaces
            Workspace::factory()->count(random_int(2, 10))->create(['user_id' => $user->id])
                ->each(function ($workspace, $workspaceIndex) use ($user) {
                    $this->line(" - Creating boards and members for workspace " . ($workspaceIndex + 1) . "/10");

                    // Randomly add 2-10 workspace members (excluding the primary user)
                    User::inRandomOrder()->where('id', '!=', $user->id)->take(random_int(2, 10))->get()
                        ->each(function ($workspaceUser) use ($workspace) {
                            WorkspaceMember::factory()->create([
                                'workspace_id' => $workspace->id,
                                'user_id' => $workspaceUser->id,
                            ]);
                        });

                    // For each workspace, create 20-30 boards
                    Board::factory()->count(random_int(20, 30))->create(['workspace_id' => $workspace->id, 'user_id' => $user->id])
                        ->each(function ($board, $boardIndex) use ($user) {
                            $this->line("   - Creating board lists for board " . ($boardIndex + 1) . "/30");
                            $boardListPosition = 1;

                            // For each board, create 2-8 board lists
                            BoardList::factory()->count(random_int(2, 8))->make()->each(function ($boardList) use ($board, &$boardListPosition, $user) {
                                $boardList->position = $boardListPosition++;
                                $boardList->board_id = $board->id;
                                $boardList->save();

                                $taskPosition = 1;

                                // For each board list, create 5-50 tasks
                                Task::factory()->count(random_int(5, 50))->make()->each(function ($task) use ($boardList, &$taskPosition, $user) {
                                    $task->position = $taskPosition++;
                                    $task->board_list_id = $boardList->id;
                                    $task->user_id = $user->id;
                                    $task->save();
                                });
                            });
                        });
                });
        });

        $this->info('Database population complete!');
        return Command::SUCCESS;
    }

}
