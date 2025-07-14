<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    /**
     * @return \Illuminate\View\View
     */
    public function showLoginForm()
    {
        return view('auth.login');
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function login(Request $request)
    {
        $messages = [
            'login.required' => 'Пожалуйста, введите ваш email или логин',
            'password.required' => 'Пожалуйста, введите пароль',
        ];

        $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ], $messages);

        $loginField = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
        $loginValue = $request->login;

        $user = \App\Models\User::where($loginField, $loginValue)->first();
        
        if (!$user) {
            throw ValidationException::withMessages([
                'login' => $loginField === 'email' 
                    ? 'Пользователь с таким email не найден' 
                    : 'Пользователь с таким логином не найден',
            ]);
        }

        if (!Auth::attempt([$loginField => $loginValue, 'password' => $request->password], $request->boolean('remember'))) {
            $attempt = session('login_attempts', 0) + 1;
            session(['login_attempts' => $attempt]);
            
            throw ValidationException::withMessages([
                'password' => 'Неверный пароль',
            ]);
        }

        if (session()->has('login_attempts') && session('login_attempts') > 5) {
            throw ValidationException::withMessages([
                'login' => 'Слишком много попыток входа. Пожалуйста, попробуйте позже.',
            ]);
        }

        session()->forget('login_attempts');
        $request->session()->regenerate();

        return redirect()->intended(route('notes.index'));
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}