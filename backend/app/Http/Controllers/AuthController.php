<?php

namespace App\Http\Controllers;

use App\Core\Services\Auth\LoginService;
use App\Core\Services\Auth\LogoutService;
use App\Core\Services\Auth\RegisterService;
use App\Core\Services\Auth\UserChangePasswordService;
use App\Core\Services\Auth\UserDetailsService;
use App\Core\Services\Auth\UserUpdateService;
use App\Exceptions\UserException;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\ResetPasswordRequest as ResetPasswordFormRequest;
use App\Http\Requests\Auth\RegisterUserRequest;
use App\Http\Requests\Auth\UpdateUserRequest;
use App\Http\Resources\User\UserDetailsResource;
use App\Models\User;
use App\Notifications\PasswordResetRequest as PasswordResetRequestNotification;
use App\Notifications\PasswordResetSuccess;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login API
     * @param LoginRequest $request
     * @return JsonResponse
     * @throws UserException
     */
    public function login(LoginRequest $request): JsonResponse
    {
        return (new LoginService())->login($request);
    }

    /**
     * Register API
     *
     * @param RegisterUserRequest $request
     * @return JsonResponse
     * @throws ValidationException
     */
    public function register(RegisterUserRequest $request): JsonResponse
    {
        return (new RegisterService())->register($request);
    }

    public function verifyEmail(Request $request, int $id, string $hash): JsonResponse
    {
        /** @var User|null $user */
        $user = User::query()->find($id);

        if ($user === null || !hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            throw ValidationException::withMessages([
                'email' => ['Invalid verification link.'],
            ]);
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        return response()->json(['success' => true]);
    }

    /**
     * @param UpdateUserRequest $request
     * @return JsonResponse
     * @throws ValidationException
     */
    public function update(UpdateUserRequest $request): JsonResponse
    {
        return (new UserUpdateService())->updateUser($request);
    }

    /**
     * @return UserDetailsResource
     */
    public function userDetails(): UserDetailsResource
    {
        return (new UserDetailsService())->userDetails();
    }

    /**
     * @param ChangePasswordRequest $request
     * @return JsonResponse
     * @throws ValidationException
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        return (new UserChangePasswordService())->changePassword($request);
    }

    /**
     * @return JsonResponse
     */
    public function logout(): JsonResponse
    {
        return (new LogoutService())->logout();
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        /** @var User|null $user */
        $user = User::query()->where('email', '=', $request->string('email'))->first();

        // Return success even when user does not exist to avoid email enumeration.
        if ($user === null) {
            return response()->json(['success' => true]);
        }

        $token = Password::broker()->createToken($user);
        $user->notify(new PasswordResetRequestNotification($token));

        return response()->json(['success' => true]);
    }

    public function forgotPasswordFind(string $token): JsonResponse
    {
        $tokenIsValid = false;

        User::query()->select(['id', 'email', 'password'])->chunk(200, static function ($users) use ($token, &$tokenIsValid) {
            foreach ($users as $user) {
                if (Password::broker()->tokenExists($user, $token)) {
                    $tokenIsValid = true;
                    return false;
                }
            }

            return true;
        });

        if (!$tokenIsValid) {
            throw ValidationException::withMessages([
                'token' => ['Invalid or expired reset token.'],
            ]);
        }

        return response()->json(['success' => true]);
    }

    /**
     * @throws ValidationException
     */
    public function resetForgottenPassword(ResetPasswordFormRequest $request): JsonResponse
    {
        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            static function (User $user, string $password) {
                $user->password = bcrypt($password);
                $user->setRememberToken(Str::random(60));
                $user->save();
                $user->notify(new PasswordResetSuccess());
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [trans($status)],
            ]);
        }

        return response()->json(['success' => true]);
    }
}
