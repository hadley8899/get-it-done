<?php

namespace App\Core\Services\Auth;

use App\Http\Requests\Auth\UpdateUserRequest;
use App\Http\Resources\User\UserDetailsResource;
use App\Models\User;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Intervention\Image\Facades\Image;

class UserUpdateService
{
    /**
     * @param UpdateUserRequest $request
     * @return JsonResponse
     * @throws ValidationException
     */
    public function updateUser(UpdateUserRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $user = AuthHelper::getLoggedInUser();

            if ($user === null) {
                throw ValidationException::withMessages(['user' => 'User not found']);
            }

            $newEmail = $request->get('email');
            $oldEmail = $user->email;

            if ($newEmail !== $oldEmail) {
                // Check if the email exists
                $existingUsers = User::where('email', $newEmail)->count();

                if ($existingUsers > 0) {
                    throw ValidationException::withMessages(['user' => 'Email already in use']);
                }

                $user->email = $newEmail;
                $user->email_verified_at = null;
                $user->sendApiEmailVerificationNotification();
            }

            if ($request->hasFile('avatar')) {
                // Add your validation logic here (e.g. filetype, size)
                $imagePath = $request->file('avatar')?->store('profile', 'public');

                Image::make(public_path("storage/{$imagePath}"))
                    ->fit(1000, 1000)
                    ->save();

                $user->avatar = $imagePath;
            }

            $user->name = $request->get('name');
            $user->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => new UserDetailsResource($user),
                ],
            ]);
        } catch (Exception $e) {
            DB::rollback();

            // Log the error or handle it as per your needs
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
