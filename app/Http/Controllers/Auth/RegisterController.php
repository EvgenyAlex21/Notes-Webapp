<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\Events\Registered;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class RegisterController extends Controller
{
    /**
     * @return \Illuminate\View\View
     */
    public function showRegistrationForm()
    {
        return view('auth.register');
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function register(Request $request)
    {
        $messages = [
            'name.required' => 'Пожалуйста, введите ваше имя',
            'name.max' => 'Имя не должно превышать 255 символов',
            'username.required' => 'Пожалуйста, введите ваш логин',
            'username.min' => 'Логин должен содержать минимум 3 символа',
            'username.max' => 'Логин не должен превышать 30 символов',
            'username.unique' => 'Этот логин уже занят',
            'username.regex' => 'Логин может содержать только буквы, цифры и символы подчеркивания',
            'email.required' => 'Пожалуйста, введите ваш email',
            'email.email' => 'Пожалуйста, введите корректный email адрес',
            'email.unique' => 'Этот email уже зарегистрирован',
            'password.required' => 'Пожалуйста, введите пароль',
            'password.confirmed' => 'Пароли не совпадают',
            'password.min' => 'Пароль должен содержать минимум 8 символов',
            'password.regex' => 'Пароль должен содержать как минимум одну заглавную букву, одну строчную букву и одну цифру',
        ];

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'min:3',
                'max:30',
                'unique:users',
                'regex:/^[a-zA-Z0-9_]+$/'
            ],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => [
                'required', 
                'confirmed', 
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/'
            ],
        ], $messages);

        if (mb_strlen($request->password) < 8) {
            throw ValidationException::withMessages([
                'password' => 'Пароль должен содержать минимум 8 символов',
            ]);
        }

        if (!preg_match('/[A-Z]/', $request->password)) {
            throw ValidationException::withMessages([
                'password' => 'Пароль должен содержать хотя бы одну заглавную букву',
            ]);
        }

        if (!preg_match('/[a-z]/', $request->password)) {
            throw ValidationException::withMessages([
                'password' => 'Пароль должен содержать хотя бы одну строчную букву',
            ]);
        }

        if (!preg_match('/\d/', $request->password)) {
            throw ValidationException::withMessages([
                'password' => 'Пароль должен содержать хотя бы одну цифру',
            ]);
        }

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('notes.index');
    }
}