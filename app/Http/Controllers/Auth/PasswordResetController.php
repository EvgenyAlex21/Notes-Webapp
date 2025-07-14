<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class PasswordResetController extends Controller
{
    /**
     * @return \Illuminate\View\View
     */
    public function showForgotPasswordForm()
    {
        return view('auth.forgot-password');
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ], [
            'email.required' => 'Пожалуйста, введите ваш email',
            'email.email' => 'Пожалуйста, введите корректный email адрес',
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status == Password::RESET_LINK_SENT) {
            return back()->with('status', 'На ваш email отправлена ссылка для сброса пароля.');
        }

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }

    /**
     * @param  string  $token
     * @return \Illuminate\View\View
     */
    public function showResetPasswordForm(Request $request, $token)
    {
        return view('auth.reset-password', [
            'token' => $token,
            'email' => $request->email,
        ]);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function resetPassword(Request $request)
    {
        $messages = [
            'token.required' => 'Недействительный токен для сброса пароля',
            'email.required' => 'Пожалуйста, введите ваш email',
            'email.email' => 'Пожалуйста, введите корректный email адрес',
            'password.required' => 'Пожалуйста, введите новый пароль',
            'password.confirmed' => 'Пароли не совпадают',
            'password.min' => 'Пароль должен содержать минимум 8 символов',
            'password.regex' => 'Пароль должен содержать как минимум одну заглавную букву, одну строчную букву и одну цифру',
        ];

        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => [
                'required',
                'confirmed',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
            ],
        ], $messages);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->password = bcrypt($password);
                $user->setRememberToken(Str::random(60));
                $user->save();

                event(new PasswordReset($user));
            }
        );

        if ($status == Password::PASSWORD_RESET) {
            return redirect()->route('login')->with('status', 'Ваш пароль был успешно сброшен. Теперь вы можете войти в систему.');
        }

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }
}