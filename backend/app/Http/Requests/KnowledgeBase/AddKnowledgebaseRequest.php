<?php

namespace App\Http\Requests\KnowledgeBase;

use App\Core\Services\Auth\AuthHelper;
use App\Core\Services\Workspace\WorkspacePermissionService;
use App\Models\Workspace;
use Illuminate\Foundation\Http\FormRequest;

class AddKnowledgebaseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        /** @var Workspace $workspace */
        $workspace = $this->route('workspace');

        // Check if the user has access to this workspace
        if (!WorkspacePermissionService::userHasAccessToWorkspace(AuthHelper::getLoggedInUser(), $workspace)) {
            return false;
        }

        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'position' => ['nullable', 'integer'],
        ];
    }
}
