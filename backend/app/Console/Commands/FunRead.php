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

class FunRead extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fun:read';

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
        $count = 0;

        while ($count !== 500) {
            // Display count of users
            $this->info('User count: ' . User::query()->count());
            // Display count of boards
            $this->info('Board count: ' . Board::query()->count());
            // Display count of board lists
            $this->info('Board list count: ' . BoardList::query()->count());
            // Display count of tasks
            $this->info('Task count: ' . Task::query()->count());
            // Display count of workspaces
            $this->info('Workspace count: ' . Workspace::query()->count());
            // Display count of workspace members
            $this->info('Workspace member count: ' . WorkspaceMember::query()->count());

            $count++;
            sleep(2);
        }

        return Command::SUCCESS;
    }

}
